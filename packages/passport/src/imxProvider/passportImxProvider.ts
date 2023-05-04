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
} from '@imtbl/core-sdk';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import { IMXProvider } from '@imtbl/provider';
import { PassportConfiguration } from '../config';
import { UserWithEtherKey } from '../types';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { batchNftTransfer, transfer } from '../workflows/transfer';
import { cancelOrder, createOrder } from '../workflows/order';
import { exchangeTransfer } from '../workflows/exchange';
import { createTrade } from '../workflows/trades';

export type PassportImxProviderInput = {
  user: UserWithEtherKey;
  starkSigner: StarkSigner;
  passportConfig: PassportConfiguration;
  immutableXClient: ImmutableXClient;
};

export default class PassportImxProvider implements IMXProvider {
  private readonly user: UserWithEtherKey;
  private readonly starkSigner: StarkSigner;
  private readonly passportConfig: PassportConfiguration;
  private readonly immutableXClient: ImmutableXClient;

  constructor({
    user,
    starkSigner,
    passportConfig,
    immutableXClient,
  }: PassportImxProviderInput) {
    this.user = user;
    this.starkSigner = starkSigner;
    this.passportConfig = passportConfig;
    this.immutableXClient = immutableXClient;
  }

  async transfer(
    request: UnsignedTransferRequest
  ): Promise<CreateTransferResponseV1> {
    return transfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      transfersApi: this.immutableXClient.transfersApi,
      passportConfig: this.passportConfig,
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
      ordersApi: this.immutableXClient.ordersApi,
      passportConfig: this.passportConfig,
    });
  }

  cancelOrder(
    request: GetSignableCancelOrderRequest
  ): Promise<CancelOrderResponse> {
    return cancelOrder({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      ordersApi: this.immutableXClient.ordersApi,
      passportConfig: this.passportConfig,
    });
  }

  createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
    return createTrade({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      tradesApi: this.immutableXClient.tradesApi,
      passportConfig: this.passportConfig,
    });
  }

  batchNftTransfer(
    request: NftTransferDetails[]
  ): Promise<CreateTransferResponse> {
    return batchNftTransfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      transfersApi: this.immutableXClient.transfersApi,
      passportConfig: this.passportConfig,
    });
  }

  exchangeTransfer(
    request: UnsignedExchangeTransferRequest
  ): Promise<CreateTransferResponseV1> {
    return exchangeTransfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      exchangesApi: this.immutableXClient.exchangeApi,
    });
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
