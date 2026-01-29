import { MultiRollupApiClients } from '@imtbl/generated-clients';
import {
  Flow, identify, trackError, trackFlow,
} from '@imtbl/metrics';
import {
  createPublicClient,
  http,
  toHex,
  type PublicClient,
} from 'viem';
import {
  Provider,
  ProviderEvent,
  ProviderEventMap,
  RequestArguments,
} from './types';
import { TypedEventEmitter } from '@imtbl/auth';
import { WalletConfiguration } from '../config';
import {
  WalletEventMap, WalletEvents, User, UserZkEvm, WalletSigner, GetUserFunction,
} from '../types';
import { RelayerClient } from './relayerClient';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from './JsonRpcError';
import { registerZkEvmUser } from './user';
import { sendTransaction } from './sendTransaction';
import GuardianClient from '../guardian';
import { signTypedDataV4 } from './signTypedDataV4';
import { personalSign } from './personalSign';
import { trackSessionActivity } from './sessionActivity/sessionActivity';
import { getNonce } from './walletHelpers';
import { sendDeployTransactionAndPersonalSign } from './sendDeployTransactionAndPersonalSign';
import { signEjectionTransaction } from './signEjectionTransaction';

export type ZkEvmProviderInput = {
  /**
   * Function that returns the current user with fresh tokens.
   * This is the primary way to provide authentication to the wallet.
   */
  getUser: GetUserFunction;
  /**
   * Client ID for session activity tracking.
   */
  clientId: string;
  config: WalletConfiguration;
  multiRollupApiClients: MultiRollupApiClients;
  walletEventEmitter: TypedEventEmitter<WalletEventMap>;
  guardianClient: GuardianClient;
  ethSigner: WalletSigner;
  user: User | null;
  sessionActivityApiUrl: string | null;
};

const isZkEvmUser = (user: User): user is UserZkEvm => !!user.zkEvm;

export class ZkEvmProvider implements Provider {
  readonly #getUser: GetUserFunction;

  readonly #config: WalletConfiguration;

  readonly #sessionActivityApiUrl: string | null;

  /**
   * intended to emit EIP-1193 events
   */
  readonly #providerEventEmitter: TypedEventEmitter<ProviderEventMap>;

  /**
   * intended to emit internal wallet events
   */
  readonly #walletEventEmitter: TypedEventEmitter<WalletEventMap>;

  readonly #guardianClient: GuardianClient;

  readonly #rpcProvider: PublicClient; // Used for read

  readonly #multiRollupApiClients: MultiRollupApiClients;

  readonly #relayerClient: RelayerClient;

  readonly #ethSigner: WalletSigner;

  readonly #clientId: string;

  public readonly isPassport: boolean = true;

  constructor({
    getUser,
    clientId,
    config,
    multiRollupApiClients,
    walletEventEmitter,
    guardianClient,
    ethSigner,
    user,
    sessionActivityApiUrl,
  }: ZkEvmProviderInput) {
    this.#getUser = getUser;
    this.#clientId = clientId;
    this.#config = config;
    this.#guardianClient = guardianClient;
    this.#walletEventEmitter = walletEventEmitter;
    this.#sessionActivityApiUrl = sessionActivityApiUrl;
    this.#ethSigner = ethSigner;

    // Create PublicClient for reading from the chain using viem
    this.#rpcProvider = createPublicClient({
      transport: http(this.#config.zkEvmRpcUrl),
    });

    // Create RelayerClient for transaction submission
    this.#relayerClient = new RelayerClient({
      config: this.#config,
      rpcProvider: this.#rpcProvider,
      getUser: this.#getUser,
    });

    this.#multiRollupApiClients = multiRollupApiClients;
    this.#providerEventEmitter = new TypedEventEmitter<ProviderEventMap>();

    if (user && isZkEvmUser(user)) {
      this.#callSessionActivity(user.zkEvm.ethAddress);
    }

    // Listen for logout events
    walletEventEmitter.on(WalletEvents.LOGGED_OUT, this.#handleLogout);
    walletEventEmitter.on(
      WalletEvents.ACCOUNTS_REQUESTED,
      trackSessionActivity,
    );
  }

  #handleLogout = () => {
    this.#providerEventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, []);
  };

  /**
   * Get the current user using getUser function.
   */
  async #getCurrentUser(): Promise<User | null> {
    return this.#getUser();
  }

  async #callSessionActivity(zkEvmAddress: string) {
    // Only emit session activity event for supported chains (mainnet, testnet, devnet)
    if (!this.#sessionActivityApiUrl) {
      return;
    }

    // SessionActivity requests are processed in nonce space 1, where as all
    // other sendTransaction requests are processed in nonce space 0. This means
    // we can submit a session activity request per SCW in parallel without a SCW
    // INVALID_NONCE error.
    const nonceSpace: bigint = BigInt(1);
    const sendTransactionClosure = async (params: Array<any>, flow: Flow) => await sendTransaction({
      params,
      ethSigner: this.#ethSigner,
      guardianClient: this.#guardianClient,
      rpcProvider: this.#rpcProvider,
      relayerClient: this.#relayerClient,
      zkEvmAddress,
      flow,
      nonceSpace,
      isBackgroundTransaction: true,
    });

    this.#walletEventEmitter.emit(WalletEvents.ACCOUNTS_REQUESTED, {
      sessionActivityApiUrl: this.#sessionActivityApiUrl,
      sendTransaction: sendTransactionClosure,
      walletAddress: zkEvmAddress,
      passportClient: this.#clientId,
    });
  }

  // Used to get the registered zkEvm address from the User session
  async #getZkEvmAddress() {
    try {
      const user = await this.#getCurrentUser();
      if (user && isZkEvmUser(user)) {
        return user.zkEvm.ethAddress;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  async #performRequest(request: RequestArguments): Promise<any> {
    // This is required for sending session activity events

    switch (request.method) {
      case 'eth_requestAccounts': {
        const zkEvmAddress = await this.#getZkEvmAddress();
        if (zkEvmAddress) return [zkEvmAddress];

        const flow = trackFlow('passport', 'ethRequestAccounts');

        try {
          // Get user via getUser function
          const user = await this.#getUser();
          if (!user) {
            throw new JsonRpcError(
              ProviderErrorCode.UNAUTHORIZED,
              'User not authenticated. Please log in first.',
            );
          }
          flow.addEvent('endGetUser');

          let userZkEvmEthAddress: string | undefined;

          if (!isZkEvmUser(user)) {
            flow.addEvent('startUserRegistration');

            userZkEvmEthAddress = await registerZkEvmUser({
              ethSigner: this.#ethSigner,
              getUser: this.#getUser,
              multiRollupApiClients: this.#multiRollupApiClients,
              accessToken: user.accessToken,
              rpcProvider: this.#rpcProvider,
              flow,
            });
            flow.addEvent('endUserRegistration');

            // Force refresh to update session with zkEvm claims from IDP
            // This ensures subsequent getUser() calls return the updated user
            await this.#getUser(true);
            flow.addEvent('endForceRefresh');
          } else {
            userZkEvmEthAddress = user.zkEvm.ethAddress;
          }

          this.#providerEventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, [
            userZkEvmEthAddress,
          ]);
          identify({
            passportId: user.profile.sub,
          });
          this.#callSessionActivity(userZkEvmEthAddress);
          return [userZkEvmEthAddress];
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
      case 'eth_sendTransaction': {
        const zkEvmAddress = await this.#getZkEvmAddress();
        if (!zkEvmAddress) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - call eth_requestAccounts first',
          );
        }

        const flow = trackFlow('passport', 'ethSendTransaction');

        try {
          return await this.#guardianClient.withConfirmationScreen({
            width: 480,
            height: 720,
          })(async () => await sendTransaction({
            params: request.params || [],
            ethSigner: this.#ethSigner,
            guardianClient: this.#guardianClient,
            rpcProvider: this.#rpcProvider,
            relayerClient: this.#relayerClient,
            zkEvmAddress,
            flow,
          }));
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', 'eth_sendTransaction', error, { flowId: flow.details.flowId });
          } else {
            flow.addEvent('errored');
          }
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }
      case 'eth_accounts': {
        const zkEvmAddress = await this.#getZkEvmAddress();
        return zkEvmAddress ? [zkEvmAddress] : [];
      }
      case 'personal_sign': {
        const zkEvmAddress = await this.#getZkEvmAddress();
        if (!zkEvmAddress) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - call eth_requestAccounts first',
          );
        }

        const flow = trackFlow('passport', 'personalSign');

        try {
          return await this.#guardianClient.withConfirmationScreen({
            width: 480,
            height: 720,
          })(async () => {
            if (this.#config.forceScwDeployBeforeMessageSignature) {
              // Check if the smart contract wallet has been deployed
              const nonce = await getNonce(this.#rpcProvider, zkEvmAddress);
              if (!(nonce > BigInt(0))) {
                // If the smart contract wallet has not been deployed,
                // submit a transaction before signing the message
                return await sendDeployTransactionAndPersonalSign({
                  params: request.params || [],
                  zkEvmAddress,
                  ethSigner: this.#ethSigner,
                  rpcProvider: this.#rpcProvider,
                  guardianClient: this.#guardianClient,
                  relayerClient: this.#relayerClient,
                  flow,
                });
              }
            }

            return await personalSign({
              params: request.params || [],
              zkEvmAddress,
              ethSigner: this.#ethSigner,
              rpcProvider: this.#rpcProvider,
              guardianClient: this.#guardianClient,
              relayerClient: this.#relayerClient,
              flow,
            });
          });
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', 'personal_sign', error, { flowId: flow.details.flowId });
          } else {
            flow.addEvent('errored');
          }
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4': {
        const zkEvmAddress = await this.#getZkEvmAddress();
        if (!zkEvmAddress) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - call eth_requestAccounts first',
          );
        }

        const flow = trackFlow('passport', 'ethSignTypedDataV4');

        try {
          return await this.#guardianClient.withConfirmationScreen({
            width: 480,
            height: 720,
          })(async () => await signTypedDataV4({
            method: request.method,
            params: request.params || [],
            ethSigner: this.#ethSigner,
            rpcProvider: this.#rpcProvider,
            relayerClient: this.#relayerClient,
            guardianClient: this.#guardianClient,
            flow,
          }));
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', 'eth_signTypedData', error, { flowId: flow.details.flowId });
          } else {
            flow.addEvent('errored');
          }
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }
      case 'eth_chainId': {
        // Get chain ID using viem's PublicClient
        const chainId = await this.#rpcProvider.getChainId();
        return toHex(chainId);
      }
      // Pass through methods - use viem's request method for raw RPC calls
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
      case 'im_signEjectionTransaction': {
        const zkEvmAddress = await this.#getZkEvmAddress();
        if (!zkEvmAddress) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - call eth_requestAccounts first',
          );
        }

        const flow = trackFlow('passport', 'imSignEjectionTransaction');

        try {
          return await signEjectionTransaction({
            params: request.params || [],
            ethSigner: this.#ethSigner,
            zkEvmAddress,
            flow,
          });
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', 'imSignEjectionTransaction', error, { flowId: flow.details.flowId });
          } else {
            flow.addEvent('errored');
          }
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }
      case 'im_addSessionActivity': {
        const zkEvmAddress = await this.#getZkEvmAddress();
        if (zkEvmAddress) {
          this.#callSessionActivity(zkEvmAddress);
        }
        return null;
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
