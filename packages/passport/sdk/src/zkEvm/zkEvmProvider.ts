import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { Signer, utils } from 'ethers';
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
  isUserZkEvm, PassportEventMap, PassportEvents, User, UserZkEvm,
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

    passportEventEmitter.on(PassportEvents.LOGGED_OUT, this.#handleLogout);
    passportEventEmitter.on(
      PassportEvents.ACCOUNTS_REQUESTED,
      trackSessionActivity,
    );
  }

  #handleLogout = () => {
    this.#providerEventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, []);
  };

  async #callSessionActivity(zkEvmAddress: string) {
    const sendTransactionClosure = async (params: Array<any>, flow: Flow) => {
      const ethSigner = await this.#magicAdapter.getSigner();
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

  // eslint-disable-next-line class-methods-use-this
  #getZkEvmUser(user: User | null): UserZkEvm | undefined {
    if (user && isUserZkEvm(user)) {
      return user;
    }
    return undefined;
  }

  async #performRequest(request: RequestArguments): Promise<any> {
    // This is required for sending session activity events

    // Get user from local storage
    let zkEvmUser: UserZkEvm | undefined;
    let magicSigner: Promise<Signer>;

    try {
      const user = await this.#authManager.getUser();
      zkEvmUser = this.#getZkEvmUser(user);

      // Initialise signer for all RPC calls if registered user exists
      if (zkEvmUser) {
        magicSigner = this.#magicAdapter.getSigner();
      }
    } catch (e) {
      // Fail silently so that the request method can handle the error independently
    }

    switch (request.method) {
      case 'eth_requestAccounts': {
        const requestAccounts = async () => {
          const flow = trackFlow('passport', 'ethRequestAccounts');

          if (zkEvmUser) {
            return [zkEvmUser.zkEvm.ethAddress];
          }

          try {
            const loggedInUser = await this.#authManager.getUserOrLogin();
            flow.addEvent('endGetUserOrLogin');

            let userZkEvmEthAddress;

            if (!isUserZkEvm(loggedInUser)) {
              flow.addEvent('startUserRegistration');

              const ethSigner = await this.#magicAdapter.getSigner();
              flow.addEvent('ethSignerResolved');

              userZkEvmEthAddress = await registerZkEvmUser({
                ethSigner,
                authManager: this.#authManager,
                multiRollupApiClients: this.#multiRollupApiClients,
                accessToken: loggedInUser.accessToken,
                rpcProvider: this.#rpcProvider,
                flow,
              });
              flow.addEvent('endUserRegistration');
            } else {
              userZkEvmEthAddress = loggedInUser.zkEvm.ethAddress;
            }

            this.#providerEventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, [
              userZkEvmEthAddress,
            ]);
            identify({
              passportId: loggedInUser.profile.sub,
            });
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
        };

        const addresses = await requestAccounts();
        const [zkEvmAddress] = addresses;
        this.#callSessionActivity(zkEvmAddress);
        return addresses;
      }
      case 'eth_sendTransaction': {
        if (!zkEvmUser) {
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
            const ethSigner = await magicSigner;
            flow.addEvent('endGetSigner');

            return await sendTransaction({
              params: request.params || [],
              ethSigner,
              guardianClient: this.#guardianClient,
              rpcProvider: this.#rpcProvider,
              relayerClient: this.#relayerClient,
              zkEvmAddress: zkEvmUser.zkEvm.ethAddress,
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
        const zkEvmAddress = zkEvmUser?.zkEvm?.ethAddress;
        return zkEvmAddress ? [zkEvmAddress] : [];
      }
      case 'personal_sign': {
        if (!zkEvmUser) {
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
            const ethSigner = await magicSigner;
            flow.addEvent('endGetSigner');

            return await personalSign({
              params: request.params || [],
              ethSigner,
              zkEvmAddress: zkEvmUser.zkEvm.ethAddress,
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
        if (!zkEvmUser) {
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
            const ethSigner = await magicSigner;
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
