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
import TypedEventEmitter from 'utils/typedEventEmitter';
import GuardianClient from '../guardian/guardian';
import {
  PassportEventMap, PassportEvents, UserImx, User,
} from '../types';
import { PassportError, PassportErrorType } from '../errors/passportError';
import {
  batchNftTransfer, cancelOrder, createOrder, createTrade, exchangeTransfer, transfer,
} from './workflows';
import { ConfirmationScreen } from '../confirmation';
import { PassportConfiguration } from '../config';
import registerStarkEx from './workflows/registerStarkEx';

export interface PassportImxProviderInput {
  authManager: AuthManager;
  starkSigner: StarkSigner;
  immutableXClient: ImmutableXClient;
  confirmationScreen: ConfirmationScreen;
  config: PassportConfiguration;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
  ethSigner: EthSigner;
}

type AuthenticatedUserSigner = {
  user: UserImx;
  starkSigner: StarkSigner;
  ethSigner: EthSigner;
};

export class PassportImxProvider implements IMXProvider {
  protected readonly authManager: AuthManager;

  protected starkSigner?: StarkSigner;

  protected ethSigner?: EthSigner;

  private readonly immutableXClient: ImmutableXClient;

  protected readonly guardianClient: GuardianClient;

  constructor({
    authManager,
    starkSigner,
    immutableXClient,
    confirmationScreen,
    config,
    passportEventEmitter,
    ethSigner,
  }: PassportImxProviderInput) {
    this.authManager = authManager;
    this.starkSigner = starkSigner;
    this.ethSigner = ethSigner;
    this.immutableXClient = immutableXClient;
    this.guardianClient = new GuardianClient({
      confirmationScreen,
      config,
    });

    passportEventEmitter.on(PassportEvents.LOGGED_OUT, this.handleLogout);
  }

  private handleLogout = (): void => {
    this.starkSigner = undefined;
    this.ethSigner = undefined;
  };

  protected async checkIsLoggedIn() {
    const user = await this.authManager.getUser();
    if (!user || this.starkSigner === undefined || this.ethSigner === undefined) {
      throw new PassportError(
        'User has been logged out',
        PassportErrorType.NOT_LOGGED_IN_ERROR,
      );
    }
  }

  protected async checkUserAndSignersDefined() {
    const user = await this.authManager.getUser();
    if (!user || this.starkSigner === undefined || this.ethSigner === undefined) {
      throw new PassportError(
        'User has been logged out',
        PassportErrorType.NOT_LOGGED_IN_ERROR,
      );
    }
    return { user, starkSigner: this.starkSigner, ethSigner: this.ethSigner };
  }

  protected async getAuthenticatedUserSigner(): Promise<AuthenticatedUserSigner> {
    const { user, starkSigner, ethSigner } = await this.checkUserAndSignersDefined();
    const isUserImx = (oidcUser: User | null): oidcUser is UserImx => oidcUser?.imx !== undefined;

    if (!isUserImx(user)) {
      throw new PassportError(
        'User has not been registered with StarkEx',
        PassportErrorType.USER_NOT_REGISTERED_ERROR,
      );
    }

    return { user, starkSigner, ethSigner };
  }

  async transfer(request: UnsignedTransferRequest): Promise<CreateTransferResponseV1> {
    const { user, starkSigner } = await this.getAuthenticatedUserSigner();

    return transfer({
      request,
      user,
      starkSigner,
      transfersApi: this.immutableXClient.transfersApi,
      guardianClient: this.guardianClient,
    });
  }

  async registerOffchain(): Promise<RegisterUserResponse> {
    const { user, ethSigner, starkSigner } = await this.checkUserAndSignersDefined();
    return await registerStarkEx(
      ethSigner,
      starkSigner,
      user.accessToken,
      this.authManager,
      this.immutableXClient.usersApi,
    );
  }

  async isRegisteredOnchain(): Promise<boolean> {
    try {
      const { user } = await this.getAuthenticatedUserSigner();
      const { ethAddress, starkAddress, userAdminAddress } = user.imx;
      return !!(ethAddress && starkAddress && userAdminAddress);
    } catch (err) {
      if (err instanceof PassportError && err.type === PassportErrorType.USER_NOT_REGISTERED_ERROR) {
        return false;
      }
      throw err;
    }
  }

  async createOrder(request: UnsignedOrderRequest): Promise<CreateOrderResponse> {
    const { user, starkSigner } = await this.getAuthenticatedUserSigner();

    return createOrder({
      request,
      user,
      starkSigner,
      ordersApi: this.immutableXClient.ordersApi,
      guardianClient: this.guardianClient,
    });
  }

  async cancelOrder(
    request: GetSignableCancelOrderRequest,
  ): Promise<CancelOrderResponse> {
    const { user, starkSigner } = await this.getAuthenticatedUserSigner();

    return cancelOrder({
      request,
      user,
      starkSigner,
      ordersApi: this.immutableXClient.ordersApi,
      guardianClient: this.guardianClient,
    });
  }

  async createTrade(request: GetSignableTradeRequest): Promise<CreateTradeResponse> {
    const { user, starkSigner } = await this.getAuthenticatedUserSigner();

    return createTrade({
      request,
      user,
      starkSigner,
      tradesApi: this.immutableXClient.tradesApi,
      guardianClient: this.guardianClient,
    });
  }

  async batchNftTransfer(
    request: NftTransferDetails[],
  ): Promise<CreateTransferResponse> {
    const { user, starkSigner } = await this.getAuthenticatedUserSigner();

    return batchNftTransfer({
      request,
      user,
      starkSigner,
      transfersApi: this.immutableXClient.transfersApi,
      guardianClient: this.guardianClient,
    });
  }

  async exchangeTransfer(
    request: UnsignedExchangeTransferRequest,
  ): Promise<CreateTransferResponseV1> {
    const { user, starkSigner } = await this.getAuthenticatedUserSigner();

    return exchangeTransfer({
      request,
      user,
      starkSigner,
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

  async getAddress(): Promise<string> {
    const { user } = await this.getAuthenticatedUserSigner();
    return Promise.resolve(user.imx.ethAddress);
  }
}
