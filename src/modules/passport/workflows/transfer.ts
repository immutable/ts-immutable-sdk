import {
  CreateTransferResponseV1,
  StarkSigner,
  TransfersApi,
  UnsignedTransferRequest,
} from '@imtbl/core-sdk';
import {
  PassportErrorType,
  withPassportError,
} from 'modules/passport/errors/passportError';
import { convertToSignableToken } from 'modules/provider/signable-actions/utils';
import { JWT } from '../imxProvider/passportImxProvider';

const ERC721 = 'ERC721';

type TrasferRequest = {
  request: UnsignedTransferRequest;
  jwt: JWT;
  starkSigner: StarkSigner;
  ethAddress: string;
  transferApi: TransfersApi;
};

const transfer = ({
  ethAddress,
  request,
  transferApi,
  starkSigner,
  jwt,
}: TrasferRequest) => {
  return withPassportError<CreateTransferResponseV1>(async () => {
    const transferAmount = request.type === ERC721 ? '1' : request.amount;
    const signableResult = await transferApi.getSignableTransferV1({
      getSignableTransferRequest: {
        sender: ethAddress,
        token: convertToSignableToken(request),
        amount: transferAmount,
        receiver: request.receiver,
      },
    });

    const signableResultData = signableResult.data;
    const { payload_hash: payloadHash } = signableResultData;
    const starkSignature = await starkSigner.signMessage(payloadHash);
    const senderStarkKey = await starkSigner.getAddress();

    const transferSigningParams = {
      sender_stark_key: signableResultData.sender_stark_key || senderStarkKey,
      sender_vault_id: signableResultData.sender_vault_id,
      receiver_stark_key: signableResultData.receiver_stark_key,
      receiver_vault_id: signableResultData.receiver_vault_id,
      asset_id: signableResultData.asset_id,
      amount: signableResultData.amount,
      nonce: signableResultData.nonce,
      expiration_timestamp: signableResultData.expiration_timestamp,
      stark_signature: starkSignature,
    };

    const createTransferRequest = {
      createTransferRequest: transferSigningParams,
    };

    const headers = {
      Authorization: 'Bearer ' + jwt.accessToken,
    };

    const { data: responseData } = await transferApi.createTransferV1(
      createTransferRequest,
      { headers }
    );

    return {
      sent_signature: responseData.sent_signature,
      status: responseData.status?.toString(),
      time: responseData.time,
      transfer_id: responseData.transfer_id,
    };
  }, PassportErrorType.TRANSFER_ERROR);
};

export default transfer;
