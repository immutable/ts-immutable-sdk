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
import MagicAdapter from './magicAdapter';
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
  const magicAdapter = new MagicAdapter(config);
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
   * @deprecated The method `login` with an argument of `{ useCachedSession: true }` should be used in conjunction with
   * `connectImx` instead.
   */
  public async connectImxSilent(): Promise<IMXProvider | null> {
    return withMetricsAsync(() => this.passportImxProviderFactory.getProviderSilent(), 'connectImxSilent');
  }

  public async connectImx(): Promise<IMXProvider> {
    return withMetricsAsync(() => this.passportImxProviderFactory.getProvider(), 'connectImx');
  }

  public connectEvm(options: {
    announceProvider: boolean
  } = {
    announceProvider: true,
  }): Promise<Provider> {
    return withMetricsAsync(async () => {
      const provider = new ZkEvmProvider({
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
    }, 'connectEvm');
  }

  /**
   *
   * Initiates the authorisation flow.
   *
   * @param options.useCachedSession = false - If true, and no active session exists, then the user will not be
   * prompted to log in and the Promise will resolve with a null value.
   * @param options.anonymousId - If provided, Passport internal metrics will be enriched with this value.
   * @param options.useSilentLogin - If true, and no active session exists, then the user will not be prompted to log in. Instead, we will attempt to authenticate the user silently. This approach will fail if the user does not have an active session with the authentication server, or if user input is required (for example, consent is required).
   * @returns {Promise<UserProfile | null>} the user profile if the user is logged in, otherwise null
   */
  public async login(options?: {
    useCachedSession?: boolean;
    anonymousId?: string;
    useSilentLogin?: boolean;
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
        user = await this.authManager.login(options?.anonymousId);
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

  public async loginCallback(): Promise<void> {
    return withMetricsAsync(() => this.authManager.loginCallback(), 'loginCallback');
  }

  public async loginWithDeviceFlow(options?: {
    anonymousId?: string;
  }): Promise<DeviceConnectResponse> {
    return withMetricsAsync(() => this.authManager.loginWithDeviceFlow(options?.anonymousId), 'loginWithDeviceFlow');
  }

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

  public loginWithPKCEFlow(): Promise<string> {
    return withMetricsAsync(async () => await this.authManager.getPKCEAuthorizationUrl(), 'loginWithPKCEFlow');
  }

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
   * This method should only be called from the logout redirect uri
   * when logout mode is 'silent'.
   */
  public async logoutSilentCallback(url: string): Promise<void> {
    return withMetricsAsync(() => this.authManager.logoutSilentCallback(url), 'logoutSilentCallback');
  }

  public async getUserInfo(): Promise<UserProfile | undefined> {
    return withMetricsAsync(async () => {
      const user = await this.authManager.getUser();
      return user?.profile;
    }, 'getUserInfo');
  }

  public async getIdToken(): Promise<string | undefined> {
    return withMetricsAsync(async () => {
      const user = await this.authManager.getUser();
      return user?.idToken;
    }, 'getIdToken');
  }

  public async getAccessToken(): Promise<string | undefined> {
    return withMetricsAsync(async () => {
      const user = await this.authManager.getUser();
      return user?.accessToken;
    }, 'getAccessToken');
  }

  public async getLinkedAddresses(): Promise<string[]> {
    return withMetricsAsync(async () => {
      const user = await this.authManager.getUser();
      if (!user?.profile.sub) {
        return [];
      }
      const headers = { Authorization: `Bearer ${user.accessToken}` };
      const getUserInfoResult = await this.multiRollupApiClients.passportProfileApi.getUserInfo({ headers });
      return getUserInfoResult.data.linked_addresses;
    }, 'getLinkedAddresses');
  }

  public async linkExternalWallet(params: LinkWalletParams): Promise<LinkedWallet> {
    const flow = trackFlow('passport', 'linkExternalWallet');

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
      }
      flow.addEvent('errored');

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
