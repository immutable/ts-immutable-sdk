import {
  CreateTransferResponseV1,
  ExchangesApi,
  StarkSigner,
  UnsignedExchangeTransferRequest,
} from '@imtbl/core-sdk';
import { convertToSignableToken } from 'modules/provider/signable-actions/utils';
import { PassportErrorType, withPassportError } from '../errors/passportError';
import { UserWithEtherKey } from '../types';

type TransfersParams = {
  user: UserWithEtherKey;
  starkSigner: StarkSigner;
  request: UnsignedExchangeTransferRequest;
  exchangesApi: ExchangesApi;
};

export async function exchangeTransfer({
  user,
  starkSigner,
  request,
  exchangesApi,
}: TransfersParams): Promise<CreateTransferResponseV1> {
  return withPassportError<CreateTransferResponseV1>(async () => {
    const ethAddress = user.etherKey;

    const transferAmount = request.amount;
    const signableResult = await exchangesApi.getExchangeSignableTransfer({
      id: request.transactionID,
      getSignableTransferRequest: {
        sender: ethAddress,
        token: convertToSignableToken(request),
        amount: transferAmount,
        receiver: request.receiver,
      },
    });
    const starkAddress = await starkSigner.getAddress();
    const { payload_hash: payloadHash } = signableResult.data;
    const starkSignature = await starkSigner.signMessage(payloadHash);

    const transferSigningParams = {
      sender_stark_key: signableResult.data.sender_stark_key || starkAddress,
      sender_vault_id: signableResult.data.sender_vault_id,
      receiver_stark_key: signableResult.data.receiver_stark_key,
      receiver_vault_id: signableResult.data.receiver_vault_id,
      asset_id: signableResult.data.asset_id,
      amount: signableResult.data.amount,
      nonce: signableResult.data.nonce,
      expiration_timestamp: signableResult.data.expiration_timestamp,
      stark_signature: starkSignature,
    };

    const response = await exchangesApi.createExchangeTransfer({
      id: request.transactionID,
      createTransferRequest: transferSigningParams,
      // Notes[ID-451]: this is 2 params to bypass the Client non-empty check,
      // Should be able to remove it once the Backend have update the API
      // and generated the New Client
      xImxEthAddress: '',
      xImxEthSignature: '',
    });

    return {
      sent_signature: response?.data.sent_signature,
      status: response?.data.status?.toString(),
      time: response?.data.time,
      transfer_id: response?.data.transfer_id,
    };
  }, PassportErrorType.EXCHANGE_TRANSFER_ERROR);
}
