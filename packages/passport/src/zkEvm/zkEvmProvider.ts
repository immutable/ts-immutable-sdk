import { ExternalProvider, JsonRpcProvider } from '@ethersproject/providers';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { ethRequestAccounts, ethSendTransaction } from './rpcMethods';
import { JsonRpcRequestCallback, JsonRpcRequestPayload, RequestArguments } from './types';
import AuthManager from '../authManager';
import { PassportConfiguration } from '../config';
import { ConfirmationScreen } from '../confirmation';
import MagicAdapter from '../magicAdapter';
import { UserZkEvm } from '../types';
import { RelayerAdapter } from './relayerAdapter';
import { EthMethodWithAuthParams } from './rpcMethods/types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';

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

export class ZkEvmProvider {
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

  public async request(
    request: RequestArguments,
  ): Promise<any> {
    const authWrapper = (fn: (params: EthMethodWithAuthParams) => Promise<any>) => {
      if (!this.isLoggedIn()) {
        throw new JsonRpcError(RpcErrorCode.UNAUTHORIZED, 'Unauthorised - call eth_requestAccounts first');
      }

      return fn({
        params: request.params,
        magicProvider: this.magicProvider,
        jsonRpcProvider: this.jsonRpcProvider,
        config: this.config,
        confirmationScreen: this.confirmationScreen,
        relayerAdapter: this.relayerAdapter,
        user: this.user,
      });
    };

    try {
      switch (request.method) {
        case 'eth_requestAccounts': {
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
        case 'eth_sendTransaction': {
          return authWrapper(ethSendTransaction);
        }
        case 'eth_accounts': {
          return this.isLoggedIn() ? [this.user.zkEvm.ethAddress] : [];
        }
        case 'eth_gasPrice':
        case 'eth_getBalance':
        case 'eth_getStorageAt':
        case 'eth_estimateGas': {
          return this.jsonRpcProvider.send(request.method, request.params);
        }
        default: {
          return Promise.reject(
            new JsonRpcError(RpcErrorCode.METHOD_NOT_FOUND, 'Method not supported'),
          );
        }
      }
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
