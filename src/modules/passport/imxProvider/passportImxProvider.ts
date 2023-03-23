import { TransactionResponse } from '@ethersproject/abstract-provider';
import {
  AnyToken,
  CancelOrderResponse,
  Configuration,
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
  TransfersApi,
  UnsignedExchangeTransferRequest,
  UnsignedOrderRequest,
  UnsignedTransferRequest,
} from '@imtbl/core-sdk';
import { UserWithEtherKey } from '../types';
import { IMXProvider } from '../../provider/imxProvider';
import { PassportConfiguration } from '../config';
import transfer from '../workflows/transfer';

export type PassportImxProviderInput = {
  user: UserWithEtherKey;
  starkSigner: StarkSigner;
  passportConfig: PassportConfiguration;
};

export default class PassportImxProvider implements IMXProvider {
  private user: UserWithEtherKey;
  private starkSigner: StarkSigner;
  private transfersApi: TransfersApi;
  private passportConfig: PassportConfiguration;

  constructor({
                user,
                starkSigner,
                passportConfig,
              }: PassportImxProviderInput) {
    this.user = user;
    this.starkSigner = starkSigner;
    this.passportConfig = passportConfig;
    const apiConfig = new Configuration({ basePath: passportConfig.imxAPIConfiguration.basePath });
    this.transfersApi = new TransfersApi(apiConfig);
  }

  async transfer(
    request: UnsignedTransferRequest
  ): Promise<CreateTransferResponseV1> {
    return transfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      transferApi: this.transfersApi,
    }, { passportDomain: this.passportConfig.passportDomain });
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
