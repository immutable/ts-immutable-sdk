import { MultiRollupApiClients } from '@imtbl/generated-clients';
import {
  Flow, identify, trackError, trackFlow,
} from '@imtbl/metrics';
import {
  JsonRpcProvider, Signer, toBeHex,
} from 'ethers';
import {
  Provider,
  ProviderEvent,
  ProviderEventMap,
  RequestArguments,
} from './types';
import AuthManager from '../authManager';
import TypedEventEmitter from '../utils/typedEventEmitter';
import { PassportConfiguration } from '../config';
import {
  PassportEventMap, PassportEvents, User, UserZkEvm,
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
  authManager: AuthManager;
  config: PassportConfiguration;
  multiRollupApiClients: MultiRollupApiClients;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
  guardianClient: GuardianClient;
  ethSigner: Signer;
  user: User | null;
};

const isZkEvmUser = (user: User): user is UserZkEvm => 'zkEvm' in user;

export class ZkEvmProvider implements Provider {
  readonly #authManager: AuthManager;

  readonly #config: PassportConfiguration;

  /**
   * intended to emit EIP-1193 events
   */
  readonly #providerEventEmitter: TypedEventEmitter<ProviderEventMap>;

  /**
   * intended to emit internal Passport events
   */
  readonly #passportEventEmitter: TypedEventEmitter<ProviderEventMap>;

  readonly #guardianClient: GuardianClient;

  readonly #rpcProvider: JsonRpcProvider; // Used for read

  readonly #multiRollupApiClients: MultiRollupApiClients;

  readonly #relayerClient: RelayerClient;

  readonly #ethSigner: Signer;

  public readonly isPassport: boolean = true;

  constructor({
    authManager,
    config,
    multiRollupApiClients,
    passportEventEmitter,
    guardianClient,
    ethSigner,
    user,
  }: ZkEvmProviderInput) {
    this.#authManager = authManager;
    this.#config = config;
    this.#guardianClient = guardianClient;
    this.#passportEventEmitter = passportEventEmitter;
    this.#ethSigner = ethSigner;

    this.#rpcProvider = new JsonRpcProvider(this.#config.zkEvmRpcUrl, undefined, {
      staticNetwork: true,
    });

    this.#relayerClient = new RelayerClient({
      config: this.#config,
      rpcProvider: this.#rpcProvider,
      authManager: this.#authManager,
    });

    this.#multiRollupApiClients = multiRollupApiClients;
    this.#providerEventEmitter = new TypedEventEmitter<ProviderEventMap>();

    if (user && isZkEvmUser(user)) {
      this.#callSessionActivity(user.zkEvm.ethAddress);
    }

    passportEventEmitter.on(PassportEvents.LOGGED_IN, (loggedInUser: User) => {
      if (isZkEvmUser(loggedInUser)) {
        this.#callSessionActivity(loggedInUser.zkEvm.ethAddress);
      }
    });
    passportEventEmitter.on(PassportEvents.LOGGED_OUT, this.#handleLogout);
    passportEventEmitter.on(
      PassportEvents.ACCOUNTS_REQUESTED,
      trackSessionActivity,
    );
  }

  #handleLogout = () => {
    this.#providerEventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, []);
  };

  async #callSessionActivity(zkEvmAddress: string, clientId?: string) {
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
    this.#passportEventEmitter.emit(PassportEvents.ACCOUNTS_REQUESTED, {
      environment: this.#config.baseConfig.environment,
      sendTransaction: sendTransactionClosure,
      walletAddress: zkEvmAddress,
      passportClient: clientId || this.#config.oidcConfiguration.clientId,
    });
  }

  // Used to get the registered zkEvm address from the User session
  async #getZkEvmAddress() {
    try {
      const user = await this.#authManager.getUser();
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
          const user = await this.#authManager.getUserOrLogin();
          flow.addEvent('endGetUserOrLogin');

          let userZkEvmEthAddress: string | undefined;

          if (!isZkEvmUser(user)) {
            flow.addEvent('startUserRegistration');

            userZkEvmEthAddress = await registerZkEvmUser({
              ethSigner: this.#ethSigner,
              authManager: this.#authManager,
              multiRollupApiClients: this.#multiRollupApiClients,
              accessToken: user.accessToken,
              rpcProvider: this.#rpcProvider,
              flow,
            });
            flow.addEvent('endUserRegistration');
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
        // Call detect network to fetch the chainId so to take advantage of
        // the caching layer provided by StaticJsonRpcProvider.
        // In case Passport is changed from StaticJsonRpcProvider to a
        // JsonRpcProvider, this function will still work as expected given
        // that detectNetwork call _uncachedDetectNetwork which will force
        // the provider to re-fetch the chainId from remote.
        const { chainId } = await this.#rpcProvider.getNetwork();
        return toBeHex(chainId);
      }
      // Pass through methods
      case 'eth_getBalance':
      case 'eth_getCode':
      case 'eth_getTransactionCount': {
        const [address, blockNumber] = request.params || [];
        return this.#rpcProvider.send(request.method, [
          address,
          blockNumber || 'latest',
        ]);
      }
      case 'eth_getStorageAt': {
        const [address, storageSlot, blockNumber] = request.params || [];
        return this.#rpcProvider.send(request.method, [
          address,
          storageSlot,
          blockNumber || 'latest',
        ]);
      }
      case 'eth_call':
      case 'eth_estimateGas': {
        const [transaction, blockNumber] = request.params || [];
        return this.#rpcProvider.send(request.method, [
          transaction,
          blockNumber || 'latest',
        ]);
      }
      case 'eth_gasPrice':
      case 'eth_blockNumber':
      case 'eth_getBlockByHash':
      case 'eth_getBlockByNumber':
      case 'eth_getTransactionByHash':
      case 'eth_getTransactionReceipt': {
        return this.#rpcProvider.send(request.method, request.params || []);
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
        const [clientId] = request.params || [];
        const zkEvmAddress = await this.#getZkEvmAddress();
        if (zkEvmAddress) {
          this.#callSessionActivity(zkEvmAddress, clientId);
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
