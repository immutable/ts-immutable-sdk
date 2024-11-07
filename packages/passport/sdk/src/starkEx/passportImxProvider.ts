import {
  AnyToken,
  EthSigner,
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
  PassportEventMap, PassportEvents, UserImx, User, IMXSigners, isUserImx,
} from '../types';
import { PassportError, PassportErrorType } from '../errors/passportError';
import {
  batchNftTransfer, cancelOrder, createOrder, createTrade, exchangeTransfer, transfer,
} from './workflows';
import registerOffchain from './workflows/registerOffchain';
import MagicAdapter from '../magicAdapter';
import { getStarkSigner } from './getStarkSigner';
import { withMetricsAsync } from '../utils/metrics';
import { BrowserProvider, TransactionResponse } from 'ethers';

export interface PassportImxProviderOptions {
  authManager: AuthManager;
  immutableXClient: IMXClient;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
  magicAdapter: MagicAdapter;
  imxApiClients: ImxApiClients;
  guardianClient: GuardianClient;
}

type RegisteredUserAndSigners = {
  user: UserImx;
  starkSigner: StarkSigner;
  ethSigner: EthSigner;
};

export class PassportImxProvider implements IMXProvider {
  protected readonly authManager: AuthManager;

  private readonly immutableXClient: IMXClient;

  protected readonly guardianClient: GuardianClient;

  protected readonly imxApiClients: ImxApiClients;

  protected magicAdapter: MagicAdapter;

  /**
   * This property is set during initialisation and stores the signers in a promise.
   * This property is not meant to be accessed directly, but through the
   * `#getSigners` method.
   * @see #getSigners
   */
  private signers: Promise<IMXSigners | undefined> | undefined;

  private signerInitialisationError: unknown | undefined;

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
    this.#initialiseSigners();

    passportEventEmitter.on(PassportEvents.LOGGED_OUT, this.handleLogout);
  }

  private handleLogout = (): void => {
    this.signers = undefined;
  };

  /**
   * This method is called by the constructor and asynchronously initialises the signers.
   * The signers are stored in a promise so that they can be retrieved by the provider
   * when needed.
   *
   * If an error is thrown during initialisation, it is stored in the `signerInitialisationError`,
   * so that it doesn't result in an unhandled promise rejection.
   *
   * This error is thrown when the signers are requested through:
   * @see #getSigners
   *
   */
  #initialiseSigners() {
    const generateSigners = async (): Promise<IMXSigners> => {
      const user = await this.authManager.getUser();
      // The user will be present because the factory validates it
      const magicRpcProvider = await this.magicAdapter.login(user!.idToken!);
      const web3Provider = new BrowserProvider(magicRpcProvider);

      const ethSigner = await web3Provider.getSigner();
      const starkSigner = await getStarkSigner(ethSigner);

      return { ethSigner, starkSigner };
    };

    // eslint-disable-next-line no-async-promise-executor
    this.signers = new Promise(async (resolve) => {
      try {
        resolve(await generateSigners());
      } catch (err) {
        // Capture and store the initialization error
        this.signerInitialisationError = err;
        resolve(undefined);
      }
    });
  }

  async #getAuthenticatedUser(): Promise<User> {
    const user = await this.authManager.getUser();

    if (!user || !this.signers) {
      throw new PassportError(
        'User has been logged out',
        PassportErrorType.NOT_LOGGED_IN_ERROR,
      );
    }

    return user;
  }

  async #getSigners(): Promise<IMXSigners> {
    const signers = await this.signers;
    // Throw the stored error if the signers failed to initialise
    if (typeof signers === 'undefined') {
      if (typeof this.signerInitialisationError !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw this.signerInitialisationError;
      }
      throw new Error('Signers failed to initialise');
    }

    return signers;
  }

  async #getRegisteredImxUserAndSigners(): Promise<RegisteredUserAndSigners> {
    const [user, signers] = await Promise.all([
      this.#getAuthenticatedUser(),
      this.#getSigners(),
    ]);

    if (!isUserImx(user)) {
      throw new PassportError(
        'User has not been registered with StarkEx',
        PassportErrorType.USER_NOT_REGISTERED_ERROR,
      );
    }

    return {
      user,
      starkSigner: signers.starkSigner,
      ethSigner: signers.ethSigner,
    };
  }

  async transfer(request: UnsignedTransferRequest): Promise<imx.CreateTransferResponseV1> {
    return withMetricsAsync(() => this.guardianClient.withDefaultConfirmationScreenTask(
      async () => {
        const { user, starkSigner } = await this.#getRegisteredImxUserAndSigners();

        return transfer({
          request,
          user,
          starkSigner,
          transfersApi: this.immutableXClient.transfersApi,
          guardianClient: this.guardianClient,
        });
      },
    )(), 'imxTransfer');
  }

  async registerOffchain(): Promise<imx.RegisterUserResponse> {
    return withMetricsAsync(
      async () => {
        const [user, signers] = await Promise.all([
          this.#getAuthenticatedUser(),
          this.#getSigners(),
        ]);

        return await registerOffchain(
          signers.ethSigner,
          signers.starkSigner,
          user,
          this.authManager,
          this.imxApiClients,
        );
      },
      'imxRegisterOffchain',
    );
  }

  async isRegisteredOffchain(): Promise<boolean> {
    return withMetricsAsync(
      async () => {
        const user = await this.#getAuthenticatedUser();
        return !!user.imx;
      },
      'imxIsRegisteredOffchain',
    );
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  isRegisteredOnchain(): Promise<boolean> {
    throw new PassportError(
      'Operation not supported',
      PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR,
    );
  }

  async createOrder(request: UnsignedOrderRequest): Promise<imx.CreateOrderResponse> {
    return withMetricsAsync(() => this.guardianClient.withDefaultConfirmationScreenTask(
      async () => {
        const { user, starkSigner } = await this.#getRegisteredImxUserAndSigners();
        return createOrder({
          request,
          user,
          starkSigner,
          ordersApi: this.immutableXClient.ordersApi,
          guardianClient: this.guardianClient,
        });
      },
    )(), 'imxCreateOrder');
  }

  async cancelOrder(
    request: imx.GetSignableCancelOrderRequest,
  ): Promise<imx.CancelOrderResponse> {
    return withMetricsAsync(() => this.guardianClient.withDefaultConfirmationScreenTask(
      async () => {
        const { user, starkSigner } = await this.#getRegisteredImxUserAndSigners();

        return cancelOrder({
          request,
          user,
          starkSigner,
          ordersApi: this.immutableXClient.ordersApi,
          guardianClient: this.guardianClient,
        });
      },
    )(), 'imxCancelOrder');
  }

  async createTrade(request: imx.GetSignableTradeRequest): Promise<imx.CreateTradeResponse> {
    return withMetricsAsync(() => this.guardianClient.withDefaultConfirmationScreenTask(
      async () => {
        const { user, starkSigner } = await this.#getRegisteredImxUserAndSigners();

        return createTrade({
          request,
          user,
          starkSigner,
          tradesApi: this.immutableXClient.tradesApi,
          guardianClient: this.guardianClient,
        });
      },
    )(), 'imxCreateTrade');
  }

  async batchNftTransfer(
    request: NftTransferDetails[],
  ): Promise<imx.CreateTransferResponse> {
    return withMetricsAsync(() => this.guardianClient.withConfirmationScreenTask(
      { width: 480, height: 784 },
    )(async () => {
      const { user, starkSigner } = await this.#getRegisteredImxUserAndSigners();

      return batchNftTransfer({
        request,
        user,
        starkSigner,
        transfersApi: this.immutableXClient.transfersApi,
        guardianClient: this.guardianClient,
      });
    })(), 'imxBatchNftTransfer');
  }

  async exchangeTransfer(
    request: UnsignedExchangeTransferRequest,
  ): Promise<imx.CreateTransferResponseV1> {
    return withMetricsAsync(async () => {
      const { user, starkSigner } = await this.#getRegisteredImxUserAndSigners();

      return exchangeTransfer({
        request,
        user,
        starkSigner,
        exchangesApi: this.immutableXClient.exchangeApi,
      });
    }, 'imxExchangeTransfer');
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
    return withMetricsAsync(async () => {
      const user = await this.#getAuthenticatedUser();
      if (!isUserImx(user)) {
        throw new PassportError(
          'User has not been registered with StarkEx',
          PassportErrorType.USER_NOT_REGISTERED_ERROR,
        );
      }

      return Promise.resolve(user.imx.ethAddress);
    }, 'imxGetAddress');
  }
}
