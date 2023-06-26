import { ExternalProvider, JsonRpcProvider } from '@ethersproject/providers';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { ethRequestAccounts, ethSendTransaction, ethGasPrice } from './rpcMethods';
import { JsonRpcRequestCallback, JsonRpcRequestPayload, RequestArguments } from './types';
import AuthManager from '../authManager';
import { PassportConfiguration } from '../config';
import { ConfirmationScreen } from '../confirmation';
import MagicAdapter from '../magicAdapter';
import { UserWithEtherKey } from '../types';
import { RelayerAdapter } from './relayerAdapter';
import { EthMethod, EthMethodWithAuth } from './rpcMethods/types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';

export type ZkEvmProviderInput = {
  authManager: AuthManager;
  magicAdapter: MagicAdapter,
  config: PassportConfiguration,
  confirmationScreen: ConfirmationScreen,
  multiRollupApiClients: MultiRollupApiClients,
};

const METHODS_REQUIRING_AUTH: { [key: string]: EthMethodWithAuth } = {
  eth_sendTransaction: ethSendTransaction,
};

const METHODS_WITHOUT_AUTH: { [key: string]: EthMethod } = {
  eth_gasPrice: ethGasPrice,
};

export class ZkEvmProvider {
  private readonly authManager: AuthManager;

  private readonly config: PassportConfiguration;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly magicAdapter: MagicAdapter;

  private readonly relayerAdapter: RelayerAdapter;

  private readonly multiRollupApiClients: MultiRollupApiClients;

  private readonly jsonRpcProvider: JsonRpcProvider; // Used for read operations

  private magicProvider?: ExternalProvider; // Used for signing

  private user?: UserWithEtherKey;

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

  public async request(
    request: RequestArguments,
  ): Promise<any> {
    try {
      if (request.method === 'eth_requestAccounts') {
        const { result, magicProvider, user } = await ethRequestAccounts({
          authManager: this.authManager,
          config: this.config,
          magicAdapter: this.magicAdapter,
          multiRollupApiClients: this.multiRollupApiClients,
        });

        this.user = user;
        this.magicProvider = magicProvider;

        return result;
      }
      if (METHODS_REQUIRING_AUTH[request.method]) {
        if (this.magicProvider === undefined || this.user === undefined) {
          return Promise.reject(
            new JsonRpcError(RpcErrorCode.UNAUTHORIZED, 'Unauthorised - call eth_requestAccounts first'),
          );
        }

        return METHODS_REQUIRING_AUTH[request.method]({
          params: request.params,
          magicProvider: this.magicProvider,
          jsonRpcProvider: this.jsonRpcProvider,
          config: this.config,
          confirmationScreen: this.confirmationScreen,
          relayerAdapter: this.relayerAdapter,
          user: this.user,
        });
      }
      if (METHODS_WITHOUT_AUTH[request.method]) {
        return METHODS_WITHOUT_AUTH[request.method]({
          params: request.params,
          jsonRpcProvider: this.jsonRpcProvider,
          config: this.config,
        });
      }

      return Promise.reject(
        new JsonRpcError(RpcErrorCode.METHOD_NOT_FOUND, 'Method not supported'),
      );
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
    request: JsonRpcRequestPayload,
    callback?: JsonRpcRequestCallback,
  ) {
    if (!callback) {
      throw new Error('No callback provided');
    }

    this.request(request).then((result) => {
      callback(null, {
        result,
        jsonrpc: '2.0',
        id: request.id,
      });
    }).catch((error: JsonRpcError) => {
      callback(error, null);
    });
  }

  public send(method: string, params?: any[]) {
    return this.request({
      method,
      params,
    });
  }
}
