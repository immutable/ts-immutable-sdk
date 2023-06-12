/* eslint-disable @typescript-eslint/naming-convention */
import {
  TransfersApi,
  CreateTransferResponse,
} from '@imtbl/generated-clients/src/imx';
import {
  NftTransferDetails,
  UnsignedTransferRequest,
  WalletConnection,
} from '../types';
import { signRaw } from '../utils';
import { convertToSignableToken } from '../utils/convertToSignableToken';

type TransfersWorkflowParams = WalletConnection & {
  request: UnsignedTransferRequest;
  transfersApi: TransfersApi;
};

type BatchTransfersWorkflowParams = WalletConnection & {
  request: Array<NftTransferDetails>;
  transfersApi: TransfersApi;
};

export async function transfersWorkflow({
  ethSigner,
  starkSigner,
  request,
  transfersApi,
}: TransfersWorkflowParams): Promise<CreateTransferResponse> {
  const ethAddress = await ethSigner.getAddress();

  const transferAmount = request.type === 'ERC721' ? '1' : request.amount;
  const signableResult = await transfersApi.getSignableTransferV1({
    getSignableTransferRequest: {
      sender: ethAddress,
      token: convertToSignableToken(request),
      amount: transferAmount,
      receiver: request.receiver,
    },
  });

  const {
    signable_message: signableMessage,
    signable_responses: signableResponses,
    sender_stark_key: senderStarkKey,
  } = signableResult.data;

  const ethSignature = await signRaw(signableMessage, ethSigner);

  if (signableResponses.length === 0) {
    throw new Error('No transfer responses found');
  }

  const starkSignature = await starkSigner.signMessage(signableResponses[0].payload_hash);

  const transferSigningParams = {
    sender_stark_key: senderStarkKey!,
    sender_vault_id: signableResponses[0].sender_vault_id,
    receiver_stark_key: signableResponses[0].receiver_stark_key,
    receiver_vault_id: signableResponses[0].receiver_vault_id,
    asset_id: signableResponses[0].asset_id,
    amount: signableResponses[0].amount,
    nonce: signableResponses[0].nonce,
    expiration_timestamp: signableResponses[0].expiration_timestamp,
    stark_signature: starkSignature,
  };

  const response = await transfersApi.createTransferV1({
    createTransferRequest: transferSigningParams,
    xImxEthAddress: ethAddress,
    xImxEthSignature: ethSignature,
  });

  return {
    transfer_ids: response?.data.transfer_ids,
  };
}

export async function batchTransfersWorkflow({
  ethSigner,
  starkSigner,
  request,
  transfersApi,
}: BatchTransfersWorkflowParams): Promise<CreateTransferResponse> {
  const ethAddress = await ethSigner.getAddress();

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
    if (resp.payload_hash === undefined) {
      throw new Error('Missing `payload_hash`');
    }
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
