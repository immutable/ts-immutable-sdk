import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { Signer } from '@ethersproject/abstract-signer';
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
  PassportEventMap,
  PassportEvents,
  User,
  UserZkEvm,
} from '../types';
import { RelayerClient } from './relayerClient';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from './JsonRpcError';
import { registerZkEvmUser } from './user';
import { sendTransaction } from './sendTransaction';
import GuardianClient from '../guardian';
import { signTypedDataV4 } from './signTypedDataV4';

export type ZkEvmProviderInput = {
  authManager: AuthManager;
  magicAdapter: MagicAdapter,
  config: PassportConfiguration,
  multiRollupApiClients: MultiRollupApiClients,
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
  guardianClient: GuardianClient;
};

const isZkEvmUser = (user: User): user is UserZkEvm => 'zkEvm' in user;

export class ZkEvmProvider implements Provider {
  readonly #authManager: AuthManager;

  readonly #config: PassportConfiguration;

  readonly #eventEmitter: TypedEventEmitter<ProviderEventMap>;

  readonly #guardianClient: GuardianClient;

  readonly #jsonRpcProvider: JsonRpcProvider; // Used for read

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

  #zkEvmAddress?: string;

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

    if (config.crossSdkBridgeEnabled) {
      // JsonRpcProvider by default sets the referrer as "client".
      // On Unreal 4 this errors as the browser used is expecting a valid URL.
      this.#jsonRpcProvider = new JsonRpcProvider({
        url: this.#config.zkEvmRpcUrl,
        fetchOptions: { referrer: 'http://imtblgamesdk.local' },
      });
    } else {
      this.#jsonRpcProvider = new JsonRpcProvider(this.#config.zkEvmRpcUrl);
    }

    this.#relayerClient = new RelayerClient({
      config: this.#config,
      jsonRpcProvider: this.#jsonRpcProvider,
      authManager: this.#authManager,
    });

    this.#multiRollupApiClients = multiRollupApiClients;
    this.#eventEmitter = new TypedEventEmitter<ProviderEventMap>();

    passportEventEmitter.on(PassportEvents.LOGGED_OUT, this.#handleLogout);
  }

  #handleLogout = () => {
    const shouldEmitAccountsChanged = !!this.#zkEvmAddress;

    this.#ethSigner = undefined;
    this.#zkEvmAddress = undefined;

    if (shouldEmitAccountsChanged) {
      this.#eventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, []);
    }
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
  async #initialiseEthSigner(user: User) {
    const generateSigner = async (): Promise<Signer> => {
      const magicRpcProvider = await this.#magicAdapter.login(user.idToken!);
      const web3Provider = new Web3Provider(magicRpcProvider);

      return web3Provider.getSigner();
    };

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
        throw this.#signerInitialisationError;
      }
      throw new Error('Signer failed to initialise');
    }

    return ethSigner;
  }

  async #performRequest(request: RequestArguments): Promise<any> {
    switch (request.method) {
      case 'eth_requestAccounts': {
        if (this.#zkEvmAddress) {
          return [this.#zkEvmAddress];
        }

        const user = await this.#authManager.getUserOrLogin();
        this.#initialiseEthSigner(user);

        if (!isZkEvmUser(user)) {
          const ethSigner = await this.#getSigner();

          const userZkEvm = await registerZkEvmUser({
            ethSigner,
            authManager: this.#authManager,
            multiRollupApiClients: this.#multiRollupApiClients,
            accessToken: user.accessToken,
            jsonRpcProvider: this.#jsonRpcProvider,
          });

          this.#zkEvmAddress = userZkEvm.zkEvm.ethAddress;
        } else {
          this.#zkEvmAddress = user.zkEvm.ethAddress;
        }

        this.#eventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, [this.#zkEvmAddress]);

        return [this.#zkEvmAddress];
      }
      case 'eth_sendTransaction': {
        if (!this.#zkEvmAddress) {
          throw new JsonRpcError(ProviderErrorCode.UNAUTHORIZED, 'Unauthorised - call eth_requestAccounts first');
        }

        const ethSigner = await this.#getSigner();

        return sendTransaction({
          params: request.params || [],
          ethSigner,
          guardianClient: this.#guardianClient,
          jsonRpcProvider: this.#jsonRpcProvider,
          relayerClient: this.#relayerClient,
          zkevmAddress: this.#zkEvmAddress,
        });
      }
      case 'eth_accounts': {
        return this.#zkEvmAddress ? [this.#zkEvmAddress] : [];
      }
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4': {
        if (!this.#zkEvmAddress) {
          throw new JsonRpcError(ProviderErrorCode.UNAUTHORIZED, 'Unauthorised - call eth_requestAccounts first');
        }

        const ethSigner = await this.#getSigner();

        return signTypedDataV4({
          method: request.method,
          params: request.params || [],
          ethSigner,
          jsonRpcProvider: this.#jsonRpcProvider,
          relayerClient: this.#relayerClient,
          guardianClient: this.#guardianClient,
        });
      }
      // Pass through methods
      case 'eth_gasPrice':
      case 'eth_getBalance':
      case 'eth_getCode':
      case 'eth_getStorageAt':
      case 'eth_estimateGas':
      case 'eth_call':
      case 'eth_blockNumber':
      case 'eth_chainId':
      case 'eth_getBlockByHash':
      case 'eth_getBlockByNumber':
      case 'eth_getTransactionByHash':
      case 'eth_getTransactionReceipt':
      case 'eth_getTransactionCount': {
        return this.#jsonRpcProvider.send(request.method, request.params || []);
      }
      default: {
        throw new JsonRpcError(ProviderErrorCode.UNSUPPORTED_METHOD, 'Method not supported');
      }
    }
  }

  async #performJsonRpcRequest(request: JsonRpcRequestPayload): Promise<JsonRpcResponsePayload> {
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
        jsonRpcError = new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, error.message);
      } else {
        jsonRpcError = new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, 'Internal error');
      }

      return {
        id,
        jsonrpc,
        error: jsonRpcError,
      };
    }
  }

  public async request(
    request: RequestArguments,
  ): Promise<any> {
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
      Promise.all(request.map(this.#performJsonRpcRequest)).then((result) => {
        callback(null, result);
      }).catch((error: JsonRpcError) => {
        callback(error, []);
      });
    } else {
      this.#performJsonRpcRequest(request).then((result) => {
        callback(null, result);
      }).catch((error: JsonRpcError) => {
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
        return this.sendAsync({
          method: request,
          params: [],
        }, callbackOrParams);
      }

      if (callback) {
        return this.sendAsync({
          method: request,
          params: Array.isArray(callbackOrParams) ? callbackOrParams : [],
        }, callback);
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
    this.#eventEmitter.on(event, listener);
  }

  public removeListener(event: string, listener: (...args: any[]) => void): void {
    this.#eventEmitter.removeListener(event, listener);
  }
}
