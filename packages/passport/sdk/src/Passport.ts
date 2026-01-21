import { IMXProvider } from '@imtbl/x-provider';
import {
  createConfig, ImxApiClients, imxApiConfig, MagicTeeApiClients, MultiRollupApiClients,
} from '@imtbl/generated-clients';
import { IMXClient } from '@imtbl/x-client';
import { Environment } from '@imtbl/config';

import { setPassportClientId, trackError, trackFlow } from '@imtbl/metrics';
import {
  Auth,
  UserProfile,
  DeviceTokenResponse,
  isUserZkEvm,
} from '@imtbl/auth';
import type { DirectLoginOptions } from '@imtbl/auth';
import {
  connectWallet,
  WalletConfiguration,
  GuardianClient,
  MagicTEESigner,
  ChainConfig,
  ConfirmationScreen,
  EvmChain,
  getChainConfig,
} from '@imtbl/wallet';
import type { Provider, LinkWalletParams, LinkedWallet } from '@imtbl/wallet';
import {
  PassportModuleConfiguration,
  ConnectEvmArguments,
  LoginArguments,
} from './types';
import { toUserImx } from './utils/imxUser';
import { PassportImxProviderFactory } from './starkEx';
import { PassportConfiguration } from './config';
import { withMetricsAsync } from './utils/metrics';
import { PassportError, PassportErrorType } from './errors/passportError';
import { ImxGuardianClient } from './starkEx/imxGuardianClient';
import { getHttpErrorResponse } from './utils/httpError';

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

  const authConfig = auth.getConfig();
  const confirmationScreen = new ConfirmationScreen(authConfig);

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
    auth,
    guardianApi: multiRollupApiClients.guardianApi,
    authConfig,
  });

  const imxGuardianClient = new ImxGuardianClient({
    auth,
    guardianApi: multiRollupApiClients.guardianApi,
    confirmationScreen,
    crossSdkBridgeEnabled: passportModuleConfiguration.crossSdkBridgeEnabled || false,
  });

  // Create Magic TEE signer for IMX provider
  const magicTeeApiClients = new MagicTeeApiClients({
    basePath: passportConfig.magicTeeBasePath,
    timeout: passportConfig.magicTeeTimeout,
    magicPublishableApiKey: passportConfig.magicPublishableApiKey,
    magicProviderId: passportConfig.magicProviderId,
  });
  const magicTEESigner = new MagicTEESigner(auth, magicTeeApiClients);

  const imxApiClients = buildImxApiClients(passportModuleConfiguration);

  const passportImxProviderFactory = new PassportImxProviderFactory({
    auth,
    immutableXClient,
    magicTEESigner,
    passportEventEmitter: auth.eventEmitter,
    imxApiClients,
    guardianClient,
    imxGuardianClient,
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
  }

  // ============================================================================
  // IMX-SPECIFIC METHODS
  // ============================================================================

  /**
   * Attempts to connect to IMX silently without user interaction.
   * @returns {Promise<IMXProvider | null>} A promise that resolves to an IMX provider if successful, or null if no cached session exists
   * @deprecated The method `login` with an argument of `{ useCachedSession: true }` should be used in conjunction with `connectImx` instead
   */
  public async connectImxSilent(): Promise<IMXProvider | null> {
    return withMetricsAsync(
      () => this.passportImxProviderFactory.getProviderSilent(),
      'connectImxSilent',
      false,
    );
  }

  /**
   * Connects to IMX, prompting user interaction if necessary.
   * @returns {Promise<IMXProvider>} A promise that resolves to an IMX provider
   */
  public async connectImx(): Promise<IMXProvider> {
    return withMetricsAsync(
      () => this.passportImxProviderFactory.getProvider(),
      'connectImx',
      false,
    );
  }

  // ============================================================================
  // ZKEVM-SPECIFIC METHODS
  // Uses Auth + Wallet packages
  // ============================================================================

  /**
   * Connects to EVM and optionally announces the provider.
   * Uses: Auth + Wallet packages
   * @param {Object} options - Configuration options
   * @param {boolean} options.announceProvider - Whether to announce the provider via EIP-6963 for wallet discovery (defaults to true)
   * @param {EvmChain} options.chain - The EVM chain to connect to (defaults to ZKEVM)
   * @returns {Promise<Provider>} The EVM provider instance
   */
  public async connectEvm(options: ConnectEvmArguments = { announceProvider: true }): Promise<Provider> {
    return withMetricsAsync(async () => {
      const chain = options?.chain ?? EvmChain.ZKEVM;

      // TODO: Remove this check once other chains are fully implemented
      if (chain !== EvmChain.ZKEVM) {
        throw new Error(`Chain ${chain} is not yet supported. Only ZKEVM is currently available.`);
      }

      // Build chain configuration based on selected chain
      const chainConfig = this.buildChainConfig(chain);

      // Use fee token from chain config, default to IMX for zkEVM
      const feeTokenSymbol = chainConfig.feeTokenSymbol ?? 'IMX';

      // Use connectWallet to create the provider (it will create WalletConfiguration internally)
      const provider = await connectWallet({
        auth: this.auth,
        chains: [chainConfig],
        crossSdkBridgeEnabled: this.passportConfig.crossSdkBridgeEnabled,
        jsonRpcReferrer: this.passportConfig.jsonRpcReferrer,
        forceScwDeployBeforeMessageSignature: this.passportConfig.forceScwDeployBeforeMessageSignature,
        passportEventEmitter: this.auth.eventEmitter,
        feeTokenSymbol,
        announceProvider: options?.announceProvider ?? true,
      });

      return provider;
    }, 'connectEvm', false);
  }

  /**
   * Build chain configuration based on selected chain and environment
   * @internal
   */
  private buildChainConfig(chain: EvmChain): ChainConfig {
    // Access PassportOverrides from PassportConfiguration
    const passportOverrides = this.passportConfig.overrides;

    // For zkEVM chain (default)
    if (chain === EvmChain.ZKEVM) {
      if (passportOverrides?.zkEvmChainId) {
        // Dev environment with custom chain
        return {
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
      }

      if (this.environment === Environment.PRODUCTION) {
        // Production environment
        return {
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
      }

      // Sandbox/testnet environment
      return {
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

    // For all other chains, use the registry lookup
    const chainConfig = getChainConfig(chain, this.environment);

    // If dev overrides exist, use dev-specific Passport config
    if (passportOverrides) {
      return {
        ...chainConfig,
        apiUrl: this.passportConfig.multiRollupConfig.indexer.basePath || chainConfig.apiUrl,
        passportDomain: this.passportConfig.passportDomain,
      };
    }

    // Standard SANDBOX/PRODUCTION
    return {
      ...chainConfig,
      apiUrl: this.passportConfig.multiRollupConfig.indexer.basePath || chainConfig.apiUrl,
      passportDomain: this.passportConfig.passportDomain,
    };
  }

  // ============================================================================
  // SHARED METHODS (zkEVM + IMX)
  // Uses Auth class (public API)
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
   * @param {MarketingConsentStatus} [options.directLoginOptions.marketingConsentStatus] - Marketing consent status ('opted_in' | 'unsubscribed' | 'subscribed')
   * @param {string} [options.directLoginOptions.email] - Required when directLoginMethod is 'email'
   * @returns {Promise<UserProfile | null>} A promise that resolves to the user profile if logged in, null otherwise
   * @throws {Error} If retrieving the cached user session fails (except for "Unknown or invalid refresh token" errors)
   *                and useCachedSession is true
   */
  public async login(options?: LoginArguments): Promise<UserProfile | null> {
    // Convert Passport's LoginArguments to Auth's LoginOptions (excludes anonymousId)
    const authLoginOptions = options ? {
      useCachedSession: options.useCachedSession,
      useSilentLogin: options.useSilentLogin,
      useRedirectFlow: options.useRedirectFlow,
      directLoginOptions: options.directLoginOptions,
    } : undefined;

    const user = await this.auth.login(authLoginOptions);
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
    return withMetricsAsync(async () => {
      const user = await this.auth.getUser();
      return user?.profile;
    }, 'getUserInfo', false);
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
    return withMetricsAsync(async () => {
      const user = await this.auth.getUser();
      if (!user?.profile.sub) {
        return [];
      }

      const headers = { Authorization: `Bearer ${user.accessToken}` };
      const getUserInfoResult = await this.multiRollupApiClients.passportProfileApi.getUserInfo({ headers });
      return getUserInfoResult.data.linked_addresses;
    }, 'getLinkedAddresses', false);
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
    type ApiError = {
      code: string;
      message: string;
    };

    const isApiError = (error: unknown): error is ApiError => (
      typeof error === 'object'
      && error !== null
      && 'code' in error
      && 'message' in error
    );

    const flow = trackFlow('passport', 'linkExternalWallet', false);

    try {
      const user = await this.auth.getUser();
      if (!user) {
        throw new PassportError('User is not logged in', PassportErrorType.NOT_LOGGED_IN_ERROR);
      }

      const isRegisteredWithZkEvm = isUserZkEvm(user);
      const isRegisteredWithIMX = (() => {
        try {
          toUserImx(user);
          return true;
        } catch (imxError) {
          if (
            imxError instanceof PassportError
            && imxError.type === PassportErrorType.USER_NOT_REGISTERED_ERROR
          ) {
            return false;
          }
          throw imxError;
        }
      })();

      if (!isRegisteredWithIMX && !isRegisteredWithZkEvm) {
        throw new PassportError('User has not been registered', PassportErrorType.USER_NOT_REGISTERED_ERROR);
      }

      const headers = { Authorization: `Bearer ${user.accessToken}` };
      const linkWalletV2Request = {
        type: params.type,
        wallet_address: params.walletAddress,
        signature: params.signature,
        nonce: params.nonce,
      };

      const linkWalletV2Result = await this.multiRollupApiClients
        .passportProfileApi.linkWalletV2({ linkWalletV2Request }, { headers });
      return { ...linkWalletV2Result.data };
    } catch (error) {
      if (error instanceof Error) {
        trackError('passport', 'linkExternalWallet', error);
      } else {
        flow.addEvent('errored');
      }

      if (error instanceof PassportError) {
        throw error;
      }

      const httpResponse = getHttpErrorResponse(error);
      if (httpResponse) {
        if (httpResponse.data && isApiError(httpResponse.data)) {
          const { code, message } = httpResponse.data;

          switch (code) {
            case 'ALREADY_LINKED':
              throw new PassportError(message, PassportErrorType.LINK_WALLET_ALREADY_LINKED_ERROR);
            case 'MAX_WALLETS_LINKED':
              throw new PassportError(message, PassportErrorType.LINK_WALLET_MAX_WALLETS_LINKED_ERROR);
            case 'DUPLICATE_NONCE':
              throw new PassportError(message, PassportErrorType.LINK_WALLET_DUPLICATE_NONCE_ERROR);
            case 'VALIDATION_ERROR':
              throw new PassportError(message, PassportErrorType.LINK_WALLET_VALIDATION_ERROR);
            default:
              throw new PassportError(message, PassportErrorType.LINK_WALLET_GENERIC_ERROR);
          }
        } else if (httpResponse.status) {
          throw new PassportError(
            `Link wallet request failed with status code ${httpResponse.status}`,
            PassportErrorType.LINK_WALLET_GENERIC_ERROR,
          );
        }
      }

      let message: string = 'Link wallet request failed';
      if (error instanceof Error) {
        message += `: ${error.message}`;
      }

      throw new PassportError(
        message,
        PassportErrorType.LINK_WALLET_GENERIC_ERROR,
      );
    } finally {
      flow.addEvent('End');
    }
  }
}
