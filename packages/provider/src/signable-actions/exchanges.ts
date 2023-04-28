import {
  CreateTransferResponseV1,
  UnsignedExchangeTransferRequest,
  ExchangesApi,
} from '@imtbl/core-sdk';
import { signRaw, convertToSignableToken } from '@imtbl/toolkit';
import { Signers } from './types';
import { validateChain } from './helpers';
import { ProviderConfiguration } from '../config';

type TransfersWorkflowParams = {
  signers: Signers;
  request: UnsignedExchangeTransferRequest;
  config: ProviderConfiguration;
};

export async function exchangeTransfer({
  signers,
  request,
  config,
}: TransfersWorkflowParams): Promise<CreateTransferResponseV1> {
  await validateChain(signers.ethSigner, config.immutableXConfig);

  const exchangeApi = new ExchangesApi(
    config.immutableXConfig.apiConfiguration
  );
  const ethAddress = await signers.ethSigner.getAddress();

  const transferAmount = request.amount;
  const signableResult = await exchangeApi.getExchangeSignableTransfer({
    id: request.transactionID,
    getSignableTransferRequest: {
      sender: ethAddress,
      token: convertToSignableToken(request),
      amount: transferAmount,
      receiver: request.receiver,
    },
  });

  const { signable_message: signableMessage, payload_hash: payloadHash } =
    signableResult.data;

  const ethSignature = await signRaw(signableMessage, signers.ethSigner);

  const starkSignature = await signers.starkSigner.signMessage(payloadHash);

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

  const response = await exchangeApi.createExchangeTransfer({
    id: request.transactionID,
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
