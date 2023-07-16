import { ExternalProvider, JsonRpcProvider } from '@ethersproject/providers';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { ethSendTransaction } from './rpcMethods';
import {
  JsonRpcRequestCallback,
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
  Provider,
  RequestArguments,
} from './types';
import AuthManager from '../authManager';
import { PassportConfiguration } from '../config';
import { ConfirmationScreen } from '../confirmation';
import MagicAdapter from '../magicAdapter';
import { UserZkEvm } from '../types';
import { RelayerAdapter } from './relayerAdapter';
import { EthMethodWithAuthParams } from './rpcMethods/types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { registerZkEvmUser } from './userRegistration';

export type ZkEvmProviderInput = {
  authManager: AuthManager;
  magicAdapter: MagicAdapter,
  config: PassportConfiguration,
  confirmationScreen: ConfirmationScreen,
  multiRollupApiClients: MultiRollupApiClients,
};

type LoggedInZkEvmProvider = {
  magicProvider: ExternalProvider;
  user: UserZkEvm;
};

export class ZkEvmProvider implements Provider {
  private readonly authManager: AuthManager;

  private readonly config: PassportConfiguration;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly magicAdapter: MagicAdapter;

  private readonly relayerAdapter: RelayerAdapter;

  private readonly multiRollupApiClients: MultiRollupApiClients;

  private readonly jsonRpcProvider: JsonRpcProvider; // Used for read operations

  protected magicProvider?: ExternalProvider; // Used for signing

  protected user?: UserZkEvm;

  constructor({
    authManager,
    magicAdapter,
    config,
    confirmationScreen,
    multiRollupApiClients,
  }: ZkEvmProviderInput) {
    this.authManager = authManager;
    this.magicAdapter = magicAdapter;
    this.config = config;
    this.confirmationScreen = confirmationScreen;
    this.relayerAdapter = new RelayerAdapter({ config });
    this.jsonRpcProvider = new JsonRpcProvider(this.config.zkEvmRpcUrl);
    this.multiRollupApiClients = multiRollupApiClients;
  }

  private isLoggedIn(): this is LoggedInZkEvmProvider {
    return this.magicProvider !== undefined && this.user !== undefined;
  }

  private performRequest = async (request: RequestArguments): Promise<any> => {
    const authWrapper = (fn: (params: EthMethodWithAuthParams) => Promise<any>) => {
      if (!this.isLoggedIn()) {
        throw new JsonRpcError(RpcErrorCode.UNAUTHORIZED, 'Unauthorised - call eth_requestAccounts first');
      }

      return fn({
        params: request.params || [],
        magicProvider: this.magicProvider,
        jsonRpcProvider: this.jsonRpcProvider,
        config: this.config,
        confirmationScreen: this.confirmationScreen,
        relayerAdapter: this.relayerAdapter,
        user: this.user,
      });
    };

    switch (request.method) {
      case 'eth_requestAccounts': {
        if (this.isLoggedIn()) {
          return [this.user.zkEvm.ethAddress];
        }
        const { magicProvider, user } = await registerZkEvmUser({
          authManager: this.authManager,
          config: this.config,
          magicAdapter: this.magicAdapter,
          multiRollupApiClients: this.multiRollupApiClients,
        });

        this.user = user;
        this.magicProvider = magicProvider;

        return [this.user.zkEvm.ethAddress];
      }
      case 'eth_sendTransaction': {
        return authWrapper(ethSendTransaction);
      }
      case 'eth_accounts': {
        return this.isLoggedIn() ? [this.user.zkEvm.ethAddress] : [];
      }
      // Pass through methods
      case 'eth_gasPrice':
      case 'eth_getBalance':
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
        return this.jsonRpcProvider.send(request.method, request.params || []);
      }
      default: {
        throw new JsonRpcError(RpcErrorCode.METHOD_NOT_FOUND, 'Method not supported');
      }
    }
  };

  private performJsonRpcRequest = async (request: JsonRpcRequestPayload): Promise<JsonRpcResponsePayload> => {
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
  };

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
}
