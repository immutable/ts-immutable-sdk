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
import { retryWithDelay } from 'util/retry';
import * as guardian from '@imtbl/guardian';
import { PassportErrorType, withPassportError } from '../errors/passportError';
import { TransactionTypes } from '../confirmation/types';
import ConfirmationScreen from '../confirmation/confirmation';
import { PassportConfiguration } from '../config';
import { UserWithEtherKey } from '../types';

const ERC721 = 'ERC721';

type TransferRequest = {
  request: UnsignedTransferRequest;
  user: UserWithEtherKey;
  starkSigner: StarkSigner;
  transfersApi: TransfersApi;
  passportConfig: PassportConfiguration;
};

type BatchTransfersParams = {
  request: Array<NftTransferDetails>;
  user: UserWithEtherKey;
  starkSigner: StarkSigner;
  transfersApi: TransfersApi;
  passportConfig: PassportConfiguration;
};

export const transfer = ({
  request,
  transfersApi,
  starkSigner,
  user,
  passportConfig,
}: // TODO: remove this eslint disable once we have a better solution
// eslint-disable-next-line max-len
TransferRequest): Promise<CreateTransferResponseV1> => withPassportError<CreateTransferResponseV1>(async () => {
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

  const signableResult = await transfersApi.getSignableTransferV1({
    getSignableTransferRequest,
  }, { headers });

  const transactionAPI = new guardian.TransactionsApi(new guardian.Configuration({
    accessToken: user.accessToken,
    basePath: passportConfig.guardianDomain,
  }));
  const transactionExists = await retryWithDelay(async () => transactionAPI.getTransactionByID({
    transactionID: signableResult.data.payload_hash,
    chainType: 'starkex',
  }));

  if (!transactionExists) {
    throw new Error("Transaction doesn't exists");
  }

  const starkExTransactionApi = new guardian.StarkexTransactionsApi(new guardian.Configuration({
    accessToken: user.accessToken,
    basePath: passportConfig.guardianDomain,
  }));

  const evaluateStarkexRes = await starkExTransactionApi.evaluateStarkexTransaction({
    payloadHash: signableResult.data.payload_hash,
  });

  const { confirmationRequired } = evaluateStarkexRes.data;
  if (confirmationRequired) {
    const confirmationScreen = new ConfirmationScreen(passportConfig);
    const confirmationResult = await confirmationScreen.startTransaction(
      user.accessToken,
      {
        transactionType: TransactionTypes.CreateTransfer,
        transactionData: getSignableTransferRequest,
      },
    );

    if (!confirmationResult.confirmed) {
      throw new Error('Transaction rejected by user');
    }
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

export async function batchNftTransfer({
  user,
  starkSigner,
  request,
  transfersApi,
  passportConfig,
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

    const signableResult = await transfersApi.getSignableTransfer({
      getSignableTransferRequestV2,
    });

    const confirmationScreen = new ConfirmationScreen(passportConfig);
    const popupWindowSize = { width: 480, height: 784 };
    const confirmationResult = await confirmationScreen.startTransaction(
      user.accessToken,
      {
        transactionType: TransactionTypes.CreateBatchTransfer,
        transactionData: getSignableTransferRequestV2,
      },
      popupWindowSize,
    );

    if (!confirmationResult.confirmed) {
      throw new Error('Transaction rejected by user');
    }

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

    const headers = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: `Bearer ${user.accessToken}`,
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
