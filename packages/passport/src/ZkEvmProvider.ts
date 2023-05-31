import ethers from 'ethers';
import {
  JsonRpcRequestCallback, JsonRpcRequestPayload, JsonRpcResponsePayload,
} from 'magic-sdk';
import { RPCErrorCode } from '@magic-sdk/types/dist/types/core/exception-types';
import ConfirmationScreen from './confirmation/confirmation';
import { User } from './types';
import { ethSendTransaction } from './rpcMethods';
import { PassportConfiguration } from './config';

export type ZkEvmProviderInput = {
  magicProvider: ethers.providers.ExternalProvider,
  config: PassportConfiguration,
  confirmationScreen: ConfirmationScreen,
  user: User,
};

export class ZkEvmProvider {
  private readonly magicProvider: ethers.providers.ExternalProvider;

  private readonly config: PassportConfiguration;

  private readonly confirmationScreen: ConfirmationScreen;

  constructor({
    magicProvider,
    config,
    confirmationScreen,
    user,
  }: ZkEvmProviderInput) {
    this.magicProvider = magicProvider;
    this.config = config;
    this.confirmationScreen = confirmationScreen;
    this.user = user;
  }

  private readonly user: User;

  public async sendAsync(
    request: JsonRpcRequestPayload,
    callback: JsonRpcRequestCallback,
  ) {
    const response: JsonRpcResponsePayload = {
      jsonrpc: '2.0',
      id: request.id!,
      result: null,
    };

    try {
      switch (request.method) {
        case 'eth_sendTransaction': {
          response.result = await ethSendTransaction(
            request.params[0],
            this.magicProvider,
            this.config,
            this.confirmationScreen,
          );
          break;
        }
        default: {
          break;
        }
      }
    } catch (error: any) {
      if (error instanceof Error) {
        response.result = null;
        response.error = {
          ...error,
          code: RPCErrorCode.InternalError,
        };
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
