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
import GuardianClient from '../guardian/guardian';
import { PassportEventMap, PassportEvents, UserImx } from '../types';
import { PassportError, PassportErrorType } from '../errors/passportError';
import {
  batchNftTransfer,
  transfer,
  cancelOrder,
  createOrder,
  exchangeTransfer,
  createTrade,
} from './workflows';
import { ConfirmationScreen } from '../confirmation';
import TypedEventEmitter from '../typedEventEmitter';

export type PassportImxProviderInput = {
  user: UserImx;
  starkSigner: StarkSigner;
  immutableXClient: ImmutableXClient;
  confirmationScreen: ConfirmationScreen;
  imxPublicApiDomain: string;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
};

type LoggedInPassportImxProvider = {
  user: UserImx;
  starkSigner: StarkSigner;
};

export class PassportImxProvider implements IMXProvider {
  protected user?: UserImx;

  protected starkSigner?: StarkSigner;

  private readonly immutableXClient: ImmutableXClient;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly guardianClient: GuardianClient;

  constructor({
    user,
    starkSigner,
    immutableXClient,
    imxPublicApiDomain,
    confirmationScreen,
    passportEventEmitter,
  }: PassportImxProviderInput) {
    this.user = user;
    this.starkSigner = starkSigner;
    this.immutableXClient = immutableXClient;
    this.confirmationScreen = confirmationScreen;
    this.guardianClient = new GuardianClient({
      imxPublicApiDomain,
      accessToken: user.accessToken,
      confirmationScreen,
      imxEtherAddress: user.imx.ethAddress,
    });

    passportEventEmitter.on(PassportEvents.LOGGED_OUT, this.handleLogout);
  }

  private handleLogout = (): void => {
    this.user = undefined;
    this.starkSigner = undefined;
  };

  private checkIsLoggedIn(): asserts this is LoggedInPassportImxProvider {
    if (this.user === undefined || this.starkSigner === undefined) {
      throw new PassportError(
        'User has been logged out',
        PassportErrorType.NOT_LOGGED_IN_ERROR,
      );
    }
  }

  async transfer(
    request: UnsignedTransferRequest,
  ): Promise<CreateTransferResponseV1> {
    this.checkIsLoggedIn();

    return transfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      transfersApi: this.immutableXClient.transfersApi,
      guardianClient: this.guardianClient,
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
    this.checkIsLoggedIn();

    return createOrder({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      ordersApi: this.immutableXClient.ordersApi,
      guardianClient: this.guardianClient,
    });
  }

  cancelOrder(
    request: GetSignableCancelOrderRequest,
  ): Promise<CancelOrderResponse> {
    this.checkIsLoggedIn();

    return cancelOrder({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      ordersApi: this.immutableXClient.ordersApi,
      guardianClient: this.guardianClient,
    });
  }

  createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
    this.checkIsLoggedIn();

    return createTrade({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      tradesApi: this.immutableXClient.tradesApi,
      guardianClient: this.guardianClient,
    });
  }

  batchNftTransfer(
    request: NftTransferDetails[],
  ): Promise<CreateTransferResponse> {
    this.checkIsLoggedIn();

    return batchNftTransfer({
      request,
      user: this.user,
      starkSigner: this.starkSigner,
      transfersApi: this.immutableXClient.transfersApi,
      guardianClient: this.guardianClient,
    });
  }

  exchangeTransfer(
    request: UnsignedExchangeTransferRequest,
  ): Promise<CreateTransferResponseV1> {
    this.checkIsLoggedIn();

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
    this.checkIsLoggedIn();

    return Promise.resolve(this.user.imx.ethAddress);
  }
}
