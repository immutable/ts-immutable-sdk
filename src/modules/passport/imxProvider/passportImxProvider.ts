import { TransactionResponse } from '@ethersproject/abstract-provider';
import {
  AnyToken,
  CancelOrderResponse,
  CreateOrderResponse,
  CreateTradeResponse,
  CreateTransferResponse,
  CreateTransferResponseV1,
  CreateWithdrawalResponse,
  GetSignableCancelOrderRequest,
  GetSignableTradeRequest,
  NftTransferDetails,
  RegisterUserResponse,
  StarkSigner,
  TokenAmount,
  UnsignedExchangeTransferRequest,
  UnsignedOrderRequest,
  UnsignedTransferRequest,
  TransfersApi,
  Config,
  TransfersApiCreateTransferV1Request,
} from '@imtbl/core-sdk';
import { User } from '../types';
import { IMXProvider } from '../../provider/imxProvider';
import { convertToSignableToken } from '../../provider/signable-actions/utils/convertToSignableToken';
import { PassportErrorType, withPassportError } from '../errors/passportError';

export type JWT = Pick<User, 'accessToken' | 'refreshToken'>;

export type PassportImxProviderInput = {
  jwt: JWT;
  starkSigner: StarkSigner;
  ethAddress: string;
}

export default class PassportImxProvider implements IMXProvider {
  private jwt: JWT;
  private starkSigner: StarkSigner;
  private transfersApi: TransfersApi;
  //Note: this ethAddress should be the smart contract ethAddress
  private ethAddress: string;

  constructor({jwt, starkSigner, ethAddress}: PassportImxProviderInput) {
    this.jwt = jwt;
    this.starkSigner = starkSigner;
    this.ethAddress = ethAddress;
    this.transfersApi = new TransfersApi(Config.SANDBOX.apiConfiguration);
  }

  async transfer(
    request: UnsignedTransferRequest
  ): Promise<CreateTransferResponseV1> {
    return withPassportError<CreateTransferResponseV1>(
      async () => {
        const transferAmount = request.type === 'ERC721' ? '1' : request.amount;
        const signableResult = await this.transfersApi.getSignableTransferV1({
          getSignableTransferRequest: {
            sender: this.ethAddress,
            token: convertToSignableToken(request),
            amount: transferAmount,
            receiver: request.receiver,
          },
        });

        const sigeableResultData = signableResult.data;
        const { payload_hash: payloadHash } = sigeableResultData;

        const starkSignature = await this.starkSigner.signMessage(payloadHash);

        const transferSigningParams = {
          sender_stark_key: sigeableResultData.sender_stark_key || '',
          sender_vault_id: sigeableResultData.sender_vault_id,
          receiver_stark_key: sigeableResultData.receiver_stark_key,
          receiver_vault_id: sigeableResultData.receiver_vault_id,
          asset_id: sigeableResultData.asset_id,
          amount: sigeableResultData.amount,
          nonce: sigeableResultData.nonce,
          expiration_timestamp: sigeableResultData.expiration_timestamp,
          stark_signature: starkSignature,
        };

        const createTransferRequest = {
          createTransferRequest: transferSigningParams,
          //Note: fake value to by pass the client check, will update once get the up-to-date api client
          xImxEthAddress: "",
          xImxEthSignature: ""
        } as TransfersApiCreateTransferV1Request;

        const headers = {
          Authorization: 'Bearer ' + this.jwt.accessToken,
        };

        const { data: responseData } = await this.transfersApi.createTransferV1(
          createTransferRequest,
          { headers }
        );

        return {
          sent_signature: responseData.sent_signature,
          status: responseData.status?.toString(),
          time: responseData.time,
          transfer_id: responseData.transfer_id,
        };
      },
      { type: PassportErrorType.TRANSFER_ERROR }
    );
  }

  registerOffchain(): Promise<RegisterUserResponse> {
    throw new Error('Method not implemented.');
  }

  isRegisteredOnchain(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createOrder(request: UnsignedOrderRequest): Promise<CreateOrderResponse> {
    throw new Error('Method not implemented.');
  }

  cancelOrder(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: GetSignableCancelOrderRequest
  ): Promise<CancelOrderResponse> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
    throw new Error('Method not implemented.');
  }

  batchNftTransfer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: NftTransferDetails[]
  ): Promise<CreateTransferResponse> {
    throw new Error('Method not implemented.');
  }

  exchangeTransfer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: UnsignedExchangeTransferRequest
  ): Promise<CreateTransferResponseV1> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deposit(deposit: TokenAmount): Promise<TransactionResponse> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prepareWithdrawal(request: TokenAmount): Promise<CreateWithdrawalResponse> {
    throw new Error('Method not implemented.');
  }
  completeWithdrawal(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    starkPublicKey: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: AnyToken
  ): Promise<TransactionResponse> {
    throw new Error('Method not implemented.');
  }

  getAddress(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
