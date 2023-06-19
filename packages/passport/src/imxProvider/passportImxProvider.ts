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
import { UserWithEtherKey } from '../types';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { batchNftTransfer, transfer } from '../workflows/transfer';
import { cancelOrder, createOrder } from '../workflows/order';
import { exchangeTransfer } from '../workflows/exchange';
import { createTrade } from '../workflows/trades';
import { ConfirmationScreen } from '../confirmation';

export type PassportImxProviderInput = {
  user: UserWithEtherKey;
  starkSigner: StarkSigner;
  immutableXClient: ImmutableXClient;
  confirmationScreen: ConfirmationScreen;
  imxPublicApiDomain: string;
};

export default class PassportImxProvider implements IMXProvider {
  private readonly user: UserWithEtherKey;

  private readonly starkSigner: StarkSigner;

  private readonly immutableXClient: ImmutableXClient;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly imxPublicApiDomain: string;

  constructor({
    user,
    starkSigner,
    immutableXClient,
    imxPublicApiDomain,
    confirmationScreen,
  }: PassportImxProviderInput) {
    this.user = user;
    this.starkSigner = starkSigner;
    this.immutableXClient = immutableXClient;
    this.imxPublicApiDomain = imxPublicApiDomain;
    this.confirmationScreen = confirmationScreen;
  }

  async transfer(
    request: UnsignedTransferRequest,
  ): Promise<CreateTransferResponseV1> {
    return transfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      transfersApi: this.immutableXClient.transfersApi,
      confirmationScreen: this.confirmationScreen,
      imxPublicApiDomain: this.imxPublicApiDomain,
    });
  }

  // TODO: Remove once implemented
  // eslint-disable-next-line class-methods-use-this
  registerOffchain(): Promise<RegisterUserResponse> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
    );
  }

  // TODO: Remove once implemented
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
      ordersApi: this.immutableXClient.ordersApi,
      imxPublicApiDomain: this.imxPublicApiDomain,
      confirmationScreen: this.confirmationScreen,
    });
  }

  cancelOrder(
    request: GetSignableCancelOrderRequest,
  ): Promise<CancelOrderResponse> {
    return cancelOrder({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      ordersApi: this.immutableXClient.ordersApi,
      imxPublicApiDomain: this.imxPublicApiDomain,
      confirmationScreen: this.confirmationScreen,
    });
  }

  createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
    return createTrade({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      tradesApi: this.immutableXClient.tradesApi,
      imxPublicApiDomain: this.imxPublicApiDomain,
      confirmationScreen: this.confirmationScreen,
    });
  }

  batchNftTransfer(
    request: NftTransferDetails[],
  ): Promise<CreateTransferResponse> {
    return batchNftTransfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      transfersApi: this.immutableXClient.transfersApi,
      imxPublicApiDomain: this.imxPublicApiDomain,
      confirmationScreen: this.confirmationScreen,
    });
  }

  exchangeTransfer(
    request: UnsignedExchangeTransferRequest,
  ): Promise<CreateTransferResponseV1> {
    return exchangeTransfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      exchangesApi: this.immutableXClient.exchangeApi,
    });
  }

  // TODO: Remove once implemented
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  deposit(deposit: TokenAmount): Promise<TransactionResponse> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
    );
  }

  // TODO: Remove once implemented
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  prepareWithdrawal(request: TokenAmount): Promise<CreateWithdrawalResponse> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
    );
  }

  // TODO: Remove once implemented
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
    return Promise.resolve(this.user.etherKey);
  }
}
