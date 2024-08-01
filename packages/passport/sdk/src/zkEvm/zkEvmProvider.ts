import { StaticJsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { Signer } from '@ethersproject/abstract-signer';
import { utils } from 'ethers';
import {
  Flow, identify, trackError, trackFlow,
} from '@imtbl/metrics';
import {
  JsonRpcRequestCallback,
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
  Provider,
  ProviderEvent,
  ProviderEventMap,
  RequestArguments,
} from './types';
import AuthManager from '../authManager';
import MagicAdapter from '../magicAdapter';
import TypedEventEmitter from '../utils/typedEventEmitter';
import { PassportConfiguration } from '../config';
import {
  PassportEventMap, PassportEvents, User, UserZkEvm,
} from '../types';
import { RelayerClient } from './relayerClient';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from './JsonRpcError';
import { registerZkEvmUser } from './user';
import { sendTransaction } from './sendTransaction';
import GuardianClient from '../guardian';
import { signTypedDataV4 } from './signTypedDataV4';
import { personalSign } from './personalSign';
import { trackSessionActivity } from './sessionActivity/sessionActivity';

export type ZkEvmProviderInput = {
  authManager: AuthManager;
  magicAdapter: MagicAdapter;
  config: PassportConfiguration;
  multiRollupApiClients: MultiRollupApiClients;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
  guardianClient: GuardianClient;
};

const isZkEvmUser = (user: User): user is UserZkEvm => 'zkEvm' in user;

export class ZkEvmProvider implements Provider {
  readonly #authManager: AuthManager;

  readonly #config: PassportConfiguration;

  /**
   * intended to emit EIP-1193 events
   */
  readonly #providerEventEmitter: TypedEventEmitter<ProviderEventMap>;

  /**
   * intended to emit internal Passport events
   */
  readonly #passportEventEmitter: TypedEventEmitter<ProviderEventMap>;

  readonly #guardianClient: GuardianClient;

  readonly #rpcProvider: StaticJsonRpcProvider; // Used for read

  readonly #magicAdapter: MagicAdapter;

  readonly #multiRollupApiClients: MultiRollupApiClients;

  readonly #relayerClient: RelayerClient;

  /**
   * This property is set during `#initialiseEthSigner` and stores the signer in a promise.
   * This property is not meant to be accessed directly, but through the
   * `#getSigner` method.
   * @see getSigner
   */
  #ethSigner?: Promise<Signer | undefined> | undefined;

  #signerInitialisationError: unknown | undefined;

  public readonly isPassport: boolean = true;

  constructor({
    authManager,
    magicAdapter,
    config,
    multiRollupApiClients,
    passportEventEmitter,
    guardianClient,
  }: ZkEvmProviderInput) {
    this.#authManager = authManager;
    this.#magicAdapter = magicAdapter;
    this.#config = config;
    this.#guardianClient = guardianClient;
    this.#passportEventEmitter = passportEventEmitter;

    if (config.crossSdkBridgeEnabled) {
      // StaticJsonRpcProvider by default sets the referrer as "client".
      // On Unreal 4 this errors as the browser used is expecting a valid URL.
      this.#rpcProvider = new StaticJsonRpcProvider({
        url: this.#config.zkEvmRpcUrl,
        fetchOptions: { referrer: 'http://imtblgamesdk.local' },
      });
    } else {
      this.#rpcProvider = new StaticJsonRpcProvider(this.#config.zkEvmRpcUrl);
    }

    this.#relayerClient = new RelayerClient({
      config: this.#config,
      rpcProvider: this.#rpcProvider,
      authManager: this.#authManager,
    });

    this.#multiRollupApiClients = multiRollupApiClients;
    this.#providerEventEmitter = new TypedEventEmitter<ProviderEventMap>();

    // Automatically connect an existing user session to Passport
    this.#authManager.getUser().then((user) => {
      if (user && isZkEvmUser(user)) {
        this.#initialiseEthSigner(user);
      }
    }).catch(() => {
      // User does not exist, don't initialise an eth signer
    });

    passportEventEmitter.on(PassportEvents.LOGGED_IN, (user: User) => this.#initialiseEthSigner(user));
    passportEventEmitter.on(PassportEvents.LOGGED_OUT, this.#handleLogout);
    passportEventEmitter.on(
      PassportEvents.ACCOUNTS_REQUESTED,
      trackSessionActivity,
    );
  }

  #handleLogout = () => {
    this.#ethSigner = undefined;
    this.#providerEventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, []);
  };

  /**
   * This method is called by `eth_requestAccounts` and asynchronously initialises the signer.
   * The signer is stored in a promise so that it can be retrieved by the provider
   * when needed.
   *
   * If an error is thrown during initialisation, it is stored in the `signerInitialisationError`,
   * so that it doesn't result in an unhandled promise rejection.
   *
   * This error is thrown when the signer is requested through:
   * @see #getSigner
   *
   */
  #initialiseEthSigner(user: User) {
    const generateSigner = async (): Promise<Signer> => {
      const magicRpcProvider = await this.#magicAdapter.login(user.idToken!);
      const web3Provider = new Web3Provider(magicRpcProvider);

      return web3Provider.getSigner();
    };

    this.#signerInitialisationError = undefined;
    // eslint-disable-next-line no-async-promise-executor
    this.#ethSigner = new Promise(async (resolve) => {
      try {
        resolve(await generateSigner());
      } catch (err) {
        // Capture and store the initialization error
        this.#signerInitialisationError = err;
        resolve(undefined);
      }
    });
  }

  async #getSigner(): Promise<Signer> {
    const ethSigner = await this.#ethSigner;
    // Throw the stored error if the signers failed to initialise
    if (typeof ethSigner === 'undefined') {
      if (typeof this.#signerInitialisationError !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw this.#signerInitialisationError;
      }
      throw new Error('Signer failed to initialise');
    }

    return ethSigner;
  }

  async #callSessionActivity(zkEvmAddress: string) {
    const sendTransactionClosure = async (params: Array<any>, flow: Flow) => {
      const ethSigner = await this.#getSigner();
      return await sendTransaction({
        params,
        ethSigner,
        guardianClient: this.#guardianClient,
        rpcProvider: this.#rpcProvider,
        relayerClient: this.#relayerClient,
        zkEvmAddress,
        flow,
      });
    };
    this.#passportEventEmitter.emit(PassportEvents.ACCOUNTS_REQUESTED, {
      environment: this.#config.baseConfig.environment,
      sendTransaction: sendTransactionClosure,
      walletAddress: zkEvmAddress,
      passportClient: this.#config.oidcConfiguration.clientId,
    });
  }

  // Used to get the registered zkEvm address from the User session
  async #getZkEvmAddress() {
    try {
      const user = await this.#authManager.getUser();
      if (user && isZkEvmUser(user)) {
        return user.zkEvm.ethAddress;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  async #performRequest(request: RequestArguments): Promise<any> {
    // This is required for sending session activity events

    switch (request.method) {
      case 'eth_requestAccounts': {
        const zkEvmAddress = await this.#getZkEvmAddress();
        if (zkEvmAddress) return [zkEvmAddress];

        const flow = trackFlow('passport', 'ethRequestAccounts');

        try {
          const user = await this.#authManager.getUserOrLogin();
          flow.addEvent('endGetUserOrLogin');

          this.#initialiseEthSigner(user);

          let userZkEvmEthAddress;

          if (!isZkEvmUser(user)) {
            flow.addEvent('startUserRegistration');

            const ethSigner = await this.#getSigner();
            flow.addEvent('ethSignerResolved');

            userZkEvmEthAddress = await registerZkEvmUser({
              ethSigner,
              authManager: this.#authManager,
              multiRollupApiClients: this.#multiRollupApiClients,
              accessToken: user.accessToken,
              rpcProvider: this.#rpcProvider,
              flow,
            });
            flow.addEvent('endUserRegistration');
          } else {
            userZkEvmEthAddress = user.zkEvm.ethAddress;
          }

          this.#providerEventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, [
            userZkEvmEthAddress,
          ]);
          identify({
            passportId: user.profile.sub,
          });
          this.#callSessionActivity(userZkEvmEthAddress);
          return [userZkEvmEthAddress];
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', 'ethRequestAccounts', error);
          }
          flow.addEvent('errored');
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }
      case 'eth_sendTransaction': {
        const zkEvmAddress = await this.#getZkEvmAddress();
        if (!zkEvmAddress) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - call eth_requestAccounts first',
          );
        }

        const flow = trackFlow('passport', 'ethSendTransaction');

        try {
          return await this.#guardianClient.withConfirmationScreen({
            width: 480,
            height: 720,
          })(async () => {
            const ethSigner = await this.#getSigner();
            flow.addEvent('endGetSigner');

            return await sendTransaction({
              params: request.params || [],
              ethSigner,
              guardianClient: this.#guardianClient,
              rpcProvider: this.#rpcProvider,
              relayerClient: this.#relayerClient,
              zkEvmAddress,
              flow,
            });
          });
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', 'eth_sendTransaction', error);
          }
          flow.addEvent('errored');
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }
      case 'eth_accounts': {
        const zkEvmAddress = await this.#getZkEvmAddress();
        return zkEvmAddress ? [zkEvmAddress] : [];
      }
      case 'personal_sign': {
        const zkEvmAddress = await this.#getZkEvmAddress();
        if (!zkEvmAddress) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - call eth_requestAccounts first',
          );
        }

        const flow = trackFlow('passport', 'personalSign');

        try {
          return await this.#guardianClient.withConfirmationScreen({
            width: 480,
            height: 720,
          })(async () => {
            const ethSigner = await this.#getSigner();
            flow.addEvent('endGetSigner');

            return await personalSign({
              params: request.params || [],
              ethSigner,
              zkEvmAddress,
              rpcProvider: this.#rpcProvider,
              guardianClient: this.#guardianClient,
              relayerClient: this.#relayerClient,
              flow,
            });
          });
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', 'personal_sign', error);
          }
          flow.addEvent('errored');
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4': {
        const zkEvmAddress = await this.#getZkEvmAddress();
        if (!zkEvmAddress) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - call eth_requestAccounts first',
          );
        }

        const flow = trackFlow('passport', 'ethSignTypedDataV4');

        try {
          return await this.#guardianClient.withConfirmationScreen({
            width: 480,
            height: 720,
          })(async () => {
            const ethSigner = await this.#getSigner();
            flow.addEvent('endGetSigner');

            return await signTypedDataV4({
              method: request.method,
              params: request.params || [],
              ethSigner,
              rpcProvider: this.#rpcProvider,
              relayerClient: this.#relayerClient,
              guardianClient: this.#guardianClient,
              flow,
            });
          });
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', 'eth_signTypedData', error);
          }
          flow.addEvent('errored');
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }
      case 'eth_chainId': {
        // Call detect network to fetch the chainId so to take advantage of
        // the caching layer provided by StaticJsonRpcProvider.
        // In case Passport is changed from StaticJsonRpcProvider to a
        // JsonRpcProvider, this function will still work as expected given
        // that detectNetwork call _uncachedDetectNetwork which will force
        // the provider to re-fetch the chainId from remote.
        const { chainId } = await this.#rpcProvider.detectNetwork();
        return utils.hexlify(chainId);
      }
      // Pass through methods
      case 'eth_getBalance':
      case 'eth_getCode':
      case 'eth_getTransactionCount': {
        const [address, blockNumber] = request.params || [];
        return this.#rpcProvider.send(request.method, [
          address,
          blockNumber || 'latest',
        ]);
      }
      case 'eth_getStorageAt': {
        const [address, storageSlot, blockNumber] = request.params || [];
        return this.#rpcProvider.send(request.method, [
          address,
          storageSlot,
          blockNumber || 'latest',
        ]);
      }
      case 'eth_call':
      case 'eth_estimateGas': {
        const [transaction, blockNumber] = request.params || [];
        return this.#rpcProvider.send(request.method, [
          transaction,
          blockNumber || 'latest',
        ]);
      }
      case 'eth_gasPrice':
      case 'eth_blockNumber':
      case 'eth_getBlockByHash':
      case 'eth_getBlockByNumber':
      case 'eth_getTransactionByHash':
      case 'eth_getTransactionReceipt': {
        return this.#rpcProvider.send(request.method, request.params || []);
      }
      default: {
        throw new JsonRpcError(
          ProviderErrorCode.UNSUPPORTED_METHOD,
          'Method not supported',
        );
      }
    }
  }

  async #performJsonRpcRequest(
    request: JsonRpcRequestPayload,
  ): Promise<JsonRpcResponsePayload> {
    const { id, jsonrpc } = request;
    try {
      const result = await this.#performRequest(request);
      return {
        id,
        jsonrpc,
        result,
      };
    } catch (error: unknown) {
      let jsonRpcError: JsonRpcError;
      if (error instanceof JsonRpcError) {
        jsonRpcError = error;
      } else if (error instanceof Error) {
        jsonRpcError = new JsonRpcError(
          RpcErrorCode.INTERNAL_ERROR,
          error.message,
        );
      } else {
        jsonRpcError = new JsonRpcError(
          RpcErrorCode.INTERNAL_ERROR,
          'Internal error',
        );
      }

      return {
        id,
        jsonrpc,
        error: jsonRpcError,
      };
    }
  }

  public async request(request: RequestArguments): Promise<any> {
    try {
      return this.#performRequest(request);
    } catch (error: unknown) {
      if (error instanceof JsonRpcError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, error.message);
      }

      throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, 'Internal error');
    }
  }

  public sendAsync(
    request: JsonRpcRequestPayload | JsonRpcRequestPayload[],
    callback?: JsonRpcRequestCallback,
  ) {
    if (!callback) {
      throw new Error('No callback provided');
    }

    if (Array.isArray(request)) {
      Promise.all(request.map(this.#performJsonRpcRequest))
        .then((result) => {
          callback(null, result);
        })
        .catch((error: JsonRpcError) => {
          callback(error, []);
        });
    } else {
      this.#performJsonRpcRequest(request)
        .then((result) => {
          callback(null, result);
        })
        .catch((error: JsonRpcError) => {
          callback(error, null);
        });
    }
  }

  public async send(
    request: string | JsonRpcRequestPayload | JsonRpcRequestPayload[],
    callbackOrParams?: JsonRpcRequestCallback | Array<any>,
    callback?: JsonRpcRequestCallback,
  ) {
    // Web3 >= 1.0.0-beta.38 calls `send` with method and parameters.
    if (typeof request === 'string') {
      if (typeof callbackOrParams === 'function') {
        return this.sendAsync(
          {
            method: request,
            params: [],
          },
          callbackOrParams,
        );
      }

      if (callback) {
        return this.sendAsync(
          {
            method: request,
            params: Array.isArray(callbackOrParams) ? callbackOrParams : [],
          },
          callback,
        );
      }

      return this.request({
        method: request,
        params: Array.isArray(callbackOrParams) ? callbackOrParams : [],
      });
    }

    // Web3 <= 1.0.0-beta.37 uses `send` with a callback for async queries.
    if (typeof callbackOrParams === 'function') {
      return this.sendAsync(request, callbackOrParams);
    }

    if (!Array.isArray(request) && typeof request === 'object') {
      return this.#performJsonRpcRequest(request);
    }

    throw new JsonRpcError(RpcErrorCode.INVALID_REQUEST, 'Invalid request');
  }

  public on(event: string, listener: (...args: any[]) => void): void {
    this.#providerEventEmitter.on(event, listener);
  }

  public removeListener(
    event: string,
    listener: (...args: any[]) => void,
  ): void {
    this.#providerEventEmitter.removeListener(event, listener);
  }
}
