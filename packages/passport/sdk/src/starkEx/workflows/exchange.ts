import { imx } from '@imtbl/generated-clients';
import {
  StarkSigner,
  UnsignedExchangeTransferRequest,
} from '@imtbl/x-client';
import { convertToSignableToken } from '@imtbl/toolkit';
import { PassportErrorType, withPassportError } from '../../errors/passportError';
import { UserImx } from '../../types';

type TransfersParams = {
  user: UserImx;
  starkSigner: StarkSigner;
  request: UnsignedExchangeTransferRequest;
  exchangesApi: imx.ExchangesApi;
};

export async function exchangeTransfer({
  user,
  starkSigner,
  request,
  exchangesApi,
}: TransfersParams): Promise<imx.CreateTransferResponseV1> {
  return withPassportError<imx.CreateTransferResponseV1>(async () => {
    const { ethAddress } = user.imx;
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

    const headers = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: `Bearer ${user.accessToken}`,
    };

    const response = await exchangesApi.createExchangeTransfer(
      {
        id: request.transactionID,
        createTransferRequest: transferSigningParams,
      },
      { headers },
    );

    return {
      sent_signature: response?.data.sent_signature,
      status: response?.data.status?.toString(),
      time: response?.data.time,
      transfer_id: response?.data.transfer_id,
    };
  }, PassportErrorType.EXCHANGE_TRANSFER_ERROR);
}
