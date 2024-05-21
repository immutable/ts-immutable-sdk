/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import { BlockchainData as Types } from '@imtbl/generated-clients';
import { BlockchainData } from '@imtbl/blockchain-data';
import { CreateMintRequest, MintRequest, MintingPersistence } from './persistence/type';
import { Logger } from './logger/type';
import { trackProcessMint, trackRecordMint, trackSubmitMintingRequests } from './analytics';

// TODO: expose metrics
//       - submitting status count, conflicting status count
//       - failed events count

export const recordMint = async (
  mintingPersistence: MintingPersistence,
  mintRequest: CreateMintRequest
) => {
  trackRecordMint();
  mintingPersistence.recordMint(mintRequest);
};

const defaultMintingDelay = 1000;
// This function can be called in different node process and will run in parallel to mint assets.
// Each process will NOT mint the same asset.
// Monitor your database to see if parallel processes are saturating the database CPU and triggering excessive vacuuming.
// default batch size will be treated as 100 when it exceeds 100 because minting API has a limit of 100 assets per request.
export const submitMintingRequests = async (
  mintingPersistence: MintingPersistence,
  blockchainDataSDKClient: BlockchainData,
  {
    defaultBatchSize = 1000,
    chainName = 'imtbl-zkevm-testnet',
    maxNumberOfTries = 3,
  },
  logger: Logger = console
) => {
  trackSubmitMintingRequests();
  let mintingResponse: Types.CreateMintRequestResult | undefined;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await new Promise((resolve) => {
      setTimeout(resolve, defaultMintingDelay);
    });

    let batchSize = Math.min(
      mintingResponse?.imx_remaining_mint_requests
        ? parseInt(mintingResponse.imx_remaining_mint_requests, 10)
        : defaultBatchSize,
      defaultBatchSize
    );

    if (
      batchSize === 0
      && mintingResponse
      && new Date(mintingResponse.imx_mint_requests_limit_reset) > new Date()
    ) {
      logger.info(
        `minting limit reached, waiting for reset at ${mintingResponse?.imx_mint_requests_limit_reset}`
      );
      continue;
    }

    if (batchSize === 0) {
      logger.info(
        `minting limit has been reset, use default batch size: ${defaultBatchSize}`
      );
      mintingResponse = undefined;
      batchSize = defaultBatchSize;
    }

    // get mints to be submitted
    const pendingMints = await mintingPersistence.getNextBatchForSubmission(
      batchSize
    );

    if (pendingMints.length === 0) {
      logger.info('no assets to mint');
      continue;
    }

    // chunk assets by every 100 assets. every chunk should all be for the same contract address.
    const chunkedAssets = pendingMints.sort(
      (a, b) => (a.contract_address > b.contract_address ? 1 : -1)
    ).reduce((acc, row) => {
      if (acc.length === 0) {
        return [{ contractAddress: row.contract_address, assets: [row] }];
      }
      const lastBatch = acc[acc.length - 1];
      if (lastBatch.contractAddress === row.contract_address && lastBatch.assets.length < 100) {
        return [...acc.slice(0, -1), { ...lastBatch, assets: [...lastBatch.assets, row] }];
      }
      return [...acc, { contractAddress: row.contract_address, assets: [row] }];
    }, [] as { assets: MintRequest[], contractAddress: string }[]);

    // submit minting request for each contract address in parallel
    const mintingResults = await Promise.allSettled<Types.CreateMintRequestResult>(
      chunkedAssets.map(
        async ({ contractAddress, assets }) => {
          const mintingRequest = {
            chainName,
            contractAddress,
            createMintRequestRequest: {
              assets: assets.map((row) => ({
                reference_id: row.asset_id,
                owner_address: row.owner_address,
                metadata: row.metadata,
              })),
            },
          };

          try {
            const response = await blockchainDataSDKClient.createMintRequest(
              mintingRequest
            );
            logger.info(
              `mintingResponse: ${JSON.stringify(response, null, 2)}`
            );
            // update minting status to submitted
            await mintingPersistence.updateMintingStatusToSubmitted(
              assets.map(({ id }) => id)
            );
            return response;
          } catch (e: any) {
            logger.error(e);

            if (
              e.code === 'CONFLICT_ERROR'
              && e.details?.id === 'reference_id'
            ) {
              try {
                // mark the assets as conflicting, so that we don't send them again.
                await mintingPersistence.markAsConflict(
                  e.details.values,
                  contractAddress,
                );

                // remove non conflicting assets status so that they can be retried.
                await mintingPersistence.resetMintingStatus(
                  assets
                    .map(({ id }) => id)
                    .filter((id) => !e.details.values.includes(id))
                );
              } catch (e2) {
                logger.error(e2);
              }
            } else {
              // separate assets into "need to be retied" and "exceeded max number of tries."
              const { assetsToRetry, assetsExceededMaxNumberOfTries } = assets.reduce(
                (acc, { tried_count = 0, id }) => {
                  if (tried_count < maxNumberOfTries) {
                    acc.assetsToRetry.push(id);
                  } else {
                    acc.assetsExceededMaxNumberOfTries.push(id);
                  }
                  return acc;
                },
                {
                  assetsToRetry: [],
                  assetsExceededMaxNumberOfTries: [],
                } as {
                  assetsToRetry: string[];
                  assetsExceededMaxNumberOfTries: string[];
                }
              );

              // remove all assets status so that they can be retried.
              await mintingPersistence.markForRetry(
                assetsToRetry
              );

              // mark assets that have exceeded the max number of tries as submission_failed
              await mintingPersistence.updateMintingStatusToSubmissionFailed(
                assetsExceededMaxNumberOfTries
              );
            }
            return e;
          }
        }
      )
    );
    mintingResponse = mintingResults
      .reverse()
      .find(
        (r: any): r is PromiseFulfilledResult<Types.CreateMintRequestResult> => r.status === 'fulfilled'
      )?.value;
  }
};

export type MintRequestEvent = {
  event_name: string;
  chain: string;
  event_id: string;
  data: {
    chain: {
      id: string;
      name: string;
    },
    contract_address: string;
    owner_address: string;
    reference_id: string;
    metadata_id: string;
    token_id: string | null;
    status: string;
    transaction_hash: string | null;
    activity_id: string | null;
    error: {
      code: string;
      message: string;
    } | null;
    created_at: string;
    updated_at: string;
  }
};

export const processMint = async (
  mintingPersistence: MintingPersistence,
  event: MintRequestEvent,
  logger: Logger = console
) => {
  trackProcessMint();
  if (event.event_name !== 'imtbl_zkevm_mint_request_updated') {
    logger.info(
      `${event.event_name} is not imtbl_zkevm_mint_request_updated, skip.`
    );
    return;
  }

  const referenceId = event.data.reference_id;
  if (!referenceId) {
    throw new Error('reference_id not found in webhook event');
  }

  const contractAddress = event.data.contract_address;
  if (!contractAddress) {
    throw new Error('contract_address not found in webhook event');
  }

  if (event.data.status === 'failed') {
    logger.error(`mint failed: ${JSON.stringify(event.data, null, 2)}`);
  }

  const mintReq = await mintingPersistence.getMintingRequest(
    contractAddress,
    referenceId
  );
  if (!mintReq) {
    logger.info(
      `minting request not found in the database, ${JSON.stringify(event.data)}`
    );
  }

  const ownerAddress = mintReq?.wallet_address || event.data.owner_address;
  if (!ownerAddress) {
    logger.error('owner_address missing');
    throw new Error('owner_address missing');
  }

  await mintingPersistence.syncMintingStatus({
    tokenId: event.data.token_id,
    status: event.data.status,
    assetId: referenceId,
    contractAddress,
    ownerAddress,
    metadataId: event.data.metadata_id,
    imtblZkevmMintRequestUpdatedId: event.event_id,
    error: event.data.error ? JSON.stringify(event.data.error) : null,
  });
};
