/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  CreateMintRequest, MintingPersistence, SubmittedMintRequest
} from '../type';

// client is a PrismaClient instance. it needs to be generated with
// additional schema defined inside (TODO: point to repo) file.
export const mintingPersistence = (client: any): MintingPersistence => ({
  recordMint: async (request: CreateMintRequest) => {
    const result = await client.imAssets.upsert({
      where: {
        im_assets_uindex: {
          assetId: request.asset_id, contractAddress: request.contract_address
        }
      },
      update: {}, // Do nothing on conflict
      create: {
        assetId: request.asset_id,
        contractAddress: request.contract_address,
        ownerAddress: request.owner_address,
        metadata: JSON.stringify(request.metadata), // Serialize JSON metadata
      },
    });

    // Since upsert does not throw on update and does not tell directly if it updated or inserted,
    // we need to add additional logic to handle this if "result" does not provide enough info.
    if (!result) {
      throw new Error('Duplicated mint');
    }
  },
  // WARNING: this is NOT concurrency safe. Please only call this method one at a time.
  getNextBatchForSubmission: async (limit: number) => {
    const assets = await client.imAssets.findMany({
      where: {
        mintingStatus: null
      },
      take: limit
    });

    const assetIds = assets.map((asset: { id: string; }) => asset.id);

    await client.imAssets.updateMany({
      where: {
        id: {
          in: assetIds
        }
      },
      data: {
        mintingStatus: 'submitting'
      }
    });

    const updatedAssets = await client.imAssets.findMany({
      where: {
        id: {
          in: assetIds
        }
      }
    });
    return updatedAssets.map((asset: any) => ({
      id: asset.id,
      contract_address: asset.contractAddress,
      wallet_address: asset.ownerAddress,
      asset_id: asset.assetId,
      metadata: asset.metadata ? JSON.parse(asset.metadata) : null,
      owner_address: asset.ownerAddress,
      tried_count: asset.triedCount,
    }));
  },
  updateMintingStatusToSubmitted: async (ids: string[]) => {
    await client.imAssets.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        mintingStatus: 'submitted'
      }
    });
  },
  syncMintingStatus: async (submittedMintRequest: SubmittedMintRequest) => {
    // First, attempt to retrieve the existing asset
    const existingAsset = await client.imAssets.findUnique({
      where: {
        im_assets_uindex: {
          assetId: submittedMintRequest.assetId,
          contractAddress: submittedMintRequest.contractAddress,
        },
      }
    });

    // Check if the asset exists and the condition for updating is met
    if (existingAsset && (
      existingAsset.lastImtblZkevmMintRequestUpdatedId === null
        || existingAsset.lastImtblZkevmMintRequestUpdatedId < submittedMintRequest.imtblZkevmMintRequestUpdatedId)
    ) {
      // Perform update if the existing record's lastImtblZkevmMintRequestUpdatedId is less than the new one or is null
      await client.imAssets.update({
        where: {
          im_assets_uindex: {
            assetId: submittedMintRequest.assetId,
            contractAddress: submittedMintRequest.contractAddress,
          },
        },
        data: {
          ownerAddress: submittedMintRequest.ownerAddress,
          tokenId: submittedMintRequest.tokenId,
          mintingStatus: submittedMintRequest.status,
          metadataId: submittedMintRequest.metadataId,
          lastImtblZkevmMintRequestUpdatedId: submittedMintRequest.imtblZkevmMintRequestUpdatedId,
          error: submittedMintRequest.error,
        }
      });
    } else if (!existingAsset) {
      // Perform insert if no existing record is found
      await client.imAssets.create({
        data: {
          assetId: submittedMintRequest.assetId,
          contractAddress: submittedMintRequest.contractAddress,
          ownerAddress: submittedMintRequest.ownerAddress,
          tokenId: submittedMintRequest.tokenId,
          mintingStatus: submittedMintRequest.status,
          metadataId: submittedMintRequest.metadataId,
          lastImtblZkevmMintRequestUpdatedId: submittedMintRequest.imtblZkevmMintRequestUpdatedId,
          error: submittedMintRequest.error,
        }
      });
    }
    // If existing asset does not meet the update condition, do nothing
  },
  updateMintingStatusToSubmissionFailed: async (ids: string[]) => {
    await client.imAssets.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        mintingStatus: 'submission_failed'
      }
    });
  },
  markAsConflict: async (assetIds: string[], contractAddress: string) => {
    await client.imAssets.updateMany({
      where: {
        assetId: {
          in: assetIds // Targets assets where assetId is in the provided list
        },
        contractAddress // Additional condition for contract address
      },
      data: {
        mintingStatus: 'conflicting' // Set the new status
      }
    });
  },
  resetMintingStatus: async (ids: string[]) => {
    await client.imAssets.updateMany({
      where: {
        id: {
          in: ids // Condition to match ids
        }
      },
      data: {
        mintingStatus: null // Setting minting_status to null
      }
    });
  },
  // this method is not concurrency safe
  markForRetry: async (ids: string[]) => {
    // Retrieve the current values of tried_count for the specified ids
    const assets = await client.imAssets.findMany({
      where: {
        id: {
          in: ids
        }
      },
      select: {
        id: true,
        triedCount: true // Assuming the field is named triedCount
      }
    });

    // Update each asset with the new tried_count and nullify minting_status
    for (const asset of assets) {
      await client.imAssets.update({
        where: {
          id: asset.id
        },
        data: {
          mintingStatus: null,
          triedCount: asset.triedCount + 1
        }
      });
    }
  },
  getMintingRequest: async (contractAddress: string, referenceId: string) => {
    // Retrieve the asset from the database based on contract_address and asset_id
    const asset = await client.imAssets.findFirst({
      where: {
        contractAddress,
        assetId: referenceId
      }
    });
    if (!asset) {
      return null;
    }
    return {
      asset_id: asset.assetId,
      contract_address: asset.contractAddress,
      id: asset.id,
      metadata: asset.metadata ? JSON.parse(asset.metadata) : null,
      owner_address: asset.ownerAddress,
      tried_count: asset.triedCount,
      wallet_address: asset.ownerAddress
    };
  }
});
