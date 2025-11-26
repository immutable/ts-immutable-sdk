import { JsonRpcProvider, toBeHex, Signer } from 'ethers';
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
  PassportEventMap, PassportEvents, User, UserArbOne,
} from '../types';
import { ArbOneRelayerClient } from './relayerClient';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from './JsonRpcError';
import { Flow, identify, trackError, trackFlow } from '@imtbl/metrics';
import { sendTransaction } from './sendTransaction';
import { getNonce } from './walletHelpers';
import { registerArbOneUser } from './user';
import { MultiRollupApiClients } from '@imtbl/generated-clients';

export type ArbOneProviderInput = {
  authManager: AuthManager;
  config: PassportConfiguration;
  multiRollupApiClients: MultiRollupApiClients;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
  ethSigner: Signer;
  user: User | null;
};

const isArbOneUser = (user: User): user is UserArbOne => 'arbOne' in user;

export class ArbOneProvider implements Provider {
  readonly #authManager: AuthManager;

  readonly #config: PassportConfiguration;

  /**
   * EIP-1193 provider event emitter
   * Emits standard provider events (accountsChanged, chainChanged, etc)
   */
  readonly #providerEventEmitter: TypedEventEmitter<ProviderEventMap>;

  /**
   * Internal Passport event emitter
   * Listens to Passport events (login, logout) and updates provider state
   */
  readonly #passportEventEmitter: TypedEventEmitter<PassportEventMap>;

  // JSON-RPC provider for direct Arbitrum One RPC calls
  readonly #rpcProvider: JsonRpcProvider;

  readonly #multiRollupApiClients: MultiRollupApiClients;

  // Relayer client for submitting transactions via backend relayer
  readonly #relayerClient: ArbOneRelayerClient;

  // Sequence signer for signing transactions and messages (analogous to ethSigner in zkEVM)
  readonly #ethSigner: Signer;

  // Identifies this as a Passport provider (for wallet detection)
  public readonly isPassport: boolean = true;

  constructor({
    authManager,
    config,
    multiRollupApiClients,
    passportEventEmitter,
    ethSigner,
    user,
  }: ArbOneProviderInput) {
    this.#authManager = authManager;
    this.#config = config;
    this.#passportEventEmitter = passportEventEmitter;
    this.#ethSigner = ethSigner;

    this.#rpcProvider = new JsonRpcProvider(this.#config.arbOneRpcUrl, undefined, {
      staticNetwork: true,
    });

    this.#relayerClient = new ArbOneRelayerClient({
      config: this.#config,
      rpcProvider: this.#rpcProvider,
      authManager: this.#authManager,
    });

    this.#multiRollupApiClients = multiRollupApiClients;
    this.#providerEventEmitter = new TypedEventEmitter<ProviderEventMap>();

    passportEventEmitter.on(PassportEvents.LOGGED_IN, (loggedInUser: User) => {
      if (isArbOneUser(loggedInUser)) {
        this.#providerEventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, [
          loggedInUser.arbOne.ethAddress,
        ]);
      }
    });

    passportEventEmitter.on(PassportEvents.LOGGED_OUT, this.#handleLogout);
  }

  #handleLogout = () => {
    this.#providerEventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, []);
  };

  // Get the current ArbOne address from the User session
  async #getArbOneAddress() {
    // return "0x83e14c79776f468a23d99ef112d9de7fbec24b00";
    // TODO remove
    try {
      const user = await this.#authManager.getUser();
      if (user && isArbOneUser(user)) {
        return user.arbOne.ethAddress;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  async #performRequest(request: RequestArguments): Promise<any> {
    switch (request.method) {
      case 'eth_requestAccounts': {
        const arbOneAddress = await this.#getArbOneAddress();
        if (arbOneAddress) return [arbOneAddress];

        const flow = trackFlow('passport', 'ethRequestAccounts_arbOne');

        try {
          const user = await this.#authManager.getUserOrLogin();
          flow.addEvent('endGetUserOrLogin');

          let userArbOneEthAddress: string | undefined;

          if (!isArbOneUser(user)) {
            console.log('startUserRegistration');
            flow.addEvent('startUserRegistration');

            // Get address from Sequence signer
            const address = await this.#ethSigner.getAddress();
            userArbOneEthAddress = address;
            
            // This should register the Sequence wallet address with the user's Passport account
            // await registerArbOneUser({...})
            userArbOneEthAddress = await registerArbOneUser({
              ethSigner: this.#ethSigner,
              authManager: this.#authManager,
              multiRollupApiClients: this.#multiRollupApiClients,
              accessToken: user.accessToken,
              rpcProvider: this.#rpcProvider,
              flow,
            });
            
            flow.addEvent('endUserRegistration');
          } else {
            userArbOneEthAddress = user.arbOne.ethAddress;
          }

          if (userArbOneEthAddress) {
            this.#providerEventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, [
              userArbOneEthAddress,
            ]);
          }

          identify({
            passportId: user.profile.sub,
          });
          
          return [userArbOneEthAddress];
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', 'ethRequestAccounts_arbOne', error, { flowId: flow.details.flowId });
          } else {
            flow.addEvent('errored');
          }
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }

      case 'eth_sendTransaction': {
        // Get user's Arbitrum One wallet address
        // eoa: 0xD56294DdC6439D1A404F4C193a40aE3821165d69
        const arbOneAddress = '0x33e406618478b434faa66d24a50c75884d0be601';//await this.#getArbOneAddress();
        if (!arbOneAddress) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            `Unauthorised - call eth_requestAccounts first`,
          );
        }


        const flow = trackFlow('passport', 'ethSendTransaction_arbOne');

        try {
          const signerAddress = await this.#ethSigner.getAddress();
          const tx = {
            to: '0xD56294DdC6439D1A404F4C193a40aE3821165d69', // Your EOA
            value: 0n,
            data: "0x"
          }

          return await sendTransaction({
            params: [tx], // request.params || []
            sequenceSigner: this.#ethSigner,
            rpcProvider: this.#rpcProvider,
            relayerClient: this.#relayerClient,
            arbOneAddress,
            flow,
          });
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', 'ethSendTransaction_arbOne', error, { flowId: flow.details.flowId });
          } else {
            flow.addEvent('errored');
          }
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }

      case 'eth_accounts': {
        const arbOneAddress = await this.#getArbOneAddress();
        return arbOneAddress ? [arbOneAddress] : [];
      }

      case 'personal_sign': {
        // Get user's Arbitrum One wallet address
        const arbOneAddress = await this.#getArbOneAddress();
        if (!arbOneAddress) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - call eth_requestAccounts first',
          );
        }

        const flow = trackFlow('passport', 'personalSign_arbOne');

        try {
          const [message] = request.params || [];

          if (!message) {
            throw new JsonRpcError(
              RpcErrorCode.INVALID_PARAMS,
              'Message is required for personal_sign',
            );
          }

          // Sign message with Sequence wallet
          // 
          // Flow:
          // 1. User signs message with Sequence wallet
          // 2. Signature is returned directly (no relayer needed for simple signatures)
          // 
          // Note: For EIP-1271 smart contract signatures (used in transactions),
          // the relayer handles the 2x2 multisig. But for personal_sign,
          // the relayer's imSign endpoint manages the signature creation.
          const signature = await this.#relayerClient.imSign(arbOneAddress, message);
          return signature;
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', 'personalSign_arbOne', error, { flowId: flow.details.flowId });
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
        // Get user's Arbitrum One wallet address
        const arbOneAddress = await this.#getArbOneAddress();
        if (!arbOneAddress) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - call eth_requestAccounts first',
          );
        }

        const flow = trackFlow('passport', 'ethSignTypedDataV4_arbOne');

        try {
          const [address, typedDataString] = request.params || [];

          if (!typedDataString) {
            throw new JsonRpcError(
              RpcErrorCode.INVALID_PARAMS,
              'Typed data is required',
            );
          }

          // Sign EIP-712 typed data with Sequence wallet
          // 
          // Flow:
          // 1. Parse typed data (EIP-712 format)
          // 2. User signs with Sequence wallet
          // 3. Signature is returned via relayer endpoint
          // 
          // Used for structured data signing (e.g., permit, meta-transactions)
          // The relayer handles the signature creation for the smart contract wallet.

          const typedData = typeof typedDataString === 'string'
            ? JSON.parse(typedDataString)
            : typedDataString;

          // Use relayer's typed data signing endpoint
          const signature = await this.#relayerClient.imSignTypedData(arbOneAddress, typedData);
          return signature;
        } catch (error) {
          if (error instanceof Error) {
            trackError('passport', 'ethSignTypedDataV4_arbOne', error, { flowId: flow.details.flowId });
          } else {
            flow.addEvent('errored');
          }
          throw error;
        } finally {
          flow.addEvent('End');
        }
      }

      case 'eth_chainId': {
        const { chainId } = await this.#rpcProvider.getNetwork();
        return toBeHex(chainId);
      }

      // Pass through methods to RPC provider
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
