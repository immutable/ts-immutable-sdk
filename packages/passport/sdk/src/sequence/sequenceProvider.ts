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
import { JsonRpcProvider } from 'ethers';
import { PassportError, PassportErrorType } from '../errors/passportError';
import jwt_decode from 'jwt-decode';

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
        const walletAddress = '0xc07a2904e04d9184cd3839dea00e32179bad47d7';//'0x3fadd1f6f02408c0fad35e362e3d5c65e722b67a'//'0x3fadd1f6f02408c0fad35e362e3d5c65e722b67a';//this.userWalletAddress;
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
          // return await sendTransaction({
          //   params: request.params || [],
          //   sequenceSigner: this.#ethSigner,
          //   oxRpcProvider: this.#oxRpcProvider,
          //   relayerClient: this.#relayerClient,
          //   guardianClient: this.#guardianClient,
          //   walletAddress,
          //   flow,
          //   authManager: this.#authManager,
          //   chain: this.#chain,
          // }); 

          /*const params = request.params || [];
          const transactionRequest = params[0];
          const { to, value, data } = transactionRequest;
          console.log(`to = ${to}`)
          console.log(`value = ${value}`)
          console.log(`data = ${data}`)

          await this.#authManager.forceUserRefresh(); // TODO shouldn't have to refresh all the time

          const authenticatedUser = await this.#authManager.getUser();
        
          if (!authenticatedUser?.idToken) {
            throw new PassportError(
              'User idToken not available',
              PassportErrorType.NOT_LOGGED_IN_ERROR,
            );
          }

          const idToken = authenticatedUser.idToken;
          const decoded = jwt_decode<IdTokenPayload>(idToken);
          const issuer = decoded.iss;
          const audience = decoded.aud;

          try {
            const wallet = await this.authenticateAndSendTransaction(idToken, issuer, audience,
              {
                to: to,
                value: `${value}`,
                data: `${data}`,
                chainId: 421614,
              }
            )
            console.log(`wallet from pop up = ${wallet}`)
            console.log('Authenticated! Wallet:', wallet)
          } catch (err) {
            console.error('Auth failed:', err)
            return
          }*/

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

  async authenticateAndSendTransaction(idToken: string, issuer: string, audience: string, tx: any) {
    return new Promise((resolve, reject) => {
      const sessionId = crypto.randomUUID()
      const requestId = crypto.randomUUID()
      const stateConfigRequestId = crypto.randomUUID()
      let authCompleted = false  // Track auth state
      let stateConfigSet = false
      
      const popup = window.open(
        `${this.walletOrigin}/auth/idtoken?origin=${window.location.origin}`,
        'wallet',
        'popup,width=400,height=600'
      )
  
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== this.walletOrigin) return
        console.log('[SDK] Received:', event.data)
  
        // Step 1: Auth ready
        if (event.data.type === 'IDTOKEN_AUTH_READY') {
          popup?.postMessage({
            type: 'IDTOKEN_AUTH',
            idToken,
            issuer,
            audience,
            redirect: 'none',
            customStateConfig: {
              walletAddress: '0xce86c5be4c5ff2c2530c626f7aa81604b7618717',
              deploymentSalt: '0xc97a40f09209c878837cf2742fa66685fabc3a9d436e8759142e2a0f8259aec9',      // <-- Your deployment salt
              realImageHash: '0x70be4a1f980f96997dff0583567db5e51e8ab68e5473405316ce1def5ee83b36',   
            }
          }, this.walletOrigin)
        }
  
        // Step 2: Auth complete - now navigate popup to wallet root for tx
        if (event.data.type === 'IDTOKEN_AUTH_RESULT' && event.data.success) {
          this.userWalletAddress = event.data.wallet
          authCompleted = true  // Mark auth as done
          console.log('[SDK] Auth complete, navigating to transaction route')

          // Navigate the popup to wallet root (which will send WALLET_OPENED)
          // Wait 3 seconds for all signing to complete before navigating
          setTimeout(() => {
            console.log('[SDK] Navigating to transaction route')
            if (popup) {
              popup.location.href = `${this.walletOrigin}/request/transaction?sessionId=${sessionId}`
            }
          }, 3000)
        }
  
        // Step 3: Wallet opened - send tx request
        if (event.data.type === 'WALLET_OPENED' && authCompleted) {
          popup?.postMessage({
            id: crypto.randomUUID(),
            type: 'INIT',
            sessionId,
          }, this.walletOrigin)

          // popup?.postMessage({
          //   id: requestId,
          //   type: 'REQUEST',
          //   sessionId,
          //   action: 'signMessage',  // Changed from 'sendWalletTransaction'
          //   payload: {
          //     address: this.userWalletAddress,
          //     chainId: tx.chainId,  // Optional for signing
          //     message: 'Hellooooo, sign this message',     // Hex-encoded message to sign
          //   }
          // }, this.walletOrigin)

          popup?.postMessage({
            id: requestId,
            type: 'REQUEST',
            sessionId,
            action: 'sendWalletTransaction',
            payload: {
              address: this.userWalletAddress,
              chainId: tx.chainId,
              transactionRequest: {
                to: "0x35beC1b2E8a30aF9bfd138555a633245519b607C",
                value: '0',
                data: "0x1e957f1e",
              }
            }
          }, this.walletOrigin)
        }
  
        // Step 4: Transaction response
        // TODO handle confirmation here <<<<<
        // Step 4: Transaction CONFIRMED (not signed/sent yet)
        // if (event.data.type === 'RESPONSE' && event.data.id === requestId) {
        //   window.removeEventListener('message', handleMessage)
        //   popup?.close()

        //   if (event.data.error) {
        //     reject(new Error(event.data.error.message || event.data.error))
        //     return
        //   }

        //   const payload = event.data.payload

        //   // Check if this is a confirmation-only response
        //   if (payload?.confirmed === true) {
        //     console.log('[SDK] Transaction CONFIRMED by user:', payload)
            
        //     // Now YOU sign and send the transaction on your side
        //     // payload contains: { confirmed, walletAddress, chainId, transaction: { to, value, data } }
        //     resolve({
        //       confirmed: true,
        //       walletAddress: payload.walletAddress,
        //       chainId: payload.chainId,
        //       transaction: payload.transaction,
        //     })
            
        //     // TODO: Your code to sign and send:
        //     // const txHash = await yourWdk.signAndSend(payload.transaction)
        //     console.log(`payload = ${JSON.stringify(payload.transaction)}`)
            
        //   } else if (payload?.transactionHash) {
        //     // Legacy: full sign+relay flow (if you ever re-enable it)
        //     resolve({ txHash: payload.transactionHash })
        //   } else {
        //     reject(new Error('Unknown response format'))
        //   }
        // }
        if (event.data.type === 'RESPONSE' && event.data.id === requestId) {
          window.removeEventListener('message', handleMessage)
          popup?.close()
          if (event.data.error) {
            reject(new Error(event.data.error.message))
          } else {
            resolve({ txHash: event.data.payload?.txHash })
          }
        }
      }
  
      window.addEventListener('message', handleMessage)
    })
  }
}

