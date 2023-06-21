import {
  CreateTransferResponse,
  CreateTransferResponseV1,
  GetSignableTransferRequest,
  GetSignableTransferRequestV1,
  NftTransferDetails,
  SignableTransferDetails,
  StarkSigner,
  TransfersApi,
  UnsignedTransferRequest,
} from '@imtbl/core-sdk';
import { convertToSignableToken } from '@imtbl/toolkit';
import { PassportErrorType, withPassportError } from '../../errors/passportError';
import { UserWithEtherKey } from '../../types';
import GuardianClient from '../guardian';

const ERC721 = 'ERC721';

type TransferRequest = {
  request: UnsignedTransferRequest;
  user: UserWithEtherKey;
  starkSigner: StarkSigner;
  transfersApi: TransfersApi;
  guardianClient: GuardianClient;
};

type BatchTransfersParams = {
  request: Array<NftTransferDetails>;
  user: UserWithEtherKey;
  starkSigner: StarkSigner;
  transfersApi: TransfersApi;
  guardianClient: GuardianClient;
};

export async function transfer({
  request,
  transfersApi,
  starkSigner,
  user,
  guardianClient,
}: // TODO: remove this eslint disable once we have a better solution
// eslint-disable-next-line max-len
TransferRequest): Promise<CreateTransferResponseV1> {
  return withPassportError<CreateTransferResponseV1>(async () => {
    const transferAmount = request.type === ERC721 ? '1' : request.amount;
    const getSignableTransferRequest: GetSignableTransferRequestV1 = {
      sender: user.etherKey,
      token: convertToSignableToken(request),
      amount: transferAmount,
      receiver: request.receiver,
    };

    const headers = {
      Authorization: `Bearer ${user.accessToken}`,
    };

    const signableResult = await transfersApi.getSignableTransferV1(
      {
        getSignableTransferRequest,
      },
      { headers },
    );

    await guardianClient.validate({
      payloadHash: signableResult.data.payload_hash,
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

    const { data: responseData } = await transfersApi.createTransferV1(
      createTransferRequest,
      { headers },
    );

    return {
      sent_signature: responseData.sent_signature,
      status: responseData.status?.toString(),
      time: responseData.time,
      transfer_id: responseData.transfer_id,
    };
  }, PassportErrorType.TRANSFER_ERROR);
}

export async function batchNftTransfer({
  user,
  starkSigner,
  request,
  transfersApi,
  guardianClient,
}: BatchTransfersParams): Promise<CreateTransferResponse> {
  return withPassportError<CreateTransferResponse>(async () => {
    const ethAddress = user.etherKey;

    const signableRequests = request.map(
      (nftTransfer): SignableTransferDetails => ({
        amount: '1',
        token: convertToSignableToken({
          type: ERC721,
          tokenId: nftTransfer.tokenId,
          tokenAddress: nftTransfer.tokenAddress,
        }),
        receiver: nftTransfer.receiver,
      }),
    );

    const getSignableTransferRequestV2: GetSignableTransferRequest = {
      sender_ether_key: ethAddress,
      signable_requests: signableRequests,
    };

    const headers = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: `Bearer ${user.accessToken}`,
    };

    const signableResult = await transfersApi.getSignableTransfer({
      getSignableTransferRequestV2,
    }, { headers });

    const popupWindowSize = { width: 480, height: 784 };
    await guardianClient.validate({
      payloadHash: signableResult.data.signable_responses[0]?.payload_hash,
      popupWindowSize,
    });

    const requests = await Promise.all(
      signableResult.data.signable_responses.map(async (resp) => {
        const starkSignature = await starkSigner.signMessage(resp.payload_hash);
        return {
          sender_vault_id: resp.sender_vault_id,
          receiver_stark_key: resp.receiver_stark_key,
          receiver_vault_id: resp.receiver_vault_id,
          asset_id: resp.asset_id,
          amount: resp.amount,
          nonce: resp.nonce,
          expiration_timestamp: resp.expiration_timestamp,
          stark_signature: starkSignature,
        };
      }),
    );

    const transferSigningParams = {
      sender_stark_key: signableResult.data.sender_stark_key,
      requests,
    };

    const response = await transfersApi.createTransfer(
      {
        createTransferRequestV2: transferSigningParams,
      },
      { headers },
    );

    return {
      transfer_ids: response?.data.transfer_ids,
    };
  }, PassportErrorType.TRANSFER_ERROR);
}
