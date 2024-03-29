import { imx } from '@imtbl/generated-clients';
import {
  NftTransferDetails,
  UnsignedTransferRequest,
} from '@imtbl/x-client';
import { signRaw, convertToSignableToken } from '@imtbl/toolkit';
import { Signers } from './types';
import { validateChain } from './helpers';
import { ProviderConfiguration } from '../config';

type TransfersWorkflowParams = {
  signers: Signers;
  request: UnsignedTransferRequest;
  config: ProviderConfiguration;
};

type BatchTransfersWorkflowParams = {
  signers: Signers;
  request: Array<NftTransferDetails>;
  config: ProviderConfiguration;
};

export async function transfer({
  signers: { ethSigner, starkSigner },
  request,
  config,
}: TransfersWorkflowParams): Promise<imx.CreateTransferResponseV1> {
  await validateChain(ethSigner, config.immutableXConfig);

  const ethAddress = await ethSigner.getAddress();
  const transfersApi = new imx.TransfersApi(
    config.immutableXConfig.apiConfiguration,
  );

  const transferAmount = request.type === 'ERC721' ? '1' : request.amount;
  const signableResult = await transfersApi.getSignableTransferV1({
    getSignableTransferRequest: {
      sender: ethAddress,
      token: convertToSignableToken(request),
      amount: transferAmount,
      receiver: request.receiver,
    },
  });

  const { signable_message: signableMessage, payload_hash: payloadHash } = signableResult.data;

  const ethSignature = await signRaw(signableMessage, ethSigner);

  const starkSignature = await starkSigner.signMessage(payloadHash);

  const transferSigningParams = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sender_stark_key: signableResult.data.sender_stark_key!,
    sender_vault_id: signableResult.data.sender_vault_id,
    receiver_stark_key: signableResult.data.receiver_stark_key,
    receiver_vault_id: signableResult.data.receiver_vault_id,
    asset_id: signableResult.data.asset_id,
    amount: signableResult.data.amount,
    nonce: signableResult.data.nonce,
    expiration_timestamp: signableResult.data.expiration_timestamp,
    stark_signature: starkSignature,
  };

  const response = await transfersApi.createTransferV1({
    createTransferRequest: transferSigningParams,
    xImxEthAddress: ethAddress,
    xImxEthSignature: ethSignature,
  });

  return {
    sent_signature: response?.data.sent_signature,
    status: response?.data.status?.toString(),
    time: response?.data.time,
    transfer_id: response?.data.transfer_id,
  };
}

export async function batchTransfer({
  signers: { ethSigner, starkSigner },
  request,
  config,
}: BatchTransfersWorkflowParams): Promise<imx.CreateTransferResponse> {
  await validateChain(ethSigner, config.immutableXConfig);

  const ethAddress = await ethSigner.getAddress();
  const transfersApi = new imx.TransfersApi(
    config.immutableXConfig.apiConfiguration,
  );

  const signableRequests = request.map((nftTransfer) => ({
    amount: '1',
    token: convertToSignableToken({
      type: 'ERC721',
      tokenId: nftTransfer.tokenId,
      tokenAddress: nftTransfer.tokenAddress,
    }),
    receiver: nftTransfer.receiver,
  }));

  const signableResult = await transfersApi.getSignableTransfer({
    getSignableTransferRequestV2: {
      sender_ether_key: ethAddress,
      signable_requests: signableRequests,
    },
  });

  const signableMessage = signableResult.data.signable_message;

  if (signableMessage === undefined) {
    throw new Error('Invalid response from Signable registration offchain');
  }

  const ethSignature = await signRaw(signableMessage, ethSigner);

  const requests = [];
  for (const resp of signableResult.data.signable_responses) {
    // TODO: remove once fixed
    // eslint-disable-next-line no-await-in-loop
    const starkSignature = await starkSigner.signMessage(resp.payload_hash);
    const req = {
      sender_vault_id: resp.sender_vault_id,
      receiver_stark_key: resp.receiver_stark_key,
      receiver_vault_id: resp.receiver_vault_id,
      asset_id: resp.asset_id,
      amount: resp.amount,
      nonce: resp.nonce,
      expiration_timestamp: resp.expiration_timestamp,
      stark_signature: starkSignature,
    };
    requests.push(req);
  }

  // TODO: throw error on missing payload hash?
  const transferSigningParams = {
    sender_stark_key: signableResult.data.sender_stark_key,
    requests,
  };

  const response = await transfersApi.createTransfer({
    createTransferRequestV2: transferSigningParams,
    xImxEthAddress: ethAddress,
    xImxEthSignature: ethSignature,
  });

  return {
    transfer_ids: response?.data.transfer_ids,
  };
}
