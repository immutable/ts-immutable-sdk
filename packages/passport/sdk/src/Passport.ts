import { IMXProvider } from '@imtbl/x-provider';
import {
  createConfig, ImxApiClients, imxApiConfig, MagicTeeApiClients, MultiRollupApiClients,
} from '@imtbl/generated-clients';
import { IMXClient } from '@imtbl/x-client';
import { Environment } from '@imtbl/config';

import {
  identify, setPassportClientId, track, trackError,
  trackFlow,
} from '@imtbl/metrics';
import { isAxiosError } from 'axios';
import {
  AuthManager,
  AuthConfiguration,
  ConfirmationScreen,
  EmbeddedLoginPrompt,
  User,
  UserProfile,
  isUserImx,
  isUserZkEvm,
  DirectLoginOptions,
  DeviceTokenResponse,
} from '@imtbl/auth';
import {
  ZkEvmProvider,
  WalletConfiguration,
  Provider,
  GuardianClient,
  MagicTEESigner,
  TypedEventEmitter,
  announceProvider,
  passportProviderInfo,
} from '@imtbl/wallet';
import {
  PassportEvents,
  PassportEventMap,

  LinkedWallet,
  LinkWalletParams,
  PassportModuleConfiguration,
  ConnectEvmArguments,
  LoginArguments,
} from './types';
import { PassportImxProviderFactory } from './starkEx';
import { PassportConfiguration } from './config';
import logger from './utils/logger';
import { isAPIError, PassportError, PassportErrorType } from './errors/passportError';
import { withMetricsAsync } from './utils/metrics';

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
  const config = new PassportConfiguration(passportModuleConfiguration);
  const embeddedLoginPrompt = new EmbeddedLoginPrompt(config);
  const authManager = new AuthManager(config, embeddedLoginPrompt);
  // Create auth configuration for confirmation screen
  const authConfig = new AuthConfiguration({
    clientId: passportModuleConfiguration.clientId,
    redirectUri: passportModuleConfiguration.redirectUri,
    authenticationDomain: config.authenticationDomain,
    crossSdkBridgeEnabled: passportModuleConfiguration.crossSdkBridgeEnabled,
    popupOverlayOptions: passportModuleConfiguration.popupOverlayOptions,
    passportDomain: config.passportDomain,
  });

  const confirmationScreen = new ConfirmationScreen(authConfig);
  const magicTeeApiClients = new MagicTeeApiClients({
    basePath: config.magicTeeBasePath,
    timeout: config.magicTeeTimeout,
    magicPublishableApiKey: config.magicPublishableApiKey,
    magicProviderId: config.magicProviderId,
  });
  const magicTEESigner = new MagicTEESigner(authManager, magicTeeApiClients);
  const multiRollupApiClients = new MultiRollupApiClients(config.multiRollupConfig);

  // Create wallet configuration for zkEVM provider
  const walletConfig = new WalletConfiguration({
    baseConfig: passportModuleConfiguration.baseConfig,
    overrides: passportModuleConfiguration.overrides,
    jsonRpcReferrer: passportModuleConfiguration.jsonRpcReferrer,
    forceScwDeployBeforeMessageSignature: passportModuleConfiguration.forceScwDeployBeforeMessageSignature,
    crossSdkBridgeEnabled: passportModuleConfiguration.crossSdkBridgeEnabled,
  });
  const passportEventEmitter = new TypedEventEmitter<PassportEventMap>();

  const immutableXClient = passportModuleConfiguration.overrides
    ? passportModuleConfiguration.overrides.immutableXClient
    : new IMXClient({ baseConfig: passportModuleConfiguration.baseConfig });

  const guardianClient = new GuardianClient({
    confirmationScreen,
    config: walletConfig,
    authManager,
    guardianApi: multiRollupApiClients.guardianApi,
  });

  const imxApiClients = buildImxApiClients(passportModuleConfiguration);

  const passportImxProviderFactory = new PassportImxProviderFactory({
    authManager,
    immutableXClient,
    magicTEESigner,
    passportEventEmitter,
    imxApiClients,
    guardianClient,
  });

  return {
    config,
    authManager,
    authConfig,
    walletConfig,
    magicTEESigner,
    confirmationScreen,
    embeddedLoginPrompt,
    immutableXClient,
    multiRollupApiClients,
    passportEventEmitter,
    passportImxProviderFactory,
    guardianClient,
  };
};

export class Passport {
  private readonly authManager: AuthManager;

  private readonly walletConfig: WalletConfiguration;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly embeddedLoginPrompt: EmbeddedLoginPrompt;

  private readonly immutableXClient: IMXClient;

  private readonly magicTEESigner: MagicTEESigner;

  private readonly multiRollupApiClients: MultiRollupApiClients;

  private readonly passportImxProviderFactory: PassportImxProviderFactory;

  private readonly passportEventEmitter: TypedEventEmitter<PassportEventMap>;

  private readonly guardianClient: GuardianClient;

  constructor(passportModuleConfiguration: PassportModuleConfiguration) {
    const privateVars = buildPrivateVars(passportModuleConfiguration);

    this.walletConfig = privateVars.walletConfig;
    this.authManager = privateVars.authManager;
    this.magicTEESigner = privateVars.magicTEESigner;
    this.confirmationScreen = privateVars.confirmationScreen;
    this.embeddedLoginPrompt = privateVars.embeddedLoginPrompt;
    this.immutableXClient = privateVars.immutableXClient;
    this.multiRollupApiClients = privateVars.multiRollupApiClients;
    this.passportEventEmitter = privateVars.passportEventEmitter;
    this.passportImxProviderFactory = privateVars.passportImxProviderFactory;
    this.guardianClient = privateVars.guardianClient;

    setPassportClientId(passportModuleConfiguration.clientId);
    track('passport', 'initialise');
  }

  /**
   * Attempts to connect to IMX silently without user interaction.
   * @returns {Promise<IMXProvider | null>} A promise that resolves to an IMX provider if successful, or null if no cached session exists
   * @deprecated The method `login` with an argument of `{ useCachedSession: true }` should be used in conjunction with `connectImx` instead
   */
  public async connectImxSilent(): Promise<IMXProvider | null> {
    return withMetricsAsync(() => this.passportImxProviderFactory.getProviderSilent(), 'connectImxSilent', false);
  }

  /**
   * Connects to IMX, prompting user interaction if necessary.
   * @returns {Promise<IMXProvider>} A promise that resolves to an IMX provider
   */
  public async connectImx(): Promise<IMXProvider> {
    return withMetricsAsync(() => this.passportImxProviderFactory.getProvider(), 'connectImx', false);
  }

  /**
   * Connects to EVM and optionally announces the provider.
   * @param {Object} options - Configuration options
   * @param {boolean} options.announceProvider - Whether to announce the provider via EIP-6963 for wallet discovery (defaults to true)
   * @returns {Promise<Provider>} The EVM provider instance
   */
  public async connectEvm(options: ConnectEvmArguments = { announceProvider: true }): Promise<ZkEvmProvider> {
    return withMetricsAsync(async () => {
      let user: User | null = null;
      try {
        user = await this.authManager.getUser();
      } catch (error) {
        // Initialise the zkEvmProvider without a user
      }

      const provider = new ZkEvmProvider({
        passportEventEmitter: this.passportEventEmitter,
        authManager: this.authManager,
        config: this.walletConfig,
        multiRollupApiClients: this.multiRollupApiClients,
        guardianClient: this.guardianClient,
        ethSigner: this.magicTEESigner,
        user,
      });

      if (options?.announceProvider) {
        announceProvider({
          info: passportProviderInfo,
          provider: provider as unknown as Provider,
        });
      }

      return provider;
    }, 'connectEvm', false);
  }

  /**
   * Logs in the user.
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
    return withMetricsAsync(async () => {
      const { useCachedSession = false, useSilentLogin } = options || {};
      let user: User | null = null;
      try {
        user = await this.authManager.getUser();
      } catch (error: any) {
        if (error instanceof Error && !error.message.includes('Unknown or invalid refresh token')) {
          trackError('passport', 'login', error);
        }
        if (useCachedSession) {
          throw error;
        }
        logger.warn('Failed to retrieve a cached user session', error);
      }

      if (!user && useSilentLogin) {
        user = await this.authManager.forceUserRefresh();
      } else if (!user && !useCachedSession) {
        // Convert Passport's DirectLoginOptions to Auth's DirectLoginOptions format
        const authDirectLoginOptions = options?.directLoginOptions ? {
          directLoginMethod: options.directLoginOptions.directLoginMethod,
          email: options.directLoginOptions.email,
          marketingConsentStatus: options.directLoginOptions.marketingConsentStatus,
        } : undefined;

        if (options?.useRedirectFlow) {
          await this.authManager.loginWithRedirect(options?.anonymousId, authDirectLoginOptions);
        } else {
          user = await this.authManager.login(options?.anonymousId, authDirectLoginOptions);
        }
      }

      if (user) {
        identify({ passportId: user.profile.sub });
        this.passportEventEmitter.emit(PassportEvents.LOGGED_IN, user);
      }

      return user ? user.profile : null;
    }, 'login', false);
  }

  /**
   * Handles the login callback from the authentication service.
   * @returns {Promise<void>} A promise that resolves when the login callback is handled
   */
  public async loginCallback(): Promise<void> {
    await withMetricsAsync(() => this.authManager.loginCallback(), 'loginCallback', false).then((user) => {
      if (user) {
        identify({ passportId: user.profile.sub });
        this.passportEventEmitter.emit(PassportEvents.LOGGED_IN, user);
      }
    });
  }

  /**
   * Retrieves the PKCE authorization URL for the login flow.
   * @param {DirectLoginOptions} [directLoginOptions] - Optional direct login options
   * @param {string} [imPassportTraceId] - Optional trace ID
   * @returns {Promise<string>} A promise that resolves to the authorization URL
   */
  public async loginWithPKCEFlow(directLoginOptions?: DirectLoginOptions, imPassportTraceId?: string): Promise<string> {
    return withMetricsAsync(async () => await this.authManager.getPKCEAuthorizationUrl(directLoginOptions, imPassportTraceId), 'loginWithPKCEFlow', false);
  }

  /**
   * Handles the PKCE login callback.
   * @param {string} authorizationCode - The authorization code from the OAuth provider
   * @param {string} state - The state parameter for CSRF protection
   * @returns {Promise<UserProfile>} A promise that resolves to the user profile
   */
  public async loginWithPKCEFlowCallback(authorizationCode: string, state: string): Promise<UserProfile> {
    return withMetricsAsync(async () => {
      const user = await this.authManager.loginWithPKCEFlowCallback(authorizationCode, state);
      this.passportEventEmitter.emit(PassportEvents.LOGGED_IN, user);
      return user.profile;
    }, 'loginWithPKCEFlowCallback', false);
  }

  /**
   * Stores the provided tokens and retrieves the user profile.
   * @param {DeviceTokenResponse} tokenResponse - The token response from device flow
   * @returns {Promise<UserProfile>} A promise that resolves to the user profile
   */
  public async storeTokens(tokenResponse: DeviceTokenResponse): Promise<UserProfile> {
    return withMetricsAsync(async () => {
      const user = await this.authManager.storeTokens(tokenResponse);
      this.passportEventEmitter.emit(PassportEvents.LOGGED_IN, user);
      return user.profile;
    }, 'storeTokens', false);
  }

  /**
   * Logs out the user.
   * @returns {Promise<void>} A promise that resolves when the user is logged out
   */
  public async logout(): Promise<void> {
    return withMetricsAsync(async () => {
      await this.authManager.logout();
      this.passportEventEmitter.emit(PassportEvents.LOGGED_OUT);
    }, 'logout', false);
  }

  /**
   * Retrieves the logout URL.
   * @returns {Promise<string | undefined>} A promise that resolves to the logout URL, or undefined if not available
   */
  public async getLogoutUrl(): Promise<string | undefined> {
    return withMetricsAsync(async () => {
      await this.authManager.removeUser();
      this.passportEventEmitter.emit(PassportEvents.LOGGED_OUT);
      const url = await this.authManager.getLogoutUrl();
      return url || undefined;
    }, 'getLogoutUrl', false);
  }

  /**
   * Handles the silent logout callback.
   * @param {string} url - The URL containing the logout information
   * @returns {Promise<void>} A promise that resolves when the silent logout callback is handled
   */
  public async logoutSilentCallback(url: string): Promise<void> {
    return withMetricsAsync(() => this.authManager.logoutSilentCallback(url), 'logoutSilentCallback', false);
  }

  /**
   * Retrieves the current user's information.
   * @returns {Promise<UserProfile | undefined>} A promise that resolves to the user profile if logged in, undefined otherwise
   */
  public async getUserInfo(): Promise<UserProfile | undefined> {
    return withMetricsAsync(async () => {
      const user = await this.authManager.getUser();
      return user?.profile;
    }, 'getUserInfo', false);
  }

  /**
   * Retrieves the ID token.
   * @returns {Promise<string | undefined>} A promise that resolves to the ID token if available, undefined otherwise
   */
  public async getIdToken(): Promise<string | undefined> {
    return withMetricsAsync(async () => {
      const user = await this.authManager.getUser();
      return user?.idToken;
    }, 'getIdToken', false, false);
  }

  /**
   * Retrieves the access token.
   * @returns {Promise<string | undefined>} A promise that resolves to the access token if available, undefined otherwise
   */
  public async getAccessToken(): Promise<string | undefined> {
    return withMetricsAsync(async () => {
      const user = await this.authManager.getUser();
      return user?.accessToken;
    }, 'getAccessToken', false, false);
  }

  /**
   * Retrieves the addresses linked to the current user's account.
   * @returns {Promise<string[]>} A promise that resolves to an array of linked addresses
   */
  public async getLinkedAddresses(): Promise<string[]> {
    return withMetricsAsync(async () => {
      const user = await this.authManager.getUser();
      if (!user?.profile.sub) {
        return [];
      }

      const headers = {
        Authorization: `Bearer ${user.accessToken}`,
      };

      const { data } = await this.multiRollupApiClients.passportProfileApi.getUserInfo({ headers });
      return data.linked_addresses;
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
    const flowInit = trackFlow('passport', 'linkExternalWallet');

    const user = await this.authManager.getUser();
    if (!user) {
      throw new PassportError('User is not logged in', PassportErrorType.NOT_LOGGED_IN_ERROR);
    }

    const isImxUser = isUserImx(user);
    const isZkEvmUser = isUserZkEvm(user);

    if (!isImxUser && !isZkEvmUser) {
      throw new PassportError('User has not been registered', PassportErrorType.USER_NOT_REGISTERED_ERROR);
    }

    const headers = {
      Authorization: `Bearer ${user.accessToken}`,
    };

    const linkWalletV2Request = {
      type: params.type,
      wallet_address: params.walletAddress,
      signature: params.signature,
      nonce: params.nonce,
    };

    try {
      const linkWalletV2Result = await this.multiRollupApiClients
        .passportProfileApi.linkWalletV2({ linkWalletV2Request }, { headers });
      return { ...linkWalletV2Result.data };
    } catch (error) {
      if (error instanceof Error) {
        trackError('passport', 'linkExternalWallet', error);
      } else {
        flowInit.addEvent('errored');
      }

      if (isAxiosError(error) && error.response) {
        if (error.response.data && isAPIError(error.response.data)) {
          const { code, message } = error.response.data;

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
        } else if (error.response.status) {
          // Handle unexpected error with a generic error message
          throw new PassportError(
            `Link wallet request failed with status code ${error.response.status}`,
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
      flowInit.addEvent('End');
    }
  }
}
