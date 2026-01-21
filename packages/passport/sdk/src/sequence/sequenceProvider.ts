import { Provider as OxProvider, RpcTransport } from 'ox';
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
  PassportEventMap,
  PassportEvents,
  User,
  EvmChain,
  IdTokenPayload,
} from '../types';
import { SequenceRelayerClient } from './sequenceRelayerClient';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from '../zkEvm/JsonRpcError';
import { identify, trackError, trackFlow } from '@imtbl/metrics';
import { sendTransaction } from './sendTransaction';
import { registerUser } from './user';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { SequenceSigner } from './index';
import { getChainConfig } from './chainConfig';
import GuardianClient from '../guardian';
import { JsonRpcProvider, toBeHex } from 'ethers';
import { PassportError, PassportErrorType } from '../errors/passportError';
import jwt_decode from 'jwt-decode';
import { signTypedDataV4 } from './signTypedDataV4';
import { personalSign } from './personalSign';
import { sendDeployTransactionAndPersonalSign } from './sendDeployTransactionAndPersonalSign';
import { isWalletDeployed } from './walletHelpers';

export type SequenceProviderInput = {
  authManager: AuthManager;
  config: PassportConfiguration;
  multiRollupApiClients: MultiRollupApiClients;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
  guardianClient: GuardianClient;
  ethSigner: SequenceSigner;
  user: User | null;
  chain: Exclude<EvmChain, EvmChain.ZKEVM>;
};

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
type UserWithChain<C extends Exclude<EvmChain, EvmChain.ZKEVM>> = WithRequired<User, C>;

const isUserRegisteredForChain = <C extends Exclude<EvmChain, EvmChain.ZKEVM>>(
  user: User,
  chain: C
): user is UserWithChain<C> => {
  return chain in user;
};

export class SequenceProvider implements Provider {
  readonly #authManager: AuthManager;

  readonly #config: PassportConfiguration;

  readonly #providerEventEmitter: TypedEventEmitter<ProviderEventMap>;

  readonly #passportEventEmitter: TypedEventEmitter<PassportEventMap>;

  readonly #guardianClient: GuardianClient;

  readonly #rpcProvider: JsonRpcProvider;

  readonly #oxRpcProvider: OxProvider.Provider;

  readonly #multiRollupApiClients: MultiRollupApiClients;

  readonly #relayerClient: SequenceRelayerClient;

  readonly #ethSigner: SequenceSigner;

  readonly #chain: Exclude<EvmChain, EvmChain.ZKEVM>;

  public readonly isPassport: boolean = true;

  // TODO: for demo purposes only as we're using local database
  userWalletAddress: string | undefined = undefined;

  walletPopup: Window | null = null;
  // walletAddress: string | null = null;
  walletOrigin = 'http://localhost:5173';

  constructor({
    authManager,
    config,
    multiRollupApiClients,
    passportEventEmitter,
    guardianClient,
    ethSigner,
    user,
    chain,
  }: SequenceProviderInput) {
    this.#authManager = authManager;
    this.#config = config;
    this.#guardianClient = guardianClient;
    this.#passportEventEmitter = passportEventEmitter;
    this.#ethSigner = ethSigner;
    this.#chain = chain;

    const chainConfig = getChainConfig(chain, config.baseConfig.environment);
    this.#rpcProvider = new JsonRpcProvider(chainConfig.rpcUrl, undefined, {
      staticNetwork: true,
    });
    this.#oxRpcProvider = OxProvider.from(RpcTransport.fromHttp(chainConfig.nodeUrl));

    this.#relayerClient = new SequenceRelayerClient({ config: this.#config });

    this.#multiRollupApiClients = multiRollupApiClients;
    this.#providerEventEmitter = new TypedEventEmitter<ProviderEventMap>();

    passportEventEmitter.on(PassportEvents.LOGGED_OUT, this.#handleLogout);
  }

  #handleLogout = () => {
    this.#providerEventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, []);
  };

  async #getWalletAddress() {
    try {
      const user = await this.#authManager.getUser();
      if (user && isUserRegisteredForChain(user, this.#chain)) {
        return user[this.#chain].ethAddress;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  async #performRequest(request: RequestArguments): Promise<any> {
    switch (request.method) {
      case 'eth_requestAccounts': {
        console.log(`sequence eth_requestAccounts`);
        const signerAddress = await this.#ethSigner.getAddress();
        console.log(`sequence signerAddress = ${signerAddress}`);

        const walletAddress = await this.#getWalletAddress();
        console.log(`eth_requestAccounts 1 walletAddress = ${walletAddress}`);
        this.userWalletAddress = walletAddress;
        if (walletAddress) return [walletAddress];

        const flow = trackFlow('passport', `ethRequestAccounts_${this.#chain}`);

        try {
          const user = await this.#authManager.getUserOrLogin();
          flow.addEvent('endGetUserOrLogin');

          let userEthAddress: string | undefined;

          if (!isUserRegisteredForChain(user, this.#chain)) {
            flow.addEvent('startUserRegistration');

            const address = await this.#ethSigner.getAddress();
            userEthAddress = address;

            userEthAddress = await registerUser({
              ethSigner: this.#ethSigner,
              authManager: this.#authManager,
              multiRollupApiClients: this.#multiRollupApiClients,
              accessToken: user.accessToken,
              rpcProvider: this.#rpcProvider,
              flow,
            });

            this.userWalletAddress = userEthAddress;
            
            flow.addEvent('endUserRegistration');
          } else {
            userEthAddress = user[this.#chain].ethAddress;

            this.userWalletAddress = userEthAddress;
          }

          if (userEthAddress) {
            this.#providerEventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, [
              userEthAddress,
            ]);
          }

          identify({
            passportId: user.profile.sub,
          });
          
          return [userEthAddress];
        } catch (error) {
          console.log(`sequence eth_requestAccounts error: ${error}`, (error as Error)?.stack);
          if (error instanceof Error) {
            trackError('passport', `ethRequestAccounts_${this.#chain}`, error, { flowId: flow.details.flowId });
          } else {
            flow.addEvent('errored');
          }
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }

      case 'eth_sendTransaction': {
        console.log(`sequence eth_sendTransaction ${this.userWalletAddress}`);
        const walletAddress = '0xc07a2904e04d9184cd3839dea00e32179bad47d7';//'0x3fadd1f6f02408c0fad35e362e3d5c65e722b67a';//this.userWalletAddress;
        // const walletAddress = this.userWalletAddress;
        // const walletAddress = await this.#getWalletAddress();

        if (!walletAddress) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            `Unauthorised - call eth_requestAccounts first`,
          );
        }

        const flow = trackFlow('passport', `ethSendTransaction_${this.#chain}`);

        try {
          return await this.#guardianClient.withConfirmationScreen({
            width: 480,
            height: 720,
          })(async () => await sendTransaction({
            params: request.params || [],
            sequenceSigner: this.#ethSigner,
            oxRpcProvider: this.#oxRpcProvider,
            relayerClient: this.#relayerClient,
            guardianClient: this.#guardianClient,
            walletAddress,
            flow,
            authManager: this.#authManager,
            chain: this.#chain,
            environment: this.#config.baseConfig.environment,
          }));
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', `ethSendTransaction_${this.#chain}`, error, { flowId: flow.details.flowId });
          } else {
            flow.addEvent('errored');
          }
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }

      case 'personal_sign': {
        const walletAddress = '0xc07a2904e04d9184cd3839dea00e32179bad47d7';//'0x3fadd1f6f02408c0fad35e362e3d5c65e722b67a';//this.userWalletAddress;
        // const walletAddress = this.userWalletAddress;
        if (!walletAddress) {
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
              const deployed = await isWalletDeployed(this.#oxRpcProvider, walletAddress);
              console.log(`personal_sign deployed ${deployed}`);
              if (!deployed) {
                // If the smart contract wallet has not been deployed,
                // submit a transaction before signing the message
                return await sendDeployTransactionAndPersonalSign({
                  params: request.params || [],
                  walletAddress,
                  sequenceSigner: this.#ethSigner,
                  oxRpcProvider: this.#oxRpcProvider,
                  guardianClient: this.#guardianClient,
                  relayerClient: this.#relayerClient,
                  flow,
                  authManager: this.#authManager,
                  chain: this.#chain,
                  environment: this.#config.baseConfig.environment,
                });
              }
            }

            return await personalSign({
              params: request.params || [],
              walletAddress,
              sequenceSigner: this.#ethSigner,
              oxRpcProvider: this.#oxRpcProvider,
              guardianClient: this.#guardianClient,
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
        const walletAddress = '0xc07a2904e04d9184cd3839dea00e32179bad47d7';//'0x3fadd1f6f02408c0fad35e362e3d5c65e722b67a';//this.userWalletAddress;
        // const walletAddress = this.userWalletAddress;
        // const walletAddress = await this.#getWalletAddress();
        if (!walletAddress) {
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
            sequenceSigner: this.#ethSigner,
            oxRpcProvider: this.#oxRpcProvider,
            guardianClient: this.#guardianClient,
            walletAddress: this.userWalletAddress!,
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
      return await this.#performRequest(request);
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

