import { ExternalProvider, JsonRpcProvider } from '@ethersproject/providers';
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
  PassportEventMap, PassportEvents, User, UserZkEvm,
} from '../types';
import { RelayerClient } from './relayerClient';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from './JsonRpcError';
import {loginZkEvmUser, registerZkEvmUser} from './user';
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

type LoggedInZkEvmProvider = {
  magicProvider: ExternalProvider;
  relayerClient: RelayerClient;
  zkevmAddress: string;
};

const isZkevmUser = (user: User): user is UserZkEvm => 'zkEvm' in user;

export class ZkEvmProvider implements Provider {
  readonly #authManager: AuthManager;

  readonly #config: PassportConfiguration;

  readonly #eventEmitter: TypedEventEmitter<ProviderEventMap>;

  readonly #guardianClient: GuardianClient;

  readonly #jsonRpcProvider: JsonRpcProvider; // Used for read

  readonly #magicAdapter: MagicAdapter;

  readonly #multiRollupApiClients: MultiRollupApiClients;

  readonly #relayerClient: RelayerClient;

  #ethSigner?: Promise<Signer>;

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

    passportEventEmitter.on(PassportEvents.LOGGED_OUT, this.handleLogout);
  }

  private handleLogout = () => {
    const shouldEmitAccountsChanged = !!this.#zkEvmAddress;

    this.#ethSigner = undefined;
    this.#zkEvmAddress = undefined;

    if (shouldEmitAccountsChanged) {
      this.#eventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, []);
    }
  };

  private async performRequest(request: RequestArguments): Promise<any> {
    switch (request.method) {
      case 'eth_requestAccounts': {
        if (this.#zkEvmAddress) {
          return [this.#zkEvmAddress];
        }

        const user = await this.#authManager.getUserOrLogin();

        this.#initialiseSigners();

        if (!isZkevmUser(user)) {
          const ethSigner = await this.#ethSigner;
          const userZkEvm = await registerZkEvmUser({
            authManager: this.#authManager,
            multiRollupApiClients: this.#multiRollupApiClients,
            accessToken: user.accessToken,
            jsonRpcProvider: this.#jsonRpcProvider,
          });
        }

        const { magicProvider, user } = await loginZkEvmUser({
          authManager: this.#authManager,
          magicAdapter: this.#magicAdapter,
          multiRollupApiClients: this.#multiRollupApiClients,
          jsonRpcProvider: this.#jsonRpcProvider,
        });

        this.#magicProvider = magicProvider;
        this.#zkEvmAddress = user.zkEvm.ethAddress;

        this.#eventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, [user.zkEvm.ethAddress]);

        return [user.zkEvm.ethAddress];
      }
      case 'eth_sendTransaction': {
        if (!this.#zkEvmAddress) {
          throw new JsonRpcError(ProviderErrorCode.UNAUTHORIZED, 'Unauthorised - call eth_requestAccounts first');
        }
        return sendTransaction({
          params: request.params || [],
          magicProvider: this.#magicProvider,
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
        if (!this.isLoggedIn()) {
          throw new JsonRpcError(ProviderErrorCode.UNAUTHORIZED, 'Unauthorised - call eth_requestAccounts first');
        }
        return signTypedDataV4({
          method: request.method,
          params: request.params || [],
          magicProvider: this.#magicProvider,
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

  private async performJsonRpcRequest(request: JsonRpcRequestPayload): Promise<JsonRpcResponsePayload> {
    const { id, jsonrpc } = request;
    try {
      const result = await this.performRequest(request);
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
      return this.performRequest(request);
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
      Promise.all(request.map(this.performJsonRpcRequest)).then((result) => {
        callback(null, result);
      }).catch((error: JsonRpcError) => {
        callback(error, []);
      });
    } else {
      this.performJsonRpcRequest(request).then((result) => {
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
      return this.performJsonRpcRequest(request);
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
