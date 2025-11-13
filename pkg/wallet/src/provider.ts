/**
 * EIP-1193 compatible provider for Immutable zkEVM
 */

import type { User, Auth } from '@imtbl/auth';
import {
  toHex, fromHex, createPublicClient, http, isAddress, hexToString,
} from 'viem';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from './errors';
import { getFunctionSelector } from './utils/abi';
import type { Signer } from './signer/signer';
import { MagicTEESigner } from './signer/magic';
import { RelayerClient } from './relayer';
import { GuardianClient } from './guardian';
import { ApiClient } from './api';
import { ConfirmationScreen } from './confirmation/confirmation';
import { packSignatures } from './sequence';
import { signERC191Message, signTypedData } from './signer/signing';
import { buildMetaTransactions, validateAndSignTransaction } from './metatransaction';
import { prepareAndSignEjectionTransaction } from './ejection';
import type { TransactionRequest } from './metatransaction';
import type { TypedDataPayload } from './types';

/**
 * Simple event emitter for provider events
 */
class SimpleEventEmitter {
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  removeListener(event: string, listener: (...args: any[]) => void): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach((listener) => listener(...args));
  }
}

/**
 * Chain configuration
 */
export interface ChainConfig {
  /** Chain ID (e.g., 13371 for mainnet, 13473 for testnet) */
  chainId: number;
  /** RPC URL for the chain */
  rpcUrl: string;
  /** Relayer URL for transaction submission */
  relayerUrl: string;
  /** API URL for Passport APIs (guardian, user registration) */
  apiUrl: string;
  /** Chain name (e.g., 'Immutable zkEVM') */
  name: string;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  /** Chain configurations - at least one required */
  chains: ChainConfig[];
  /** Initial chain ID (defaults to first chain in chains array) */
  initialChainId?: number;
  /** Optional authenticated user */
  authenticatedUser?: User;
  /** Optional auth client for automatic login/getUser */
  auth?: Auth;
  /** Optional popup overlay options */
  popupOverlayOptions?: {
    disableGenericPopupOverlay?: boolean;
    disableBlockedPopupOverlay?: boolean;
  };
  /** Enable cross-SDK bridge mode - skips confirmation popups, throws errors instead */
  crossSdkBridgeEnabled?: boolean;
}

/**
 * EIP-1193 compatible provider interface
 */
export interface Provider {
  /**
   * Send a JSON-RPC request
   * @see https://eips.ethereum.org/EIPS/eip-1193
   */
  request(args: RequestArguments): Promise<any>;

  /**
   * Subscribe to provider events
   */
  on(event: string, listener: (...args: any[]) => void): void;

  /**
   * Unsubscribe from provider events
   */
  removeListener(event: string, listener: (...args: any[]) => void): void;

  /**
   * Indicates this is a Passport provider
   */
  isPassport: boolean;
}

/**
 * JSON-RPC request arguments
 */
export interface RequestArguments {
  method: string;
  params?: unknown[];
}

/**
 * Provider event types
 */
export enum ProviderEvent {
  ACCOUNTS_CHANGED = 'accountsChanged',
}

/**
 * PassportEVMProvider - EIP-1193 compatible provider
 */
export class PassportEVMProvider implements Provider {
  public readonly isPassport: boolean = true;

  private chains: Map<number, ChainConfig>;

  private currentChainId: number;

  private currentRpcUrl: string;

  private eventEmitter: SimpleEventEmitter;

  private authenticatedUser?: User;

  private auth?: Auth;

  private signer?: Signer;

  private walletAddress?: string;

  private passportDomain: string;

  private crossSdkBridgeEnabled: boolean;

  // Clients are always initialized in constructor via initializeClients()
  private relayerClient!: RelayerClient;

  private guardianClient!: GuardianClient;

  private apiClient!: ApiClient;

  private confirmationScreen: ConfirmationScreen;

  // Cached HTTP transport for RPC calls (recreated when chain switches)
  private rpcTransport = http('');

  constructor(config: ProviderConfig) {
    if (!config.chains || config.chains.length === 0) {
      throw new Error('At least one chain configuration is required');
    }

    // Build chain map
    this.chains = new Map();
    for (const chain of config.chains) {
      this.chains.set(chain.chainId, chain);
    }

    // Set initial chain
    this.currentChainId = config.initialChainId || config.chains[0].chainId;
    const chainConfig = this.chains.get(this.currentChainId);
    if (!chainConfig) {
      throw new Error(`Chain ${this.currentChainId} not configured`);
    }

    this.currentRpcUrl = chainConfig.rpcUrl;
    this.authenticatedUser = config.authenticatedUser;
    this.auth = config.auth;
    this.eventEmitter = new SimpleEventEmitter();

    // Initialize RPC transport
    this.rpcTransport = http(this.currentRpcUrl);

    // Determine passport domain from chain config
    this.passportDomain = 'https://passport.immutable.com';
    this.crossSdkBridgeEnabled = config.crossSdkBridgeEnabled || false;

    // Initialize confirmation screen
    this.confirmationScreen = new ConfirmationScreen({
      passportDomain: this.passportDomain,
      popupOverlayOptions: config.popupOverlayOptions,
      crossSdkBridgeEnabled: this.crossSdkBridgeEnabled,
    });

    // Initialize clients eagerly (they can exist without authenticated user)
    // Clients are stateless - user is passed as parameter to methods
    this.initializeClients(config.crossSdkBridgeEnabled || false);

    // If auth client provided, set it up (will try to get existing user)
    if (this.auth) {
      this.setAuth(this.auth);
    }

    // If authenticated user provided, set it up
    if (this.authenticatedUser) {
      this.setAuthenticatedUser(this.authenticatedUser);
    }
  }

  /**
   * Initializes or updates API clients
   * Clients can be created without authenticated user - they'll fail on requests until user is set
   */
  private initializeClients(crossSdkBridgeEnabled: boolean): void {
    const chainConfig = this.chains.get(this.currentChainId)!;

    this.relayerClient = new RelayerClient({
      relayerUrl: chainConfig.relayerUrl,
    });

    this.guardianClient = new GuardianClient({
      guardianUrl: chainConfig.apiUrl,
      confirmationScreen: this.confirmationScreen,
      crossSdkBridgeEnabled,
    });

    this.apiClient = new ApiClient({
      apiUrl: chainConfig.apiUrl,
    });
  }

  /**
   * Sets the authenticated user (internal use only)
   * Automatically initializes MagicTEESigner when user is authenticated
   * @internal
   */
  private setAuthenticatedUser(user: User): void {
    this.authenticatedUser = user;
    this.initializeClients(this.crossSdkBridgeEnabled);
    this.initializeSigner();
  }

  /**
   * Initializes Magic TEE signer when user is authenticated
   */
  private initializeSigner(): void {
    if (!this.authenticatedUser) {
      return;
    }

    // Magic TEE config - hardcoded based on passport domain
    const isSandbox = this.passportDomain.includes('sandbox');
    const magicTeeBasePath = isSandbox
      ? 'https://api.sandbox.immutable.com/magic-tee'
      : 'https://api.immutable.com/magic-tee';

    // Magic config values - hardcoded (same for production and sandbox)
    // These match the values from the original Passport SDK
    const magicPublishableApiKey = 'pk_live_10F423798A540ED7';
    const magicProviderId = 'aa80b860-8869-4f13-9000-6a6ad3d20017';

    this.signer = new MagicTEESigner({
      magicTeeBasePath,
      magicPublishableApiKey,
      magicProviderId,
      authenticatedUser: this.authenticatedUser,
    });
  }

  /**
   * Sets auth client for automatic login
   * @internal
   */
  private setAuth(auth: Auth): void {
    this.auth = auth;
    // Try to get existing user
    auth.getUser().then((user: User | null) => {
      if (user) {
        this.setAuthenticatedUser(user);
      }
    }).catch(() => {
      // No user yet - will be handled when needed
    });
  }

  /**
   * Sets signer (internal use only)
   * @internal
   */
  private setSigner(signer: Signer): void {
    this.signer = signer;
  }

  /**
   * Gets the current chain ID
   */
  async getChainId(): Promise<number> {
    return this.currentChainId;
  }

  /**
   * Switches to a different chain
   */
  async switchChain(chainId: number): Promise<void> {
    if (!this.chains.has(chainId)) {
      throw new JsonRpcError(
        ProviderErrorCode.UNSUPPORTED_METHOD,
        `Chain ${chainId} not supported`,
      );
    }

    this.currentChainId = chainId;
    const chainConfig = this.chains.get(chainId)!;

    this.currentRpcUrl = chainConfig.rpcUrl;

    // Recreate RPC transport for new chain
    this.rpcTransport = http(this.currentRpcUrl);

    // Reinitialize clients with new chain config (always, regardless of user)
    // Note: crossSdkBridgeEnabled is stored in confirmationScreen config, so we need to read it back
    // For simplicity, we'll store it as a private field
    this.initializeClients(this.crossSdkBridgeEnabled);

    // Emit chainChanged event
    this.eventEmitter.emit('chainChanged', toHex(chainId));
  }

  /**
   * Adds a new chain configuration
   */
  addChain(chainConfig: ChainConfig): void {
    this.chains.set(chainConfig.chainId, chainConfig);
  }

  /**
   * Gets the cached wallet address
   * Returns undefined if wallet not yet registered (call eth_requestAccounts to register)
   */
  private async getWalletAddress(): Promise<string | undefined> {
    return this.walletAddress;
  }

  /**
   * Ensures wallet address exists, throws if not
   */
  private async ensureWalletAddress(): Promise<string> {
    const address = await this.getWalletAddress();
    if (!address) {
      throw new JsonRpcError(
        ProviderErrorCode.UNAUTHORIZED,
        'Unauthorised - call eth_requestAccounts first',
      );
    }
    return address;
  }

  /**
   * Ensures signer is set
   * Automatically initializes MagicTEESigner if user is authenticated but signer not yet created
   */
  private ensureSigner(): Signer {
    // If signer not set but user is authenticated, try to initialize it
    if (!this.signer && this.authenticatedUser) {
      this.initializeSigner();
    }

    if (!this.signer) {
      throw new JsonRpcError(
        ProviderErrorCode.UNAUTHORIZED,
        'Signer not available. User must be authenticated for signing operations.',
      );
    }
    return this.signer;
  }

  /**
   * Ensures user is authenticated, triggers login automatically if auth client provided
   */
  private async ensureAuthenticated(): Promise<void> {
    if (this.authenticatedUser) {
      return;
    }

    if (this.auth) {
      const user = await this.auth.loginPopup();
      if (user) {
        this.setAuthenticatedUser(user);
        return;
      }
    }

    throw new JsonRpcError(
      ProviderErrorCode.UNAUTHORIZED,
      'User not authenticated. Please provide an auth client or login first.',
    );
  }

  /**
   * Handles eth_requestAccounts
   * Automatically triggers login if auth client is provided and user not authenticated
   */
  private async handleRequestAccounts(): Promise<string[]> {
    // Check if we already have a wallet address
    const address = await this.getWalletAddress();
    if (address) {
      this.eventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, [address]);
      return [address];
    }

    // Ensure authenticated (will auto-login if auth client provided)
    await this.ensureAuthenticated();

    // Ensure signer is set
    const signer = this.ensureSigner();

    const MESSAGE_TO_SIGN = 'Only sign this message from Immutable Passport';

    // Get signer address and sign message
    const [ethereumAddress, ethereumSignature] = await Promise.all([
      signer.getAddress(),
      signer.signMessage(MESSAGE_TO_SIGN),
    ]);

    // Get chain name from API
    const chainName = await this.apiClient.getChainName(this.currentChainId);

    // Register user
    const counterfactualAddress = await this.apiClient.createCounterfactualAddress(
      chainName,
      ethereumAddress,
      ethereumSignature,
      this.authenticatedUser!,
    );

    this.walletAddress = counterfactualAddress;
    this.eventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, [counterfactualAddress]);

    return [counterfactualAddress];
  }

  /**
   * Handles eth_sendTransaction
   */
  private async handleSendTransaction(params: any[]): Promise<string> {
    await this.ensureAuthenticated();
    const address = await this.ensureWalletAddress();
    const signer = this.ensureSigner();

    const transactionRequest = params[0];
    if (!transactionRequest?.to || typeof transactionRequest.to !== 'string') {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        'Transaction must include to field',
      );
    }

    if (!isAddress(transactionRequest.to)) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        `Invalid address: ${transactionRequest.to}`,
      );
    }

    // Build meta-transactions (includes fee transaction)
    const { transactions: metaTransactions, nonce } = await buildMetaTransactions(
      {
        to: transactionRequest.to,
        data: transactionRequest.data,
        value: transactionRequest.value ? BigInt(transactionRequest.value) : undefined,
      },
      this.currentRpcUrl,
      this.relayerClient,
      address,
      this.currentChainId,
      this.authenticatedUser!,
    );

    const chainId = BigInt(this.currentChainId);

    // Validate and sign in parallel
    const signedTransactionData = await validateAndSignTransaction(
      metaTransactions,
      nonce,
      chainId,
      address,
      signer,
      this.guardianClient,
      this.authenticatedUser!,
      false,
    );

    // Send to relayer
    const relayerId = await this.relayerClient.ethSendTransaction(
      address, // to is the wallet address
      signedTransactionData,
      this.currentChainId,
      this.authenticatedUser!,
    );

    // Poll for transaction hash
    return this.pollTransaction(relayerId);
  }

  /**
   * Polls relayer for transaction hash
   * authenticatedUser is guaranteed by callers (ensureAuthenticated called before this)
   */
  private async pollTransaction(relayerId: string): Promise<string> {
    const maxAttempts = 30;
    const delayMs = 1000;

    // Polling loop - await is intentional
    // eslint-disable-next-line no-await-in-loop
    for (let i = 0; i < maxAttempts; i++) {
      // authenticatedUser is guaranteed by callers (ensureAuthenticated called before this)
      // eslint-disable-next-line no-await-in-loop
      const tx = await this.relayerClient.imGetTransactionByHash(relayerId, this.authenticatedUser!);

      if (tx.status === 'SUCCESSFUL' || tx.status === 'SUBMITTED') {
        if (!tx.hash) {
          throw new JsonRpcError(
            RpcErrorCode.INTERNAL_ERROR,
            'Transaction hash not available',
          );
        }
        return tx.hash;
      }

      if (tx.status === 'REVERTED' || tx.status === 'FAILED') {
        throw new JsonRpcError(
          RpcErrorCode.TRANSACTION_REJECTED,
          tx.statusMessage || 'Transaction failed',
        );
      }

      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), delayMs);
      });
    }

    throw new JsonRpcError(
      RpcErrorCode.RPC_SERVER_ERROR,
      'Transaction polling timeout',
    );
  }

  /**
   * Handles personal_sign
   */
  private async handlePersonalSign(params: any[]): Promise<string> {
    await this.ensureAuthenticated();
    const address = await this.ensureWalletAddress();
    const signer = this.ensureSigner();

    const message: string = params[0];
    const fromAddress: string = params[1];

    if (!fromAddress || !message) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        'personal_sign requires an address and a message',
      );
    }

    // Validate address format
    if (!isAddress(fromAddress)) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        `Invalid address: ${fromAddress}`,
      );
    }

    if (fromAddress.toLowerCase() !== address.toLowerCase()) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        'personal_sign requires the signer to be the from address',
      );
    }

    // Convert hex to string if needed
    const payload = hexToString(message as `0x${string}`);
    const chainId = BigInt(this.currentChainId);

    // Evaluate with guardian (passes wallet address for confirmation)
    await this.guardianClient.evaluateERC191Message(payload, address, this.currentChainId, this.authenticatedUser!);

    // Sign with EOA and get relayer signature in parallel
    const [eoaSignature, relayerSignature] = await Promise.all([
      signERC191Message(chainId, payload, signer, address),
      this.relayerClient.imSign(address, payload, this.currentChainId, this.authenticatedUser!),
    ]);

    const eoaAddress = await signer.getAddress();

    // Pack signatures
    return packSignatures(eoaSignature, eoaAddress, relayerSignature);
  }

  /**
   * Deploys the smart contract wallet by sending a zero-value transaction
   */
  private async deployWallet(): Promise<void> {
    await this.ensureAuthenticated();
    const address = await this.ensureWalletAddress();
    const signer = this.ensureSigner();

    // Build meta-transactions for deployment (zero-value transaction to self)
    const { transactions: metaTransactions, nonce } = await buildMetaTransactions(
      {
        to: address,
        data: '0x',
        value: BigInt(0),
      },
      this.currentRpcUrl,
      this.relayerClient,
      address,
      this.currentChainId,
      this.authenticatedUser!,
    );

    const chainId = BigInt(this.currentChainId);

    // Validate and sign in parallel
    const signedTransactionData = await validateAndSignTransaction(
      metaTransactions,
      nonce,
      chainId,
      address,
      signer,
      this.guardianClient,
      this.authenticatedUser!,
      false,
    );

    // Send to relayer
    const relayerId = await this.relayerClient.ethSendTransaction(
      address,
      signedTransactionData,
      this.currentChainId,
      this.authenticatedUser!,
    );

    // Wait for deployment to complete
    await this.pollTransaction(relayerId);
  }

  /**
   * Handles eth_signTypedData_v4
   */
  private async handleSignTypedDataV4(params: any[]): Promise<string> {
    await this.ensureAuthenticated();
    const address = await this.ensureWalletAddress();
    const signer = this.ensureSigner();

    const fromAddress: string = params[0];
    const typedDataParam: string | object = params[1];

    if (!fromAddress || !typedDataParam) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        'eth_signTypedData_v4 requires an address and typed data',
      );
    }

    // Validate address format
    if (!isAddress(fromAddress)) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        `Invalid address: ${fromAddress}`,
      );
    }

    // Parse typed data
    const typedData: TypedDataPayload = typeof typedDataParam === 'string'
      ? JSON.parse(typedDataParam) as TypedDataPayload
      : typedDataParam as TypedDataPayload;

    // Validate typed data structure
    if (!typedData.types || !typedData.domain || !typedData.primaryType || !typedData.message) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        'Invalid typed data: missing required fields',
      );
    }

    // Validate chainId matches current chain
    if (typedData.domain.chainId) {
      let providedChainId: number;
      if (typeof typedData.domain.chainId === 'string') {
        providedChainId = typedData.domain.chainId.startsWith('0x')
          ? parseInt(typedData.domain.chainId, 16)
          : parseInt(typedData.domain.chainId, 10);
      } else {
        providedChainId = typedData.domain.chainId;
      }

      if (BigInt(providedChainId) !== BigInt(this.currentChainId)) {
        throw new JsonRpcError(
          RpcErrorCode.INVALID_PARAMS,
          `Invalid chainId, expected ${this.currentChainId}`,
        );
      }
    }

    const chainId = BigInt(this.currentChainId);

    // Evaluate with guardian (passes wallet address for confirmation)
    await this.guardianClient.evaluateEIP712Message(
      typedData,
      address,
      this.currentChainId,
      this.authenticatedUser!,
    );

    // Get relayer signature
    const relayerSignature = await this.relayerClient.imSignTypedData(
      address,
      typedData,
      this.currentChainId,
      this.authenticatedUser!,
    );

    // If signer has signTypedData method, use it (ethers/viem signers)
    if (signer.signTypedData) {
      const eoaSignature = await signer.signTypedData(
        typedData.domain,
        typedData.types,
        typedData.message,
      );
      const eoaAddress = await signer.getAddress();
      return packSignatures(eoaSignature, eoaAddress, relayerSignature);
    }

    // Otherwise, use our implementation
    return signTypedData(typedData, relayerSignature, chainId, address, signer);
  }

  /**
   * Handles wallet_switchEthereumChain
   */
  private async handleSwitchChain(params: any[]): Promise<null> {
    const chainIdHex = params[0]?.chainId;
    if (!chainIdHex) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        'chainId is required',
      );
    }

    const chainId = typeof chainIdHex === 'string'
      ? Number(fromHex(chainIdHex as `0x${string}`, 'number'))
      : chainIdHex;

    await this.switchChain(chainId);
    return null;
  }

  /**
   * Handles wallet_addEthereumChain
   */
  private async handleAddChain(params: any[]): Promise<null> {
    const chainParams = params[0];
    if (!chainParams?.chainId || !chainParams?.rpcUrls?.[0]) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        'chainId and rpcUrls are required',
      );
    }

    const chainId = typeof chainParams.chainId === 'string'
      ? Number(fromHex(chainParams.chainId as `0x${string}`, 'number'))
      : chainParams.chainId;

    // Require API URLs - don't use defaults from current chain (they may be wrong)
    if (!chainParams.apiUrl || !chainParams.relayerUrl) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        'apiUrl and relayerUrl are required when adding a new chain',
      );
    }

    this.addChain({
      chainId,
      rpcUrl: chainParams.rpcUrls[0],
      relayerUrl: chainParams.relayerUrl,
      apiUrl: chainParams.apiUrl,
      name: chainParams.chainName || `Chain ${chainId}`,
    });

    return null;
  }

  /**
   * Handles im_signEjectionTransaction
   */
  private async handleSignEjectionTransaction(params: any[]): Promise<{
    to: string;
    data: string;
    chainId: string;
  }> {
    await this.ensureAuthenticated();
    const address = await this.ensureWalletAddress();
    const signer = this.ensureSigner();

    if (!params || params.length !== 1) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        'im_signEjectionTransaction requires a singular param (transaction)',
      );
    }

    const transactionRequest: TransactionRequest = params[0];

    return prepareAndSignEjectionTransaction({
      transactionRequest,
      ethSigner: signer,
      zkEvmAddress: address,
      chainId: this.currentChainId,
    });
  }

  /**
   * Handles im_addSessionActivity
   */
  private async handleAddSessionActivity(params: any[]): Promise<null> {
    const address = await this.ensureWalletAddress();
    const [clientId] = params || [];

    if (!clientId) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        'im_addSessionActivity requires a clientId',
      );
    }

    // Session activity is handled asynchronously and doesn't block
    // This is a fire-and-forget operation for analytics
    this.callSessionActivity(address, clientId).catch(() => {
      // Silently fail - session activity is non-critical
    });

    return null;
  }

  /**
   * Calls session activity API (background operation)
   */
  private async callSessionActivity(walletAddress: string, clientId: string): Promise<void> {
    if (!this.authenticatedUser?.access_token) {
      return; // Skip if not authenticated
    }

    // Determine API URL based on chain configuration
    const chainConfig = this.chains.get(this.currentChainId);
    if (!chainConfig) {
      return;
    }

    // Session activity always uses production API
    const sessionActivityUrl = 'https://api.immutable.com/v1/sdk/session-activity/check';
    const params = new URLSearchParams({
      clientId,
      wallet: walletAddress,
      checkCount: '0',
      sendCount: '0',
    });
    const url = `${sessionActivityUrl}?${params.toString()}`;

    try {
      const response = await fetch(
        url,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.authenticatedUser.access_token}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          return; // No session activity required
        }
        throw new Error(`Session activity error: ${response.status}`);
      }

      const data = await response.json();

      // If contract address and function name are provided, send a background transaction
      if (data.contractAddress && data.functionName) {
        // Send background transaction in nonce space 1
        await this.sendBackgroundTransaction(
          walletAddress,
          data.contractAddress,
          data.functionName,
          data.delay,
        );
      }
    } catch (error) {
      // Silently fail - session activity is non-critical
    }
  }

  /**
   * Sends a background transaction for session activity
   */
  private async sendBackgroundTransaction(
    walletAddress: string,
    contractAddress: string,
    functionName: string,
    delay?: number,
  ): Promise<void> {
    try {
      await this.ensureAuthenticated();
      const signer = this.ensureSigner();

      // Encode function call (simple function with no parameters)
      const functionSelector = getFunctionSelector(`${functionName}()`);

      // Build meta-transactions with nonce space 1 (background)
      const nonceSpace = BigInt(1);
      const { transactions: metaTransactions, nonce } = await buildMetaTransactions(
        {
          to: contractAddress,
          data: functionSelector,
        },
        this.currentRpcUrl,
        this.relayerClient,
        walletAddress,
        this.currentChainId,
        this.authenticatedUser!,
        nonceSpace,
      );

      const chainId = BigInt(this.currentChainId);

      // Validate and sign in parallel
      const signedTransactionData = await validateAndSignTransaction(
        metaTransactions,
        nonce,
        chainId,
        walletAddress,
        signer,
        this.guardianClient,
        this.authenticatedUser!,
        true, // isBackgroundTransaction
      );

      // Send to relayer
      await this.relayerClient.ethSendTransaction(
        walletAddress,
        signedTransactionData,
        this.currentChainId,
        this.authenticatedUser!,
      );

      // Wait for delay if specified
      if (delay && delay > 0) {
        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), delay * 1000);
        });
      }
    } catch (error) {
      // Silently fail - background transaction is non-critical
    }
  }

  /**
   * Performs the actual request handling
   */
  private async performRequest(request: RequestArguments): Promise<any> {
    switch (request.method) {
      case 'eth_requestAccounts': {
        return this.handleRequestAccounts();
      }
      case 'eth_accounts': {
        const address = await this.getWalletAddress();
        return address ? [address] : [];
      }
      case 'eth_chainId': {
        return toHex(this.currentChainId);
      }
      case 'eth_sendTransaction': {
        return this.handleSendTransaction(request.params || []);
      }
      case 'personal_sign': {
        return this.handlePersonalSign(request.params || []);
      }
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4': {
        return this.handleSignTypedDataV4(request.params || []);
      }
      case 'wallet_switchEthereumChain': {
        return this.handleSwitchChain(request.params || []);
      }
      case 'wallet_addEthereumChain': {
        return this.handleAddChain(request.params || []);
      }
      // Pass through read-only methods to RPC
      case 'eth_getBalance':
      case 'eth_getCode':
      case 'eth_getTransactionCount':
      case 'eth_getStorageAt':
      case 'eth_call':
      case 'eth_estimateGas':
      case 'eth_gasPrice':
      case 'eth_blockNumber':
      case 'eth_getBlockByHash':
      case 'eth_getBlockByNumber':
      case 'eth_getTransactionByHash':
      case 'eth_getTransactionReceipt': {
        const client = createPublicClient({
          transport: this.rpcTransport,
        });
        switch (request.method) {
          case 'eth_gasPrice':
            return client.getGasPrice();
          case 'eth_blockNumber':
            return client.getBlockNumber();
          case 'eth_getBlockByHash':
            return client.getBlock({ blockHash: (request.params?.[0] as `0x${string}`) || undefined });
          case 'eth_getBlockByNumber':
            return client.getBlock({ blockNumber: request.params?.[0] as any });
          case 'eth_getTransactionByHash':
            return client.getTransaction({ hash: (request.params?.[0] as `0x${string}`) || undefined });
          case 'eth_getTransactionReceipt':
            return client.getTransactionReceipt({ hash: (request.params?.[0] as `0x${string}`) || undefined });
          default:
            throw new JsonRpcError(
              ProviderErrorCode.UNSUPPORTED_METHOD,
              `Method ${request.method} not supported`,
            );
        }
      }
      case 'im_signEjectionTransaction': {
        return this.handleSignEjectionTransaction(request.params || []);
      }
      case 'im_addSessionActivity': {
        return this.handleAddSessionActivity(request.params || []);
      }
      default: {
        throw new JsonRpcError(
          ProviderErrorCode.UNSUPPORTED_METHOD,
          `Method ${request.method} not supported`,
        );
      }
    }
  }

  /**
   * EIP-1193 request method
   */
  public async request(request: RequestArguments): Promise<unknown> {
    try {
      return await this.performRequest(request);
    } catch (error) {
      if (error instanceof JsonRpcError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, error.message);
      }
      throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, 'Internal error');
    }
  }

  /**
   * EIP-1193 event subscription
   */
  public on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * EIP-1193 event unsubscription
   */
  public removeListener(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.removeListener(event, listener);
  }
}
