import ethers from 'ethers';
import {
  JsonRpcRequestCallback, JsonRpcRequestPayload, JsonRpcResponsePayload,
} from 'magic-sdk';
import { RPCErrorCode } from '@magic-sdk/types/dist/types/core/exception-types';
import ConfirmationScreen from './confirmation/confirmation';
import { User } from './types';
import { ethSendTransaction } from './rpcMethods';

export class ZkEvmProvider {
  private readonly provider: ethers.providers.JsonRpcProvider;

  private readonly relayerProvider: ethers.providers.JsonRpcProvider;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly user: User;

  constructor(
    ethereumNodeUrl: string, // TODO: What should this be?
    sequenceRelayerUrl: string,
    confirmationScreen: ConfirmationScreen,
    user: User,
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(ethereumNodeUrl);
    this.relayerProvider = new ethers.providers.JsonRpcProvider(sequenceRelayerUrl);
    this.confirmationScreen = confirmationScreen;
    this.user = user;
  }

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
            this.provider,
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
