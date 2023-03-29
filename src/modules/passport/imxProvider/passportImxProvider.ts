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
import { UserWithEtherKey } from '../types';
import { IMXProvider } from '../../provider/imxProvider';
import { ImxApiConfiguration } from '../config';
import { transfer, batchNftTransfer } from '../workflows/transfer';
import { cancelOrder, createOrder } from '../workflows/order';
import { exchangeTransfer } from '../workflows/exchange';
import { createTrade } from '../workflows/trades';
import { PassportError, PassportErrorType } from '../errors/passportError';

export type PassportImxProviderInput = {
  user: UserWithEtherKey;
  starkSigner: StarkSigner;
  apiConfig: ImxApiConfiguration;
};

export default class PassportImxProvider implements IMXProvider {
  private user: UserWithEtherKey;
  private starkSigner: StarkSigner;
  private transfersApi: TransfersApi;
  private ordersApi: OrdersApi;
  private exchangesApi: ExchangesApi;
  private tradesApi: TradesApi;

  constructor({ user, starkSigner, apiConfig }: PassportImxProviderInput) {
    this.user = user;
    this.starkSigner = starkSigner;
    const configuration = new Configuration({ basePath: apiConfig.basePath });
    this.transfersApi = new TransfersApi(configuration);
    this.ordersApi = new OrdersApi(configuration);
    this.exchangesApi = new ExchangesApi(configuration);
    this.tradesApi = new TradesApi(configuration)
  }

  async transfer(
    request: UnsignedTransferRequest
  ): Promise<CreateTransferResponseV1> {
    return transfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      transfersApi: this.transfersApi,
    });
  }

  registerOffchain(): Promise<RegisterUserResponse> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR
    );
  }

  isRegisteredOnchain(): Promise<boolean> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR
    );
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

  createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
    return createTrade({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      tradesApi: this.tradesApi,
    })
  }

  batchNftTransfer(
    request: NftTransferDetails[]
  ): Promise<CreateTransferResponse> {
    return batchNftTransfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      transfersApi: this.transfersApi,
    })
  }

  exchangeTransfer(
    request: UnsignedExchangeTransferRequest
  ): Promise<CreateTransferResponseV1> {
    return exchangeTransfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      exchangesApi: this.exchangesApi
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deposit(deposit: TokenAmount): Promise<TransactionResponse> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prepareWithdrawal(request: TokenAmount): Promise<CreateWithdrawalResponse> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR
    );
  }

  completeWithdrawal(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    starkPublicKey: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: AnyToken
  ): Promise<TransactionResponse> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR
    );
  }

  getAddress(): Promise<string> {
    return Promise.resolve(this.starkSigner.getAddress());
  }
}
