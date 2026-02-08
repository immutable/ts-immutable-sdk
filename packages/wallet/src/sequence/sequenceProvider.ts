import {
  createPublicClient,
  http,
  toHex,
  type PublicClient,
} from 'viem';
import { TypedEventEmitter } from '@imtbl/auth';
import {
  Provider,
  ProviderEventMap,
  RequestArguments,
  ChainConfig,
  GetUserFunction,
} from '../types';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from '../zkEvm/JsonRpcError';
import GuardianClient from '../guardian';

export type SequenceProviderInput = {
  getUser: GetUserFunction;
  chainConfig: ChainConfig;
  guardianClient: GuardianClient;
};

export class SequenceProvider implements Provider {
  readonly #getUser: GetUserFunction;

  readonly #chainConfig: ChainConfig;

  readonly #rpcProvider: PublicClient;

  readonly #providerEventEmitter: TypedEventEmitter<ProviderEventMap>;

  readonly #guardianClient: GuardianClient;

  public readonly isPassport: boolean = true;

  constructor({
    getUser,
    chainConfig,
    guardianClient,
  }: SequenceProviderInput) {
    // Validate this is not a zkEVM chain
    this.#getUser = getUser;
    this.#chainConfig = chainConfig;
    this.#guardianClient = guardianClient;

    // Create PublicClient for reading from the chain using viem
    this.#rpcProvider = createPublicClient({
      transport: http(this.#chainConfig.rpcUrl),
    });
  }

  async #performRequest(request: RequestArguments): Promise<any> {
    switch (request.method) {
      // TODO: Implement eth_requestAccounts
      case 'eth_requestAccounts': {
        throw new JsonRpcError(
          ProviderErrorCode.UNSUPPORTED_METHOD,
          'eth_requestAccounts not yet implemented for this chain',
        );
      }

      case 'eth_accounts': {
        return [];
      }

      // TODO: Implement eth_sendTransaction
      case 'eth_sendTransaction': {
        throw new JsonRpcError(
          ProviderErrorCode.UNSUPPORTED_METHOD,
          'eth_sendTransaction not yet implemented for this chain',
        );
      }

      // TODO: Implement personal_sign
      case 'personal_sign': {
        throw new JsonRpcError(
          ProviderErrorCode.UNSUPPORTED_METHOD,
          'personal_sign not yet implemented for this chain',
        );
      }

      // TODO: Implement eth_signTypedData
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4': {
        throw new JsonRpcError(
          ProviderErrorCode.UNSUPPORTED_METHOD,
          'eth_signTypedData not yet implemented for this chain',
        );
      }

      case 'eth_chainId': {
        const chainId = await this.#rpcProvider.getChainId();
        return toHex(chainId);
      }

      // Pass through methods
      case 'eth_getBalance':
      case 'eth_getCode':
      case 'eth_getTransactionCount': {
        const [address, blockNumber] = request.params || [];
        return this.#rpcProvider.request({
          method: request.method as any,
          params: [address, blockNumber || 'latest'],
        });
      }

      case 'eth_getStorageAt': {
        const [address, storageSlot, blockNumber] = request.params || [];
        return this.#rpcProvider.request({
          method: 'eth_getStorageAt',
          params: [address, storageSlot, blockNumber || 'latest'],
        });
      }

      case 'eth_call':
      case 'eth_estimateGas': {
        const [transaction, blockNumber] = request.params || [];
        return this.#rpcProvider.request({
          method: request.method as any,
          params: [transaction, blockNumber || 'latest'],
        });
      }

      case 'eth_gasPrice':
      case 'eth_blockNumber':
      case 'eth_getBlockByHash':
      case 'eth_getBlockByNumber':
      case 'eth_getTransactionByHash':
      case 'eth_getTransactionReceipt': {
        return this.#rpcProvider.request({
          method: request.method as any,
          params: (request.params || []) as any,
        });
      }

      default: {
        throw new JsonRpcError(
          ProviderErrorCode.UNSUPPORTED_METHOD,
          'Method not supported',
        );
      }
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
