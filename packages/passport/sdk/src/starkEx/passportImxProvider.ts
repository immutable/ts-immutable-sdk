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
  EthSigner,
  TokenAmount,
  UnsignedExchangeTransferRequest,
  UnsignedOrderRequest,
  UnsignedTransferRequest,
} from '@imtbl/core-sdk';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import { IMXProvider } from '@imtbl/provider';
import AuthManager from 'authManager';
import registerPassportStarkEx from './workflows/registration';
import { retryWithDelay } from '../network/retry';
import GuardianClient from '../guardian/guardian';
import {
  PassportEventMap, PassportEvents, UserImx, User,
} from '../types';
import { PassportError, PassportErrorType, withPassportError } from '../errors/passportError';
import {
  batchNftTransfer,
  transfer,
  cancelOrder,
  createOrder,
  exchangeTransfer,
  createTrade,
} from './workflows';
import { ConfirmationScreen } from '../confirmation';
import { PassportConfiguration } from '../config';
import TypedEventEmitter from '../typedEventEmitter';

export interface PassportImxProviderInput {
  user: UserImx;
  starkSigner: StarkSigner;
  immutableXClient: ImmutableXClient;
  confirmationScreen: ConfirmationScreen;
  config: PassportConfiguration;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
  ethSigner: EthSigner;
  authManager: AuthManager;
}

type LoggedInPassportImxProvider = {
  user: UserImx;
  starkSigner: StarkSigner;
  ethSigner: EthSigner;
};

export class PassportImxProvider implements IMXProvider {
  protected user?: UserImx;

  protected starkSigner?: StarkSigner;

  protected ethSigner?: EthSigner;

  private readonly authManager: AuthManager;

  private readonly immutableXClient: ImmutableXClient;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly guardianClient: GuardianClient;

  constructor({
    user,
    starkSigner,
    immutableXClient,
    confirmationScreen,
    config,
    passportEventEmitter,
    ethSigner,
    authManager,
  }: PassportImxProviderInput) {
    this.user = user;
    this.starkSigner = starkSigner;
    this.ethSigner = ethSigner;
    this.immutableXClient = immutableXClient;
    this.confirmationScreen = confirmationScreen;
    this.authManager = authManager;
    this.guardianClient = new GuardianClient({
      accessToken: user.accessToken,
      confirmationScreen,
      imxEtherAddress: user.imx.ethAddress,
      config,
    });

    passportEventEmitter.on(PassportEvents.LOGGED_OUT, this.handleLogout);
  }

  private handleLogout = (): void => {
    this.user = undefined;
    this.starkSigner = undefined;
    this.ethSigner = undefined;
  };

  private checkIsLoggedIn(): asserts this is LoggedInPassportImxProvider {
    if (this.user === undefined || this.starkSigner === undefined || this.ethSigner === undefined) {
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

  private async registerStarkEx(userAdminKeySigner: EthSigner, starkSigner: StarkSigner, jwt: string) {
    return withPassportError<RegisterUserResponse>(async () => {
      const registerResponse = await registerPassportStarkEx(
        {
          ethSigner: userAdminKeySigner,
          starkSigner,
          usersApi: this.immutableXClient.usersApi,
        },
        jwt,
      );

      // User metadata is updated asynchronously. Poll userinfo endpoint until it is updated.
      await retryWithDelay<User | null>(async () => {
        const user = await this.authManager.loginSilent({ forceRefresh: true }); // force refresh to get updated user info
        const metadataExists = !!user?.imx;
        if (metadataExists) {
          return user;
        }
        return Promise.reject(new Error('user wallet addresses not exist'));
      });

      return registerResponse;
    }, PassportErrorType.REFRESH_TOKEN_ERROR);
  }

  async registerOffchain(): Promise<RegisterUserResponse> {
    this.checkIsLoggedIn();
    return await this.registerStarkEx(this.ethSigner, this.starkSigner, this.user.accessToken);
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
    if (!this.user.imx.ethAddress) {
      throw new PassportError(
        'User has not been registered',
        PassportErrorType.USER_NOT_REGISTERED_ERROR,
      );
    }

    return Promise.resolve(this.user.imx.ethAddress);
  }
}
