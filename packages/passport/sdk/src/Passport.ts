import { IMXProvider } from '@imtbl/x-provider';
import {
  createConfig, ImxApiClients, imxApiConfig, MagicTeeApiClients, MultiRollupApiClients,
} from '@imtbl/generated-clients';
import { IMXClient } from '@imtbl/x-client';
import { Environment } from '@imtbl/config';

import { setPassportClientId, track } from '@imtbl/metrics';
import {
  Auth,
  UserProfile,
  DeviceTokenResponse,
} from '@imtbl/auth';
import type { DirectLoginOptions } from '@imtbl/auth';
import {
  connectWallet,
  ZkEvmProvider,
  WalletConfiguration,
  GuardianClient,
  MagicTEESigner,
  ChainConfig,
  linkExternalWallet as walletLinkExternalWallet,
  getLinkedAddresses as walletGetLinkedAddresses,
} from '@imtbl/wallet';
import type { LinkWalletParams, LinkedWallet } from '@imtbl/wallet';
import {
  PassportModuleConfiguration,
  ConnectEvmArguments,
  LoginArguments,
} from './types';
import { PassportImxProviderFactory } from './starkEx';
import { PassportConfiguration } from './config';

const buildImxClientConfig = (passportModuleConfiguration: PassportModuleConfiguration) => {
  if (passportModuleConfiguration.overrides) {
    return createConfig({ basePath: passportModuleConfiguration.overrides.imxPublicApiDomain });
  }
  if (passportModuleConfiguration.baseConfig.environment === Environment.SANDBOX) {
    return imxApiConfig.getSandbox();
  }
  return imxApiConfig.getProduction();
};

const buildImxApiClients = (passportModuleConfiguration: PassportModuleConfiguration) => {
  if (passportModuleConfiguration.overrides?.imxApiClients) return passportModuleConfiguration.overrides.imxApiClients;

  const config = buildImxClientConfig(passportModuleConfiguration);
  return new ImxApiClients(config);
};

export const buildPrivateVars = (passportModuleConfiguration: PassportModuleConfiguration) => {
  const passportConfig = new PassportConfiguration(passportModuleConfiguration);
  // Create auth configuration for confirmation screen
  // Create Auth instance (public API)
  const auth = new Auth({
    ...passportModuleConfiguration,
    authenticationDomain: passportConfig.authenticationDomain,
    crossSdkBridgeEnabled: passportModuleConfiguration.crossSdkBridgeEnabled,
    popupOverlayOptions: passportModuleConfiguration.popupOverlayOptions,
    passportDomain: passportConfig.passportDomain,
  });

  // Get AuthManager for internal IMX provider use
  const authManager = auth.getAuthManager();
  const authConfig = auth.getConfig();

  // Create wallet configuration with concrete URLs (no environment)
  // PassportConfiguration translates environment → URLs
  const walletConfig = new WalletConfiguration({
    passportDomain: passportConfig.passportDomain,
    zkEvmRpcUrl: passportConfig.zkEvmRpcUrl,
    relayerUrl: passportConfig.relayerUrl,
    indexerMrBasePath: passportConfig.multiRollupConfig.indexer.basePath || passportConfig.passportDomain,
    jsonRpcReferrer: passportModuleConfiguration.jsonRpcReferrer,
    forceScwDeployBeforeMessageSignature: passportModuleConfiguration.forceScwDeployBeforeMessageSignature,
    crossSdkBridgeEnabled: passportModuleConfiguration.crossSdkBridgeEnabled,
  });

  // Setup IMX-specific components
  const multiRollupApiClients = new MultiRollupApiClients(passportConfig.multiRollupConfig);

  const immutableXClient = passportModuleConfiguration.overrides
    ? passportModuleConfiguration.overrides.immutableXClient
    : new IMXClient({ baseConfig: passportModuleConfiguration.baseConfig });

  // Create Guardian client for IMX provider
  const guardianClient = new GuardianClient({
    config: walletConfig,
    authManager,
    guardianApi: multiRollupApiClients.guardianApi,
    authConfig,
  });

  // Create Magic TEE signer for IMX provider
  const magicTeeApiClients = new MagicTeeApiClients({
    basePath: passportConfig.magicTeeBasePath,
    timeout: passportConfig.magicTeeTimeout,
    magicPublishableApiKey: passportConfig.magicPublishableApiKey,
    magicProviderId: passportConfig.magicProviderId,
  });
  const magicTEESigner = new MagicTEESigner(authManager, magicTeeApiClients);

  const imxApiClients = buildImxApiClients(passportModuleConfiguration);

  const passportImxProviderFactory = new PassportImxProviderFactory({
    authManager,
    immutableXClient,
    magicTEESigner,
    passportEventEmitter: auth.eventEmitter,
    imxApiClients,
    guardianClient,
  });

  return {
    passportConfig,
    auth,
    passportImxProviderFactory,
    environment: passportModuleConfiguration.baseConfig.environment,
    // Keep walletConfig only for IMX GuardianClient
    walletConfig,
  };
};

export class Passport {
  // ============================================================================
  // DEPENDENCIES & CONFIGURATION
  // ============================================================================

  // Auth & Wallet (zkEVM uses these via public APIs)
  private readonly auth: Auth;

  private readonly passportImxProviderFactory: PassportImxProviderFactory;

  private readonly multiRollupApiClients: MultiRollupApiClients;

  private readonly environment: Environment;

  private readonly passportConfig: PassportConfiguration;

  constructor(passportModuleConfiguration: PassportModuleConfiguration) {
    const privateVars = buildPrivateVars(passportModuleConfiguration);

    this.auth = privateVars.auth;
    this.passportImxProviderFactory = privateVars.passportImxProviderFactory;
    this.passportConfig = privateVars.passportConfig;
    this.multiRollupApiClients = new MultiRollupApiClients(this.passportConfig.multiRollupConfig);
    this.environment = privateVars.environment;

    setPassportClientId(passportModuleConfiguration.clientId);
    track('passport', 'initialise');
  }

  // ============================================================================
  // IMX-SPECIFIC METHODS
  // Can use AuthManager directly for IMX-specific operations
  // ============================================================================

  /**
   * Attempts to connect to IMX silently without user interaction.
   * @returns {Promise<IMXProvider | null>} A promise that resolves to an IMX provider if successful, or null if no cached session exists
   * @deprecated The method `login` with an argument of `{ useCachedSession: true }` should be used in conjunction with `connectImx` instead
   */
  public async connectImxSilent(): Promise<IMXProvider | null> {
    return this.passportImxProviderFactory.getProviderSilent();
  }

  /**
   * Connects to IMX, prompting user interaction if necessary.
   * @returns {Promise<IMXProvider>} A promise that resolves to an IMX provider
   */
  public async connectImx(): Promise<IMXProvider> {
    return this.passportImxProviderFactory.getProvider();
  }

  // ============================================================================
  // ZKEVM-SPECIFIC METHODS
  // Uses Auth + Wallet packages (not AuthManager directly)
  // ============================================================================

  /**
   * Connects to EVM and optionally announces the provider.
   * Uses: Auth + Wallet packages
   * @param {Object} options - Configuration options
   * @param {boolean} options.announceProvider - Whether to announce the provider via EIP-6963 for wallet discovery (defaults to true)
   * @returns {Promise<Provider>} The EVM provider instance
   */
  public async connectEvm(options: ConnectEvmArguments = { announceProvider: true }): Promise<ZkEvmProvider> {
    // Access PassportOverrides from PassportConfiguration
    const passportOverrides = this.passportConfig.overrides;

    // Build complete chain configuration
    let chainConfig: ChainConfig;

    if (passportOverrides?.zkEvmChainId) {
      // Dev environment with custom chain
      chainConfig = {
        chainId: passportOverrides.zkEvmChainId,
        name: passportOverrides.zkEvmChainName || 'Dev Chain',
        rpcUrl: this.passportConfig.zkEvmRpcUrl,
        relayerUrl: this.passportConfig.relayerUrl,
        apiUrl: this.passportConfig.multiRollupConfig.indexer.basePath || this.passportConfig.passportDomain,
        passportDomain: this.passportConfig.passportDomain,
        magicPublishableApiKey: this.passportConfig.magicPublishableApiKey,
        magicProviderId: this.passportConfig.magicProviderId,
        magicTeeBasePath: passportOverrides.magicTeeBasePath || this.passportConfig.magicTeeBasePath,
      };
    } else if (this.environment === Environment.PRODUCTION) {
      // Production environment
      chainConfig = {
        chainId: 13371,
        name: 'Immutable zkEVM',
        rpcUrl: this.passportConfig.zkEvmRpcUrl,
        relayerUrl: this.passportConfig.relayerUrl,
        apiUrl: this.passportConfig.multiRollupConfig.indexer.basePath || this.passportConfig.passportDomain,
        passportDomain: this.passportConfig.passportDomain,
        magicPublishableApiKey: this.passportConfig.magicPublishableApiKey,
        magicProviderId: this.passportConfig.magicProviderId,
        magicTeeBasePath: this.passportConfig.magicTeeBasePath,
      };
    } else {
      // Sandbox/testnet environment
      chainConfig = {
        chainId: 13473,
        name: 'Immutable zkEVM Testnet',
        rpcUrl: this.passportConfig.zkEvmRpcUrl,
        relayerUrl: this.passportConfig.relayerUrl,
        apiUrl: this.passportConfig.multiRollupConfig.indexer.basePath || this.passportConfig.passportDomain,
        passportDomain: this.passportConfig.passportDomain,
        magicPublishableApiKey: this.passportConfig.magicPublishableApiKey,
        magicProviderId: this.passportConfig.magicProviderId,
        magicTeeBasePath: this.passportConfig.magicTeeBasePath,
      };
    }

    // Use connectWallet to create the provider (it will create WalletConfiguration internally)
    const provider = await connectWallet({
      auth: this.auth,
      chains: [chainConfig],
      crossSdkBridgeEnabled: this.passportConfig.crossSdkBridgeEnabled,
      jsonRpcReferrer: this.passportConfig.jsonRpcReferrer,
      forceScwDeployBeforeMessageSignature: this.passportConfig.forceScwDeployBeforeMessageSignature,
      passportEventEmitter: this.auth.eventEmitter,
      announceProvider: options?.announceProvider ?? true,
    });

    return provider;
  }

  // ============================================================================
  // SHARED METHODS (zkEVM + IMX)
  // Uses Auth class (public API) instead of AuthManager directly
  // Exception: forceUserRefresh for silent login (advanced operation)
  // ============================================================================

  /**
   * Logs in the user (works for both zkEVM and IMX).
   * Uses: Auth class
   * @param {Object} [options] - Login options
   * @param {boolean} [options.useCachedSession] - If true, attempts to use a cached session without user interaction.
   * @param {boolean} [options.useSilentLogin] - If true, attempts silent authentication without user interaction.
   *                                            Note: This takes precedence over useCachedSession if both are true
   * @param {boolean} [options.useRedirectFlow] - If true, uses redirect flow instead of popup flow
   * @param {DirectLoginOptions} [options.directLoginOptions] - If provided, contains login method and marketing consent options
   * @param {string} [options.directLoginOptions.directLoginMethod] - The login method to use (e.g., 'google', 'apple', 'email')
   * @param {MarketingConsentStatus} [options.directLoginOptions.marketingConsentStatus] - Marketing consent status ('opted_in' or 'unsubscribed')
   * @param {string} [options.directLoginOptions.email] - Required when directLoginMethod is 'email'
   * @returns {Promise<UserProfile | null>} A promise that resolves to the user profile if logged in, null otherwise
   * @throws {Error} If retrieving the cached user session fails (except for "Unknown or invalid refresh token" errors)
   *                and useCachedSession is true
   */
  public async login(options?: LoginArguments): Promise<UserProfile | null> {
    // Convert Passport's LoginArguments to Auth's LoginOptions
    const authLoginOptions = options ? {
      useCachedSession: options.useCachedSession,
      anonymousId: options.anonymousId,
      useSilentLogin: options.useSilentLogin,
      useRedirectFlow: options.useRedirectFlow,
      directLoginOptions: options.directLoginOptions ? {
        directLoginMethod: options.directLoginOptions.directLoginMethod,
        email: options.directLoginOptions.email,
        marketingConsentStatus: options.directLoginOptions.marketingConsentStatus,
      } : undefined,
    } : undefined;

    const user = await this.auth.loginWithOptions(authLoginOptions);
    return user ? user.profile : null;
  }

  /**
   * Handles the login callback from the authentication service.
   * Uses: Auth class
   * @returns {Promise<void>} A promise that resolves when the login callback is handled
   */
  public async loginCallback(): Promise<void> {
    await this.auth.loginCallback();
  }

  /**
   * Logs out the user (works for both zkEVM and IMX).
   * Uses: Auth class
   * @returns {Promise<void>} A promise that resolves when the user is logged out
   */
  public async logout(): Promise<void> {
    await this.auth.logout();
  }

  /**
   * Retrieves the current user's information.
   * Uses: Auth class
   * @returns {Promise<UserProfile | undefined>} A promise that resolves to the user profile if logged in, undefined otherwise
   */
  public async getUserInfo(): Promise<UserProfile | undefined> {
    const user = await this.auth.getUser();
    return user?.profile;
  }

  /**
   * Retrieves the ID token.
   * @returns {Promise<string | undefined>} A promise that resolves to the ID token if available, undefined otherwise
   */
  public async getIdToken(): Promise<string | undefined> {
    const user = await this.auth.getUser();
    return user?.idToken;
  }

  /**
   * Retrieves the access token.
   * @returns {Promise<string | undefined>} A promise that resolves to the access token if available, undefined otherwise
   */
  public async getAccessToken(): Promise<string | undefined> {
    const user = await this.auth.getUser();
    return user?.accessToken;
  }

  /**
   * Retrieves the PKCE authorization URL for the login flow.
   * Uses: Auth class
   * @param {DirectLoginOptions} [directLoginOptions] - Optional direct login options
   * @param {string} [imPassportTraceId] - Optional trace ID
   * @returns {Promise<string>} A promise that resolves to the authorization URL
   */
  public async loginWithPKCEFlow(directLoginOptions?: DirectLoginOptions, imPassportTraceId?: string): Promise<string> {
    return this.auth.loginWithPKCEFlow(directLoginOptions, imPassportTraceId);
  }

  /**
     * Handles the PKCE login callback.
     * Uses: Auth class
     * @param {string} authorizationCode - The authorization code from the OAuth provider
     * @param {string} state - The state parameter for CSRF protection
     * @returns {Promise<UserProfile>} A promise that resolves to the user profile
     */
  public async loginWithPKCEFlowCallback(authorizationCode: string, state: string): Promise<UserProfile> {
    const user = await this.auth.loginWithPKCEFlowCallback(authorizationCode, state);
    return user.profile;
  }

  /**
     * Stores the provided tokens and retrieves the user profile.
     * Uses: Auth class
     * @param {DeviceTokenResponse} tokenResponse - The token response from device flow
     * @returns {Promise<UserProfile>} A promise that resolves to the user profile
     */
  public async storeTokens(tokenResponse: DeviceTokenResponse): Promise<UserProfile> {
    const user = await this.auth.storeTokens(tokenResponse);
    return user.profile;
  }

  /**
   * Retrieves the logout URL.
   * @returns {Promise<string | undefined>} A promise that resolves to the logout URL, or undefined if not available
   */
  public async getLogoutUrl(): Promise<string | undefined> {
    const url = await this.auth.getLogoutUrl();
    return url;
  }

  /**
   * Handles the silent logout callback.
   * @param {string} url - The URL containing the logout information
   * @returns {Promise<void>} A promise that resolves when the silent logout callback is handled
   */
  public async logoutSilentCallback(url: string): Promise<void> {
    return this.auth.logoutSilentCallback(url);
  }

  /**
   * Retrieves the addresses linked to the current user's account.
   * @returns {Promise<string[]>} A promise that resolves to an array of linked addresses
   */
  public async getLinkedAddresses(): Promise<string[]> {
    // Delegate to wallet package
    return walletGetLinkedAddresses(this.auth, this.multiRollupApiClients);
  }

  /**
   * Links an external wallet to the user's Passport account.
   * @param {LinkWalletParams} params - Parameters for linking the wallet
   * @returns {Promise<LinkedWallet>} A promise that resolves to the linked wallet information
   * @throws {PassportError} If the user is not logged in (NOT_LOGGED_IN_ERROR)
   *  - If the user is not registered with StarkEx (USER_NOT_REGISTERED_ERROR)
   *  - If the wallet is already linked (LINK_WALLET_ALREADY_LINKED_ERROR)
   *  - If the maximum number of wallets are linked (LINK_WALLET_MAX_WALLETS_LINKED_ERROR)
   *  - Duplicate nonce used (LINK_WALLET_DUPLICATE_NONCE_ERROR)
   *  - Validation fails (LINK_WALLET_VALIDATION_ERROR)
   *  - Other generic errors (LINK_WALLET_GENERIC_ERROR)
   */
  public async linkExternalWallet(params: LinkWalletParams): Promise<LinkedWallet> {
    // Delegate to wallet package (tracking handled there)
    return walletLinkExternalWallet(this.auth, this.multiRollupApiClients, params);
  }
}
