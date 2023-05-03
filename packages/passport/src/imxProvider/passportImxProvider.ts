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
  TradesApi,
  TransfersApi,
  UnsignedExchangeTransferRequest,
  UnsignedOrderRequest,
  UnsignedTransferRequest,
} from '@imtbl/core-sdk';
import { IMXProvider } from '@imtbl/provider';
import { UserWithEtherKey } from '../types';
import { batchNftTransfer, transfer } from '../workflows/transfer';
import { cancelOrder, createOrder } from '../workflows/order';
import { exchangeTransfer } from '../workflows/exchange';
import { createTrade } from '../workflows/trades';
import { PassportError, PassportErrorType } from '../errors/passportError';
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

  private tradesApi: TradesApi;

  constructor({ user, starkSigner, passportConfig }: PassportImxProviderInput) {
    this.user = user;
    this.starkSigner = starkSigner;
    this.passportConfig = passportConfig;
    const apiConfig = new Configuration({
      basePath: passportConfig.imxApiBasePath,
    });
    this.transfersApi = new TransfersApi(apiConfig);
    this.ordersApi = new OrdersApi(apiConfig);
    this.exchangesApi = new ExchangesApi(apiConfig);
    this.tradesApi = new TradesApi(apiConfig);
  }

  async transfer(
    request: UnsignedTransferRequest,
  ): Promise<CreateTransferResponseV1> {
    return transfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      transfersApi: this.transfersApi,
      passportConfig: this.passportConfig,
    });
  }

  // remove ignore when implemented
  // eslint-disable-next-line class-methods-use-this
  registerOffchain(): Promise<RegisterUserResponse> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
    );
  }

  // remove ignore when implemented
  // eslint-disable-next-line class-methods-use-this
  isRegisteredOnchain(): Promise<boolean> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
    );
  }

  createOrder(request: UnsignedOrderRequest): Promise<CreateOrderResponse> {
    return createOrder({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      ordersApi: this.ordersApi,
      passportConfig: this.passportConfig,
    });
  }

  cancelOrder(
    request: GetSignableCancelOrderRequest,
  ): Promise<CancelOrderResponse> {
    return cancelOrder({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      ordersApi: this.ordersApi,
      passportConfig: this.passportConfig,
    });
  }

  createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
    return createTrade({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      tradesApi: this.tradesApi,
      passportConfig: this.passportConfig,
    });
  }

  batchNftTransfer(
    request: NftTransferDetails[],
  ): Promise<CreateTransferResponse> {
    return batchNftTransfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      transfersApi: this.transfersApi,
      passportConfig: this.passportConfig,
    });
  }

  exchangeTransfer(
    request: UnsignedExchangeTransferRequest,
  ): Promise<CreateTransferResponseV1> {
    return exchangeTransfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      exchangesApi: this.exchangesApi,
    });
  }

  // remove ignore when implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  deposit(deposit: TokenAmount): Promise<TransactionResponse> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
    );
  }

  // remove ignore when implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  prepareWithdrawal(request: TokenAmount): Promise<CreateWithdrawalResponse> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
    );
  }

  // remove ignore when implemented
  // eslint-disable-next-line class-methods-use-this
  completeWithdrawal(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    starkPublicKey: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: AnyToken,
  ): Promise<TransactionResponse> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
    );
  }

  getAddress(): Promise<string> {
    return Promise.resolve(this.starkSigner.getAddress());
  }
}
