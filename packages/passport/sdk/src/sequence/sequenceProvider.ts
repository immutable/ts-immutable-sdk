import { JsonRpcProvider } from 'ethers';
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
} from '../types';
import { SequenceRelayerClient } from './sequenceRelayerClient';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from '../zkEvm/JsonRpcError';
import { identify, trackError, trackFlow } from '@imtbl/metrics';
import { sendTransaction } from './sendTransaction';
import { registerUser } from './user';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { SequenceSigner } from './index';
import { getChainConfig } from './chainConfig';
import { Provider as OxProvider, RpcTransport } from 'ox';

export type SequenceProviderInput = {
  authManager: AuthManager;
  config: PassportConfiguration;
  multiRollupApiClients: MultiRollupApiClients;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
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

  readonly #rpcProvider: OxProvider.Provider;

  readonly #multiRollupApiClients: MultiRollupApiClients;

  readonly #relayerClient: SequenceRelayerClient;

  readonly #ethSigner: SequenceSigner;

  readonly #chain: Exclude<EvmChain, EvmChain.ZKEVM>;

  public readonly isPassport: boolean = true;

  // TODO: for demo purposes only as we're using local database
  userWalletAddress: string | undefined = undefined;

  constructor({
    authManager,
    config,
    multiRollupApiClients,
    passportEventEmitter,
    ethSigner,
    user,
    chain,
  }: SequenceProviderInput) {
    this.#authManager = authManager;
    this.#config = config;
    this.#passportEventEmitter = passportEventEmitter;
    this.#ethSigner = ethSigner;
    this.#chain = chain;

    const chainConfig = getChainConfig(chain);
    // this.#rpcProvider = new JsonRpcProvider(chainConfig.rpcUrl, undefined, {
    //   staticNetwork: true,
    // });
    this.#rpcProvider = OxProvider.from(RpcTransport.fromHttp(chainConfig.nodeUrl));

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
        const walletAddress = await this.#getWalletAddress();
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
        const walletAddress = this.userWalletAddress;
        // const walletAddress = await this.#getWalletAddress();

        if (!walletAddress) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            `Unauthorised - call eth_requestAccounts first`,
          );
        }

        const flow = trackFlow('passport', `ethSendTransaction_${this.#chain}`);

        try {
          return await sendTransaction({
            params: request.params || [],
            sequenceSigner: this.#ethSigner,
            rpcProvider: this.#rpcProvider,
            relayerClient: this.#relayerClient,
            walletAddress,
            flow,
            authManager: this.#authManager,
            chain: this.#chain,
            multiRollupApiClients: this.#multiRollupApiClients,
          });
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

      case 'eth_getBalance':
        const [address, blockNumber] = request.params || [];
        return this.#rpcProvider.request({
          method: request.method,
          params: [address, blockNumber || 'latest'],
        });

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

