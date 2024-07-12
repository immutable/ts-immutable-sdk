import { TransactionResponse } from '@ethersproject/abstract-provider';
import {
  AnyToken,
  IMXClient,
  NftTransferDetails,
  StarkSigner,
  TokenAmount,
  UnsignedExchangeTransferRequest,
  UnsignedOrderRequest,
  UnsignedTransferRequest,
} from '@imtbl/x-client';
import { IMXProvider } from '@imtbl/x-provider';
import {
  imx,
  ImxApiClients,
} from '@imtbl/generated-clients';
import TypedEventEmitter from '../utils/typedEventEmitter';
import AuthManager from '../authManager';
import GuardianClient from '../guardian';
import {
  PassportEventMap, PassportEvents, UserImx, User, isUserImx,
} from '../types';
import { PassportError, PassportErrorType } from '../errors/passportError';
import {
  batchNftTransfer, cancelOrder, createOrder, createTrade, exchangeTransfer, transfer,
} from './workflows';
import registerOffchain from './workflows/registerOffchain';
import MagicAdapter from '../magicAdapter';
import { getStarkSigner } from './getStarkSigner';

export interface PassportImxProviderOptions {
  authManager: AuthManager;
  immutableXClient: IMXClient;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
  magicAdapter: MagicAdapter;
  imxApiClients: ImxApiClients;
  guardianClient: GuardianClient;
}

export class PassportImxProvider implements IMXProvider {
  protected readonly authManager: AuthManager;

  private readonly immutableXClient: IMXClient;

  protected readonly guardianClient: GuardianClient;

  protected readonly imxApiClients: ImxApiClients;

  protected magicAdapter: MagicAdapter;

  /**
   * This property is not meant to be accessed directly, but through the
   * `#getStarkSigner` method.
   * @see #getStarkSigner
   */
  private lazyStarkSigner: StarkSigner | undefined;

  constructor({
    authManager,
    immutableXClient,
    passportEventEmitter,
    magicAdapter,
    imxApiClients,
    guardianClient,
  }: PassportImxProviderOptions) {
    this.authManager = authManager;
    this.immutableXClient = immutableXClient;
    this.magicAdapter = magicAdapter;
    this.imxApiClients = imxApiClients;
    this.guardianClient = guardianClient;

    passportEventEmitter.on(PassportEvents.LOGGED_OUT, this.handleLogout);
  }

  private handleLogout = (): void => {
    this.lazyStarkSigner = undefined;
  };

  async #getAuthenticatedUser(): Promise<User> {
    const user = await this.authManager.getUser();

    if (!user) {
      throw new PassportError(
        'User has been logged out',
        PassportErrorType.NOT_LOGGED_IN_ERROR,
      );
    }

    return user;
  }

  async #getStarkSigner(): Promise<StarkSigner> {
    if (!this.lazyStarkSigner) {
      // TODO: If `magicAdapter.getSigner` errors, will it be obvious which point is failing?
      const magicSigner = await this.magicAdapter.getSigner();
      this.lazyStarkSigner = await getStarkSigner(magicSigner);
    }

    return this.lazyStarkSigner;
  }

  // TODO: Add comments to this fn to explain why we're not initially awaiting getStarkSigner
  async #getRegisteredImxUserAndStarkSigner(): Promise<{ user: UserImx, starkSigner: StarkSigner }> {
    const starkSignerPromise = this.#getStarkSigner();
    const user = await this.#getAuthenticatedUser();

    if (!isUserImx(user)) {
      throw new PassportError(
        'User has not been registered with StarkEx',
        PassportErrorType.USER_NOT_REGISTERED_ERROR,
      );
    }

    const starkSigner = await starkSignerPromise;

    return {
      user,
      starkSigner,
    };
  }

  async transfer(request: UnsignedTransferRequest): Promise<imx.CreateTransferResponseV1> {
    return (
      this.guardianClient.withDefaultConfirmationScreenTask(async () => {
        const { user, starkSigner } = await this.#getRegisteredImxUserAndStarkSigner();

        return transfer({
          request,
          user,
          starkSigner,
          transfersApi: this.immutableXClient.transfersApi,
          guardianClient: this.guardianClient,
        });
      })()
    );
  }

  async registerOffchain(): Promise<imx.RegisterUserResponse> {
    const [user, magicSigner, starkSigner] = await Promise.all([
      this.#getAuthenticatedUser(),
      this.magicAdapter.getSigner(),
      this.#getStarkSigner(),
    ]);

    return await registerOffchain(
      magicSigner,
      starkSigner,
      user,
      this.authManager,
      this.imxApiClients,
    );
  }

  async isRegisteredOffchain(): Promise<boolean> {
    const user = await this.#getAuthenticatedUser();

    return !!user.imx;
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  isRegisteredOnchain(): Promise<boolean> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
    );
  }

  async createOrder(request: UnsignedOrderRequest): Promise<imx.CreateOrderResponse> {
    return this.guardianClient.withDefaultConfirmationScreenTask(
      async () => {
        const { user, starkSigner } = await this.#getRegisteredImxUserAndStarkSigner();
        return createOrder({
          request,
          user,
          starkSigner,
          ordersApi: this.immutableXClient.ordersApi,
          guardianClient: this.guardianClient,
        });
      },
    )();
  }

  async cancelOrder(
    request: imx.GetSignableCancelOrderRequest,
  ): Promise<imx.CancelOrderResponse> {
    return this.guardianClient.withDefaultConfirmationScreenTask(
      async () => {
        const { user, starkSigner } = await this.#getRegisteredImxUserAndStarkSigner();

        return cancelOrder({
          request,
          user,
          starkSigner,
          ordersApi: this.immutableXClient.ordersApi,
          guardianClient: this.guardianClient,
        });
      },
    )();
  }

  async createTrade(request: imx.GetSignableTradeRequest): Promise<imx.CreateTradeResponse> {
    return this.guardianClient.withDefaultConfirmationScreenTask(
      async () => {
        const { user, starkSigner } = await this.#getRegisteredImxUserAndStarkSigner();

        return createTrade({
          request,
          user,
          starkSigner,
          tradesApi: this.immutableXClient.tradesApi,
          guardianClient: this.guardianClient,
        });
      },
    )();
  }

  async batchNftTransfer(
    request: NftTransferDetails[],
  ): Promise<imx.CreateTransferResponse> {
    return this.guardianClient.withConfirmationScreenTask(
      { width: 480, height: 784 },
    )(async () => {
      const { user, starkSigner } = await this.#getRegisteredImxUserAndStarkSigner();

      return batchNftTransfer({
        request,
        user,
        starkSigner,
        transfersApi: this.immutableXClient.transfersApi,
        guardianClient: this.guardianClient,
      });
    })();
  }

  async exchangeTransfer(
    request: UnsignedExchangeTransferRequest,
  ): Promise<imx.CreateTransferResponseV1> {
    const { user, starkSigner } = await this.#getRegisteredImxUserAndStarkSigner();

    return exchangeTransfer({
      request,
      user,
      starkSigner,
      exchangesApi: this.immutableXClient.exchangeApi,
    });
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  deposit(deposit: TokenAmount): Promise<TransactionResponse> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
    );
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  prepareWithdrawal(request: TokenAmount): Promise<imx.CreateWithdrawalResponse> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
    );
  }

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
    const user = await this.#getAuthenticatedUser();
    if (!isUserImx(user)) {
      throw new PassportError(
        'User has not been registered with StarkEx',
        PassportErrorType.USER_NOT_REGISTERED_ERROR,
      );
    }

    return Promise.resolve(user.imx.ethAddress);
  }
}
