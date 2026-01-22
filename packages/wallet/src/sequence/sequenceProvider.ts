import {
  createPublicClient,
  http,
  toHex,
  type PublicClient,
} from 'viem';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { Auth, TypedEventEmitter, User } from '@imtbl/auth';
import { trackFlow, trackError, identify } from '@imtbl/metrics';
import {
  Provider,
  ProviderEvent,
  ProviderEventMap,
  RequestArguments,
  ChainConfig,
  EvmChain,
} from '../types';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from '../zkEvm/JsonRpcError';
import GuardianClient from '../guardian';
import { SequenceSigner } from './signer';
import { registerUser } from './user';
import { getEvmChainFromChainId } from '../network/chainRegistry';

export type SequenceProviderInput = {
  auth: Auth;
  chainConfig: ChainConfig;
  multiRollupApiClients: MultiRollupApiClients;
  guardianClient: GuardianClient;
  ethSigner: SequenceSigner;
  passportEventEmitter: TypedEventEmitter<ProviderEventMap>;
};

/** Non-zkEVM chain type */
type SequenceChain = Exclude<EvmChain, EvmChain.ZKEVM>;

/**
 * Check if user is registered for a non-zkEVM chain.
 * The chain data is stored as user[chainName] (e.g., user.arbitrum_one).
 */
function isUserRegisteredForChain(user: User, chain: SequenceChain): boolean {
  return chain in user && !!(user as any)[chain]?.ethAddress;
}

/**
 * Get the user's eth address for a non-zkEVM chain.
 */
function getUserChainAddress(user: User, chain: SequenceChain): string | undefined {
  const chainData = (user as any)[chain];
  return chainData?.ethAddress;
}

export class SequenceProvider implements Provider {
  readonly #auth: Auth;

  readonly #chainConfig: ChainConfig;

  readonly #multiRollupApiClients: MultiRollupApiClients;

  readonly #rpcProvider: PublicClient;

  readonly #providerEventEmitter: TypedEventEmitter<ProviderEventMap>;

  readonly #guardianClient: GuardianClient;

  readonly #ethSigner: SequenceSigner;

  readonly #evmChain: SequenceChain;

  public readonly isPassport: boolean = true;

  constructor({
    auth,
    chainConfig,
    multiRollupApiClients,
    guardianClient,
    ethSigner,
    passportEventEmitter,
  }: SequenceProviderInput) {
    // Validate this is not a zkEVM chain
    const evmChain = getEvmChainFromChainId(chainConfig.chainId);
    if (evmChain === EvmChain.ZKEVM) {
      throw new Error('SequenceProvider cannot be used for zkEVM chains. Use ZkEvmProvider instead.');
    }
    this.#evmChain = evmChain;

    this.#auth = auth;
    this.#chainConfig = chainConfig;
    this.#multiRollupApiClients = multiRollupApiClients;
    this.#guardianClient = guardianClient;
    this.#ethSigner = ethSigner;
    this.#providerEventEmitter = passportEventEmitter;

    // Create PublicClient for reading from the chain using viem
    this.#rpcProvider = createPublicClient({
      transport: http(this.#chainConfig.rpcUrl),
    });
  }

  /**
   * Get the user's address for this chain if already registered.
   */
  async #getChainAddress(): Promise<string | undefined> {
    const user = await this.#auth.getUser();
    if (user && isUserRegisteredForChain(user, this.#evmChain)) {
      return getUserChainAddress(user, this.#evmChain);
    }
    return undefined;
  }

  async #performRequest(request: RequestArguments): Promise<any> {
    switch (request.method) {
      case 'eth_requestAccounts': {
        // Check if already registered
        const existingAddress = await this.#getChainAddress();
        if (existingAddress) return [existingAddress];

        const flow = trackFlow('passport', 'ethRequestAccounts');

        try {
          const user = await this.#auth.getUserOrLogin();
          flow.addEvent('endGetUserOrLogin');

          let userEthAddress: string | undefined;

          if (!isUserRegisteredForChain(user, this.#evmChain)) {
            flow.addEvent('startUserRegistration');

            userEthAddress = await registerUser({
              auth: this.#auth,
              ethSigner: this.#ethSigner,
              multiRollupApiClients: this.#multiRollupApiClients,
              accessToken: user.accessToken,
              rpcProvider: this.#rpcProvider,
              flow,
            });
            flow.addEvent('endUserRegistration');
          } else {
            userEthAddress = getUserChainAddress(user, this.#evmChain);
          }

          if (!userEthAddress) {
            throw new JsonRpcError(
              RpcErrorCode.INTERNAL_ERROR,
              'Failed to get user address after registration',
            );
          }

          this.#providerEventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, [
            userEthAddress,
          ]);
          identify({
            passportId: user.profile.sub,
          });
          return [userEthAddress];
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', 'ethRequestAccounts', error, { flowId: flow.details.flowId });
          } else {
            flow.addEvent('errored');
          }
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }

      case 'eth_accounts': {
        const address = await this.#getChainAddress();
        return address ? [address] : [];
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
