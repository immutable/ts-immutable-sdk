import { IMXProvider } from '@imtbl/x-provider';
import {
  createConfig, ImxApiClients, imxApiConfig, MultiRollupApiClients,
} from '@imtbl/generated-clients';
import { IMXClient } from '@imtbl/x-client';
import { Environment } from '@imtbl/config';

import {
  identify, setPassportClientId, track, trackError,
  trackFlow,
} from '@imtbl/metrics';
import { isAxiosError } from 'axios';
import AuthManager from './authManager';
import MagicAdapter from './magic/magicAdapter';
import { PassportImxProviderFactory } from './starkEx';
import { PassportConfiguration } from './config';
import {
  DeviceConnectResponse,
  isUserImx,
  isUserZkEvm,
  LinkedWallet,
  LinkWalletParams,
  PassportEventMap,
  PassportEvents,
  PassportModuleConfiguration,
  User,
  UserProfile,
} from './types';
import { ConfirmationScreen } from './confirmation';
import { ZkEvmProvider } from './zkEvm';
import { Provider } from './zkEvm/types';
import TypedEventEmitter from './utils/typedEventEmitter';
import GuardianClient from './guardian';
import logger from './utils/logger';
import { announceProvider, passportProviderInfo } from './zkEvm/provider/eip6963';
import { isAPIError, PassportError, PassportErrorType } from './errors/passportError';
import { withMetricsAsync } from './utils/metrics';
import { MagicProviderProxyFactory } from './magic/magicProviderProxyFactory';

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
  const authManager = new AuthManager(config);
  const magicProviderProxyFactory = new MagicProviderProxyFactory(authManager, config);
  const magicAdapter = new MagicAdapter(config, magicProviderProxyFactory);
  const confirmationScreen = new ConfirmationScreen(config);
  const multiRollupApiClients = new MultiRollupApiClients(config.multiRollupConfig);
  const passportEventEmitter = new TypedEventEmitter<PassportEventMap>();

  const immutableXClient = passportModuleConfiguration.overrides
    ? passportModuleConfiguration.overrides.immutableXClient
    : new IMXClient({ baseConfig: passportModuleConfiguration.baseConfig });

  const guardianClient = new GuardianClient({
    confirmationScreen,
    config,
    authManager,
    guardianApi: multiRollupApiClients.guardianApi,
  });

  const imxApiClients = buildImxApiClients(passportModuleConfiguration);

  const passportImxProviderFactory = new PassportImxProviderFactory({
    authManager,
    immutableXClient,
    magicAdapter,
    passportEventEmitter,
    imxApiClients,
    guardianClient,
  });

  return {
    config,
    authManager,
    magicAdapter,
    confirmationScreen,
    immutableXClient,
    multiRollupApiClients,
    passportEventEmitter,
    passportImxProviderFactory,
    guardianClient,
  };
};

export class Passport {
  private readonly authManager: AuthManager;

  private readonly config: PassportConfiguration;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly immutableXClient: IMXClient;

  private readonly magicAdapter: MagicAdapter;

  private readonly multiRollupApiClients: MultiRollupApiClients;

  private readonly passportImxProviderFactory: PassportImxProviderFactory;

  private readonly passportEventEmitter: TypedEventEmitter<PassportEventMap>;

  private readonly guardianClient: GuardianClient;

  constructor(passportModuleConfiguration: PassportModuleConfiguration) {
    const privateVars = buildPrivateVars(passportModuleConfiguration);

    this.config = privateVars.config;
    this.authManager = privateVars.authManager;
    this.magicAdapter = privateVars.magicAdapter;
    this.confirmationScreen = privateVars.confirmationScreen;
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

  private zkEvmProvider: ZkEvmProvider;

  /**
   * Connects to EVM and optionally announces the provider.
   * @param {Object} options - Configuration options
   * @param {boolean} options.announceProvider - Whether to announce the provider via EIP-6963 for wallet discovery (defaults to true)
   * @returns {Provider} The EVM provider instance
   */
  public connectEvm(options: {
    announceProvider: boolean
  } = {
    announceProvider: true,
  }): Promise<Provider> {
    return withMetricsAsync(async () => {
      if (this.zkEvmProvider) return this.zkEvmProvider;
      this.zkEvmProvider = new ZkEvmProvider({
        passportEventEmitter: this.passportEventEmitter,
        authManager: this.authManager,
        magicAdapter: this.magicAdapter,
        config: this.config,
        multiRollupApiClients: this.multiRollupApiClients,
        guardianClient: this.guardianClient,
      });

      if (options?.announceProvider) {
        announceProvider({
          info: passportProviderInfo,
          provider,
        });
      }

      return provider;
    }, 'connectEvm', false);
  }

  /**
   * Initiates the login process.
   * @param {Object} options - Login options
   * @param {boolean} [options.useCachedSession] - If true, and no active session exists, the user won't be prompted to log in
   * @param {string} [options.anonymousId] - ID used to enrich Passport internal metrics
   * @param {boolean} [options.useSilentLogin] - If true, attempts silent authentication without user interaction.
   *                                            Note: This takes precedence over useCachedSession if both are true
   * @returns {Promise<UserProfile | null>} A promise that resolves to the user profile if logged in, null otherwise
   * @throws {Error} If retrieving the cached user session fails (except for "Unknown or invalid refresh token" errors)
   *                and useCachedSession is true
   */
  public async login(options?: {
    useCachedSession?: boolean;
    anonymousId?: string;
    useSilentLogin?: boolean;
    useRedirectFlow?: boolean;
  }): Promise<UserProfile | null> {
    return withMetricsAsync(async () => {
      const { useCachedSession = false, useSilentLogin } = options || {};
      let user: User | null = null;

      try {
        user = await this.authManager.getUser();
      } catch (error) {
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
        if (options?.useRedirectFlow) {
          await this.authManager.loginWithRedirect(options?.anonymousId);
        } else {
          user = await this.authManager.login(options?.anonymousId);
        }
      }

      if (user) {
        identify({
          passportId: user.profile.sub,
        });
        this.passportEventEmitter.emit(PassportEvents.LOGGED_IN, user);
      }

      return user ? user.profile : null;
    }, 'login');
  }

  /**
   * Handles the login callback.
   * @returns {Promise<void>} A promise that resolves when the callback is processed
   */
  public async loginCallback(): Promise<void> {
    await withMetricsAsync(() => this.authManager.loginCallback(), 'loginCallback')
      .then((user) => {
        if (user) {
          identify({
            passportId: user.profile.sub,
          });
          this.passportEventEmitter.emit(PassportEvents.LOGGED_IN, user);
        }
      });
  }

  /**
   * Initiates a device flow login.
   * @param {Object} options - Login options
   * @param {string} [options.anonymousId] - ID used to enrich Passport internal metrics
   * @returns {Promise<DeviceConnectResponse>} A promise that resolves to the device connection response
   */
  public async loginWithDeviceFlow(options?: {
    anonymousId?: string;
  }): Promise<DeviceConnectResponse> {
    return withMetricsAsync(() => this.authManager.loginWithDeviceFlow(options?.anonymousId), 'loginWithDeviceFlow');
  }

  /**
   * Handles the device flow login callback.
   * @param {string} deviceCode - The device code received from the initial request
   * @param {number} interval - Polling interval in seconds
   * @param {number} [timeoutMs] - Optional timeout in milliseconds
   * @returns {Promise<UserProfile>} A promise that resolves to the user profile
   */
  public async loginWithDeviceFlowCallback(
    deviceCode: string,
    interval: number,
    timeoutMs?: number,
  ): Promise<UserProfile> {
    return withMetricsAsync(async () => {
      const user = await this.authManager.loginWithDeviceFlowCallback(
        deviceCode,
        interval,
        timeoutMs,
      );
      this.passportEventEmitter.emit(PassportEvents.LOGGED_IN, user);
      return user.profile;
    }, 'loginWithDeviceFlowCallback');
  }

  /**
   * Initiates a PKCE flow login.
   * @returns {string} The authorization URL for the PKCE flow
   */
  public loginWithPKCEFlow(): Promise<string> {
    return withMetricsAsync(async () => await this.authManager.getPKCEAuthorizationUrl(), 'loginWithPKCEFlow');
  }

  /**
   * Handles the PKCE flow login callback.
   * @param {string} authorizationCode - The authorization code received from the OAuth provider
   * @param {string} state - The state parameter for CSRF protection
   * @returns {Promise<UserProfile>} A promise that resolves to the user profile
   */
  public async loginWithPKCEFlowCallback(
    authorizationCode: string,
    state: string,
  ): Promise<UserProfile> {
    return withMetricsAsync(async () => {
      const user = await this.authManager.loginWithPKCEFlowCallback(
        authorizationCode,
        state,
      );
      this.passportEventEmitter.emit(PassportEvents.LOGGED_IN, user);
      return user.profile;
    }, 'loginWithPKCEFlowCallback');
  }

  /**
   * Logs out the current user.
   * @returns {Promise<void>} A promise that resolves when the logout is complete
   */
  public async logout(): Promise<void> {
    return withMetricsAsync(async () => {
      if (this.config.oidcConfiguration.logoutMode === 'silent') {
        await Promise.allSettled([
          this.authManager.logout(),
          this.magicAdapter.logout(),
        ]);
      } else {
        // We need to ensure that the Magic wallet is logged out BEFORE redirecting
        await this.magicAdapter.logout();
        await this.authManager.logout();
      }
      this.passportEventEmitter.emit(PassportEvents.LOGGED_OUT);
    }, 'logout');
  }

  /**
     * Logs the user out of Passport when using device flow authentication.
     *
     * @returns {Promise<string>} The device flow end session endpoint. Consumers are responsible for
     * opening this URL in the same browser that was used to log the user in.
     */
  public async logoutDeviceFlow(): Promise<string> {
    return withMetricsAsync(async () => {
      await this.authManager.removeUser();
      await this.magicAdapter.logout();
      this.passportEventEmitter.emit(PassportEvents.LOGGED_OUT);
      return await this.authManager.getDeviceFlowEndSessionEndpoint();
    }, 'logoutDeviceFlow');
  }

  /**
   * Handles the silent logout callback.
   * @param {string} url - The callback URL to process
   * @returns {Promise<void>} A promise that resolves when the silent logout is complete
   */
  public async logoutSilentCallback(url: string): Promise<void> {
    return withMetricsAsync(() => this.authManager.logoutSilentCallback(url), 'logoutSilentCallback');
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
   * Retrieves the current user's ID token.
   * @returns {Promise<string | undefined>} A promise that resolves to the ID token if available, undefined otherwise
   */
  public async getIdToken(): Promise<string | undefined> {
    return withMetricsAsync(async () => {
      const user = await this.authManager.getUser();
      return user?.idToken;
    }, 'getIdToken', false);
  }

  /**
   * Retrieves the current user's access token.
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
      const headers = { Authorization: `Bearer ${user.accessToken}` };
      const getUserInfoResult = await this.multiRollupApiClients.passportProfileApi.getUserInfo({ headers });
      return getUserInfoResult.data.linked_addresses;
    }, 'getLinkedAddresses', false);
  }

  /**
   * Links an external wallet to the current user's account.
   * @param {LinkWalletParams} params - Parameters for linking the wallet
   * @returns {Promise<LinkedWallet>} A promise that resolves to the linked wallet information
   * @throws {PassportError} When:
   *  - User is not logged in (NOT_LOGGED_IN_ERROR)
   *  - User is not registered (USER_NOT_REGISTERED_ERROR)
   *  - Wallet is already linked (LINK_WALLET_ALREADY_LINKED_ERROR)
   *  - Maximum number of wallets reached (LINK_WALLET_MAX_WALLETS_LINKED_ERROR)
   *  - Duplicate nonce used (LINK_WALLET_DUPLICATE_NONCE_ERROR)
   *  - Validation fails (LINK_WALLET_VALIDATION_ERROR)
   *  - Other generic errors (LINK_WALLET_GENERIC_ERROR)
   */
  public async linkExternalWallet(params: LinkWalletParams): Promise<LinkedWallet> {
    const flow = trackFlow('passport', 'linkExternalWallet', false);

    const user = await this.authManager.getUser();
    if (!user) {
      throw new PassportError('User is not logged in', PassportErrorType.NOT_LOGGED_IN_ERROR);
    }

    const isRegisteredWithIMX = isUserImx(user);
    const isRegisteredWithZkEvm = isUserZkEvm(user);
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

    try {
      const linkWalletV2Result = await this.multiRollupApiClients
        .passportProfileApi.linkWalletV2({ linkWalletV2Request }, { headers });
      return { ...linkWalletV2Result.data };
    } catch (error) {
      if (error instanceof Error) {
        trackError('passport', 'linkExternalWallet', error);
      } else {
        flow.addEvent('errored');
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
      flow.addEvent('End');
    }
  }
}
