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
  ExchangesApi,
  GetSignableCancelOrderRequest,
  GetSignableTradeRequest,
  NftTransferDetails,
  OrdersApi,
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
import { batchNftTransfer, transfer } from '../workflows/transfer';
import { cancelOrder, createOrder } from '../workflows/order';
import { exchangeTransfer } from '../workflows/exchange';
import { PassportConfiguration } from '../config';

export type PassportImxProviderInput = {
  user: UserWithEtherKey;
  starkSigner: StarkSigner;
  passportConfig: PassportConfiguration;
};

export default class PassportImxProvider implements IMXProvider {
  private user: UserWithEtherKey;
  private starkSigner: StarkSigner;
  private transfersApi: TransfersApi;
  private ordersApi: OrdersApi;
  private readonly passportConfig: PassportConfiguration;
  private exchangesApi: ExchangesApi;

  constructor({ user, starkSigner, passportConfig }: PassportImxProviderInput) {
    this.user = user;
    this.starkSigner = starkSigner;
    this.passportConfig = passportConfig;
    const apiConfig = new Configuration({ basePath: passportConfig.imxAPIConfiguration.basePath });
    this.transfersApi = new TransfersApi(apiConfig);
    this.ordersApi = new OrdersApi(apiConfig);
    this.exchangesApi = new ExchangesApi(apiConfig);
  }

  async transfer(
    request: UnsignedTransferRequest
  ): Promise<CreateTransferResponseV1> {
    return transfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      transfersApi: this.transfersApi
    }, { passportDomain: this.passportConfig.passportDomain });
  }

  registerOffchain(): Promise<RegisterUserResponse> {
    throw new Error('Method not implemented.');
  }

  isRegisteredOnchain(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  createOrder(request: UnsignedOrderRequest): Promise<CreateOrderResponse> {
    return createOrder({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      ordersApi: this.ordersApi,
    });
  }

  cancelOrder(
    request: GetSignableCancelOrderRequest
  ): Promise<CancelOrderResponse> {
    return cancelOrder({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      ordersApi: this.ordersApi,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
    throw new Error('Method not implemented.');
  }

  batchNftTransfer(
    request: NftTransferDetails[]
  ): Promise<CreateTransferResponse> {
    return batchNftTransfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      transfersApi: this.transfersApi,
    });
  }

  exchangeTransfer(
    request: UnsignedExchangeTransferRequest
  ): Promise<CreateTransferResponseV1> {
    return exchangeTransfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      exchangesApi: this.exchangesApi
    });
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
    return Promise.resolve(this.starkSigner.getAddress());
  }
}
