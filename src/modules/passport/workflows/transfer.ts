import { CreateTransferResponseV1, StarkSigner, TransfersApi, UnsignedTransferRequest, } from '@imtbl/core-sdk';
import { PassportErrorType, withPassportError, } from '../errors/passportError';
import { convertToSignableToken } from '../../../modules/provider/signable-actions/utils';
import { UserWithEtherKey } from '../types';
import { ConfirmationType, displayConfirmationScreen } from '../confirmation/confirmation';

const ERC721 = 'ERC721';

type TrasferRequest = {
  request: UnsignedTransferRequest;
  user: UserWithEtherKey;
  starkSigner: StarkSigner;
  transferApi: TransfersApi;
};

const transfer = ({
                    request,
                    transferApi,
                    starkSigner,
                    user,
                  }: TrasferRequest): Promise<CreateTransferResponseV1> => {
  return withPassportError<CreateTransferResponseV1>(async () => {
    const transferAmount = request.type === ERC721 ? '1' : request.amount;
    const signableTransferRequest = {
      sender: user.etherKey,
      token: convertToSignableToken(request),
      amount: transferAmount,
      receiver: request.receiver,
    };
    const signableResult = await transferApi.getSignableTransferV1({
      getSignableTransferRequest: signableTransferRequest,
    });


    const result = await displayConfirmationScreen({
      type: ConfirmationType.TransferV1, data: {
        sender_ether_key: user.etherKey,
        signable_requests: [{
          amount: transferAmount,
          token: convertToSignableToken(request),
          receiver: request.receiver
        }]
      }
    });

    if (!result.confirmed) {
      throw new Error("Transaction rejected by user");
    }

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
      Authorization: 'Bearer ' + user.accessToken,
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
