import { ExternalProvider } from '@ethersproject/providers';
import { ethRequestAccounts, ethSendTransaction } from './rpcMethods';
import {
  JsonRpcError,
  JsonRpcRequestCallback, JsonRpcRequestPayload, RequestArguments, RpcErrorCode,
} from './types';
import AuthManager from '../authManager';
import { PassportConfiguration } from '../config';
import { ConfirmationScreen } from '../confirmation';
import MagicAdapter from '../magicAdapter';
import { User } from '../types';
import { RelayerAdapter } from './relayerAdapter';

export type ZkEvmProviderInput = {
  authManager: AuthManager;
  magicAdapter: MagicAdapter,
  config: PassportConfiguration,
  confirmationScreen: ConfirmationScreen,
};

const METHODS_REQUIRING_AUTHORISATION = [
  'eth_sendTransaction',
];

export class ZkEvmProvider {
  private readonly authManager: AuthManager;

  private readonly config: PassportConfiguration;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly magicAdapter: MagicAdapter;

  private readonly relayerAdapter: RelayerAdapter;

  private magicProvider?: ExternalProvider;

  private user?: User;

  constructor({
    authManager,
    magicAdapter,
    config,
    confirmationScreen,
  }: ZkEvmProviderInput) {
    this.authManager = authManager;
    this.magicAdapter = magicAdapter;
    this.config = config;
    this.confirmationScreen = confirmationScreen;
    this.relayerAdapter = new RelayerAdapter({ config });
  }

  public async request(
    request: RequestArguments,
  ): Promise<any> {
    if (METHODS_REQUIRING_AUTHORISATION.includes(request.method) && !this.magicProvider) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        message: 'Unauthorised - call eth_requestAccounts first',
        code: RpcErrorCode.UNAUTHORISED,
      });
    }

    try {
      switch (request.method) {
        case 'eth_requestAccounts': {
          const { result, magicProvider, user } = await ethRequestAccounts({
            authManager: this.authManager,
            config: this.config,
            magicAdapter: this.magicAdapter,
          });

          this.user = user;
          this.magicProvider = magicProvider;

          return result;
        }
        case 'eth_sendTransaction': {
          return ethSendTransaction({
            transactionRequest: request.params[0],
            magicProvider: this.magicProvider!,
            config: this.config,
            confirmationScreen: this.confirmationScreen,
            relayerAdapter: this.relayerAdapter,
          });
        }
        default: {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject({
            message: 'Method not supported',
            code: RpcErrorCode.METHOD_NOT_FOUND,
          });
        }
      }
    } catch (error: any) {
      if (error instanceof Error) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject({
          message: error.message,
          code: 'code' in error
            ? error.code as RpcErrorCode
            : RpcErrorCode.INTERNAL_ERROR,
        });
      }

      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        message: 'Internal error',
        code: RpcErrorCode.INTERNAL_ERROR,
      });
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
