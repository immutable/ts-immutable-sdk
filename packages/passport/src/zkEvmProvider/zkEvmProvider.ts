import { ExternalProvider } from '@ethersproject/providers';
import { ethSendTransaction } from './rpcMethods';
import {
  JsonRpcRequestCallback, JsonRpcRequestPayload, JsonRpcResponsePayload, RpcErrorCode,
} from './types';
import AuthManager from '../authManager';
import { PassportConfiguration } from '../config';
import { ConfirmationScreen } from '../confirmation';
import MagicAdapter from '../magicAdapter';
import { User } from '../types';

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
            this.user = await this.authManager.getUser() ?? await this.authManager.login();
            if (this.user && this.user.idToken) {
              this.magicProvider = await this.magicAdapter.login(
                this.user.idToken,
                {
                  rpcUrl: this.config.zkEvmRpcUrl,
                  chainId: this.config.zkEvmChainId,
                },
              );
            }

            if (this.magicProvider && this.magicProvider.request) {
              return this.magicProvider.request(request);
            }

            response.result = [];
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
            code: RpcErrorCode.INTERNAL_ERROR,
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
