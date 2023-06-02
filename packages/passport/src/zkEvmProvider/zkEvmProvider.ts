import { ExternalProvider } from '@ethersproject/providers';
import { ethRequestAccounts, ethSendTransaction } from './rpcMethods';
import {
  JsonRpcRequestCallback, JsonRpcRequestPayload, JsonRpcResponsePayload, RpcErrorCode,
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
    request: JsonRpcRequestPayload,
  ) {
    return this.sendAsync(request);
  }

  public async sendAsync(
    request: JsonRpcRequestPayload,
    callback?: JsonRpcRequestCallback,
  ) {
    const response: JsonRpcResponsePayload = {
      jsonrpc: '2.0',
      id: request.id!,
      result: null,
    };

    if (METHODS_REQUIRING_AUTHORISATION.includes(request.method) && !this.magicProvider) {
      response.error = {
        message: 'Unauthorised',
        code: RpcErrorCode.UNAUTHORISED,
      };
    } else {
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
            response.result = result;

            break;
          }
          case 'eth_sendTransaction': {
            response.result = await ethSendTransaction({
              transactionRequest: request.params[0],
              magicProvider: this.magicProvider!,
              config: this.config,
              confirmationScreen: this.confirmationScreen,
            });

            break;
          }
          default: {
            response.error = {
              message: 'Method not supported',
              code: RpcErrorCode.METHOD_NOT_FOUND,
            };
            break;
          }
        }
      } catch (error: any) {
        if (error instanceof Error) {
          response.result = null;
          response.error = {
            ...error,
            code: 'code' in error
              ? error.code as RpcErrorCode
              : RpcErrorCode.INTERNAL_ERROR,
          };
        }
      }
    }

    if (typeof callback === 'function') {
      return callback(null, response);
    }
    return new Promise<JsonRpcResponsePayload>((resolve, reject) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response.result);
      }
    });
  }
}
