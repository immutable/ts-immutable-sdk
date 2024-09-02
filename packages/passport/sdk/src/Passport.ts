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
    const flow = trackFlow('passport', 'connectImxSilent');
    flow.addEvent('startConnectImxSilent');
    try {
      const provider = await this.passportImxProviderFactory.getProviderSilent();
      flow.addEvent('endConnectImxSilent');
      return provider;
    } catch (error) {
      trackError('passport', 'connectImxSilent', error as Error);
      throw error;
    }
  }

  public async connectImx(): Promise<IMXProvider> {
    const flow = trackFlow('passport', 'connectImx');
    flow.addEvent('startConnectImx');
    try {
      const provider = await this.passportImxProviderFactory.getProvider();
      flow.addEvent('endConnectImx');
      return provider;
    } catch (error) {
      trackError('passport', 'connectImx', error as Error);
      throw error;
    }
  }

  public connectEvm(options: {
    announceProvider: boolean
  } = {
    announceProvider: true,
  }): Provider {
    const flow = trackFlow('passport', 'connectEvm');

    flow.addEvent('startConnectEvm');
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

    flow.addEvent('endConnectEvm');
    return provider;
  }

  /**
   *
   * Initiates the authorisation flow.
   *
   * @param options.useCachedSession = false - If true, and no active session exists, then the user will not be
   * prompted to log in and the Promise will resolve with a null value.
   * @param options.anonymousId - If provided, Passport internal metrics will be enriched with this value.
   * @returns {Promise<UserProfile | null>} the user profile if the user is logged in, otherwise null
   */
  public async login(options?: {
    useCachedSession: boolean;
    anonymousId?: string;
  }): Promise<UserProfile | null> {
    const flow = trackFlow('passport', 'login');

    flow.addEvent('startLogin');
    const { useCachedSession = false } = options || {};
    let user: User | null = null;
    try {
      user = await this.authManager.getUser();
    } catch (error) {
      trackError('passport', 'login', error as Error);
      if (useCachedSession) {
        throw error;
      }
      logger.warn('Failed to retrieve a cached user session', error);
    }
    if (!user && !useCachedSession) {
      user = await this.authManager.login(options?.anonymousId);
    }

    if (user) {
      identify({
        passportId: user.profile.sub,
      });
      this.passportEventEmitter.emit(PassportEvents.LOGGED_IN, user);
    }

    flow.addEvent('endLogin');
    return user ? user.profile : null;
  }

  public async loginCallback(): Promise<void> {
    const flow = trackFlow('passport', 'loginWithDeviceFlow');
    flow.addEvent('startLoginCallback');

    try {
      const login = await this.authManager.loginCallback();
      flow.addEvent('endLoginCallback');
      return login;
    } catch (error) {
      trackError('passport', 'loginCallback', error as Error);
      throw error;
    }
  }

  public async loginWithDeviceFlow(options?: {
    anonymousId?: string;
  }): Promise<DeviceConnectResponse> {
    const flow = trackFlow('passport', 'loginWithDeviceFlow');
    flow.addEvent('startLoginWithDeviceFlow');
    try {
      const response = await this.authManager.loginWithDeviceFlow(options?.anonymousId);
      flow.addEvent('endLoginWithDeviceFlow');
      return response;
    } catch (error) {
      trackError('passport', 'loginWithDeviceFlow', error as Error);
      throw error;
    }
  }

  public async loginWithDeviceFlowCallback(
    deviceCode: string,
    interval: number,
    timeoutMs?: number,
  ): Promise<UserProfile> {
    const flow = trackFlow('passport', 'loginWithDeviceFlowCallback');
    flow.addEvent('startLoginWithDeviceFlowCallback');

    try {
      const user = await this.authManager.loginWithDeviceFlowCallback(
        deviceCode,
        interval,
        timeoutMs,
      );
      this.passportEventEmitter.emit(PassportEvents.LOGGED_IN, user);
      flow.addEvent('endLoginWithDeviceFlowCallback');
      return user.profile;
    } catch (error) {
      trackError('passport', 'loginWithDeviceFlowCallback', error as Error);
      throw error;
    }
  }

  public loginWithPKCEFlow(): string {
    const flow = trackFlow('passport', 'loginWithPKCEFlow');
    flow.addEvent('startLoginWithPKCEFlow');
    const url = this.authManager.getPKCEAuthorizationUrl();
    flow.addEvent('endLoginWithPKCEFlow');
    return url;
  }

  public async loginWithPKCEFlowCallback(
    authorizationCode: string,
    state: string,
  ): Promise<UserProfile> {
    const flow = trackFlow('passport', 'loginWithPKCEFlowCallback');
    flow.addEvent('startLoginWithPKCEFlowCallback');

    try {
      const user = await this.authManager.loginWithPKCEFlowCallback(
        authorizationCode,
        state,
      );
      this.passportEventEmitter.emit(PassportEvents.LOGGED_IN, user);
      flow.addEvent('endLoginWithPKCEFlowCallback');
      return user.profile;
    } catch (error) {
      trackError('passport', 'loginWithPKCEFlowCallback', error as Error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    const flow = trackFlow('passport', 'logout');
    flow.addEvent('startLogout');

    try {
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
      flow.addEvent('endLogout');
      this.passportEventEmitter.emit(PassportEvents.LOGGED_OUT);
    } catch (error) {
      trackError('passport', 'logout', error as Error);
      throw error;
    }
  }

  /**
   * Logs the user out of Passport when using device flow authentication.
   *
   * @returns {Promise<string>} The device flow end session endpoint. Consumers are responsible for
   * opening this URL in the same browser that was used to log the user in.
   */
  public async logoutDeviceFlow(): Promise<string> {
    const flow = trackFlow('passport', 'logoutDeviceFlow');
    flow.addEvent('startLogoutDeviceFlow');

    try {
      flow.addEvent('startLogout');
      await this.authManager.removeUser();
      await this.magicAdapter.logout();
      this.passportEventEmitter.emit(PassportEvents.LOGGED_OUT);
      flow.addEvent('endLogout');

      flow.addEvent('startGetSessionEndpoint');
      const endpoint = await this.authManager.getDeviceFlowEndSessionEndpoint();
      flow.addEvent('endGetSessionEndpoint');

      flow.addEvent('endLogoutDeviceFlow');
      return endpoint;
    } catch (error) {
      trackError('passport', 'logoutDeviceFlow', error as Error);
      throw error;
    }
  }

  /**
   * This method should only be called from the logout redirect uri
   * when logout mode is 'silent'.
   */
  public async logoutSilentCallback(url: string): Promise<void> {
    const flow = trackFlow('passport', 'logoutSilentCallback');
    flow.addEvent('startLogoutSilentCallback');

    try {
      const logout = await this.authManager.logoutSilentCallback(url);
      flow.addEvent('endLogoutSilentCallback');
      return logout;
    } catch (error) {
      trackError('passport', 'logoutSilentCallback', error as Error);
      throw error;
    }
  }

  public async getUserInfo(): Promise<UserProfile | undefined> {
    const flow = trackFlow('passport', 'getUserInfo');
    flow.addEvent('startGetUserInfo');

    try {
      const user = await this.authManager.getUser();
      flow.addEvent('endGetUserInfo');
      return user?.profile;
    } catch (error) {
      trackError('passport', 'getUserInfo', error as Error);
      throw error;
    }
  }

  public async getIdToken(): Promise<string | undefined> {
    const flow = trackFlow('passport', 'getIdToken');
    flow.addEvent('startGetIdToken');

    try {
      const user = await this.authManager.getUser();
      flow.addEvent('endGetIdToken');
      return user?.idToken;
    } catch (error) {
      trackError('passport', 'getIdToken', error as Error);
      throw error;
    }
  }

  public async getAccessToken(): Promise<string | undefined> {
    const flow = trackFlow('passport', 'getAccessToken');
    flow.addEvent('startGetAccessToken');

    try {
      const user = await this.authManager.getUser();
      flow.addEvent('endGetAccessToken');
      return user?.accessToken;
    } catch (error) {
      trackError('passport', 'getAccessToken', error as Error);
      throw error;
    }
  }

  public async getLinkedAddresses(): Promise<string[]> {
    const flow = trackFlow('passport', 'getLinkedAddresses');
    flow.addEvent('startGetLinkedAddresses');

    try {
      const user = await this.authManager.getUser();
      if (!user?.profile.sub) {
        flow.addEvent('endGetLinkedAddressesNoUser');
        return [];
      }
      const headers = { Authorization: `Bearer ${user.accessToken}` };
      const getUserInfoResult = await this.multiRollupApiClients.passportProfileApi.getUserInfo({ headers });
      flow.addEvent('endGetLinkedAddresses');
      return getUserInfoResult.data.linked_addresses;
    } catch (error) {
      trackError('passport', 'getLinkedAddresses', error as Error);
      throw error;
    }
  }

  public async linkExternalWallet(params: LinkWalletParams): Promise<LinkedWallet> {
    const flow = trackFlow('passport', 'linkExternalWallet');
    flow.addEvent('startLinkExternalWallet', { type: params.type });

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
      flow.addEvent('endLinkExternalWallet', { type: params.type });
      return { ...linkWalletV2Result.data };
    } catch (error) {
      trackError('passport', 'linkExternalWallet', error as Error);

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
    }
  }
}
