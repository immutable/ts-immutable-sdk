import { IMXProvider } from '@imtbl/x-provider';
import {
  createConfig,
  ImxApiClients,
  imxApiConfig,
  MultiRollupApiClients,
} from '@imtbl/generated-clients';
import { IMXClient } from '@imtbl/x-client';
import { ChainName } from 'network/chains';
import { Environment } from '@imtbl/config';

import { setPassportClientId, identify, track } from '@imtbl/metrics';

import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { PassportImxProviderFactory } from './starkEx';
import { PassportConfiguration } from './config';
import {
  DeviceConnectResponse,
  PassportEventMap,
  PassportEvents,
  PassportModuleConfiguration,
  PassportOverrides,
  UserProfile,
} from './types';
import { ConfirmationScreen } from './confirmation';
import { ZkEvmProvider } from './zkEvm';
import { Provider } from './zkEvm/types';
import TypedEventEmitter from './utils/typedEventEmitter';

const buildImxClientConfig = (environment: Environment, overrides: PassportOverrides | undefined) => {
  if (overrides) return createConfig({ basePath: overrides.imxPublicApiDomain });
  if (environment === Environment.SANDBOX) return imxApiConfig.getSandbox();
  return imxApiConfig.getProduction();
};

export const buildPrivateVars = (passportModuleConfiguration: PassportModuleConfiguration) => {
  const config = new PassportConfiguration(passportModuleConfiguration);
  const imxClientConfig = buildImxClientConfig(config.baseConfig.environment, passportModuleConfiguration.overrides);
  const authManager = new AuthManager(config);
  const magicAdapter = new MagicAdapter(config);
  const confirmationScreen = new ConfirmationScreen(config);
  const passportEventEmitter = new TypedEventEmitter<PassportEventMap>();

  const immutableXClient = passportModuleConfiguration.overrides
    ? passportModuleConfiguration.overrides.immutableXClient
    : new IMXClient({ baseConfig: passportModuleConfiguration.baseConfig });

  const imxApiClients = passportModuleConfiguration.overrides?.imxApiClients ?? new ImxApiClients(imxClientConfig);

  return {
    config: new PassportConfiguration(passportModuleConfiguration),
    authManager: new AuthManager(config),
    magicAdapter: new MagicAdapter(config),
    confirmationScreen: new ConfirmationScreen(config),
    immutableXClient,
    multiRollupApiClients: new MultiRollupApiClients(config.multiRollupConfig),
    passportEventEmitter,
    passportImxProviderFactory: new PassportImxProviderFactory({
      authManager,
      config,
      confirmationScreen,
      immutableXClient,
      magicAdapter,
      passportEventEmitter,
      imxApiClients,
    }),
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

    setPassportClientId(passportModuleConfiguration.clientId);
    track('passport', 'initialised');
  }

  /**
   * @deprecated The method `login` with an argument of `{ useCachedSession: true }` should be used in conjunction with
   * `connectImx` instead.
   */
  public async connectImxSilent(): Promise<IMXProvider | null> {
    return this.passportImxProviderFactory.getProviderSilent();
  }

  public async connectImx(): Promise<IMXProvider> {
    return this.passportImxProviderFactory.getProvider();
  }

  public connectEvm(): Provider {
    return new ZkEvmProvider({
      passportEventEmitter: this.passportEventEmitter,
      authManager: this.authManager,
      magicAdapter: this.magicAdapter,
      config: this.config,
      confirmationScreen: this.confirmationScreen,
      multiRollupApiClients: this.multiRollupApiClients,
    });
  }

  /**
   *
   * Initiates the authorisation flow.
   *
   * @param options.useCachedSession = false - If true, and no active session exists, then the user will not be
   * prompted to log in and the Promise will resolve with a null value.
   * @returns {Promise<UserProfile | null>} the user profile if the user is logged in, otherwise null
   */
  public async login(options?: {
    useCachedSession: boolean;
  }): Promise<UserProfile | null> {
    const { useCachedSession = false } = options || {};
    let user = null;
    try {
      user = await this.authManager.getUser();
    } catch (error) {
      if (useCachedSession) {
        throw error;
      }
      // eslint-disable-next-line no-console
      console.warn('login failed to retrieve a cached user session', error);
    }
    if (!user && !useCachedSession) {
      user = await this.authManager.login();
    }

    if (user) {
      identify({
        passportId: user.profile.sub,
      });
    }

    return user ? user.profile : null;
  }

  public async loginCallback(): Promise<void> {
    return this.authManager.loginCallback();
  }

  public async loginWithDeviceFlow(): Promise<DeviceConnectResponse> {
    return this.authManager.loginWithDeviceFlow();
  }

  public async loginWithDeviceFlowCallback(
    deviceCode: string,
    interval: number,
    timeoutMs?: number,
  ): Promise<UserProfile> {
    const user = await this.authManager.loginWithDeviceFlowCallback(
      deviceCode,
      interval,
      timeoutMs,
    );
    return user.profile;
  }

  public loginWithPKCEFlow(): string {
    return this.authManager.getPKCEAuthorizationUrl();
  }

  public async loginWithPKCEFlowCallback(
    authorizationCode: string,
    state: string,
  ): Promise<UserProfile> {
    const user = await this.authManager.loginWithPKCEFlowCallback(
      authorizationCode,
      state,
    );
    return user.profile;
  }

  public async logout(): Promise<void> {
    try {
      await this.confirmationScreen.logout();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to logout from confirmation screen', err);
    }
    await Promise.allSettled([
      this.authManager.logout(),
      this.magicAdapter.logout(),
    ]);
    this.passportEventEmitter.emit(PassportEvents.LOGGED_OUT);
  }

  /**
   * Logs the user out of Passport when using device flow authentication.
   *
   * @returns {Promise<string>} The device flow end session endpoint. Consumers are responsible for
   * opening this URL in the same browser that was used to log the user in.
   */
  public async logoutDeviceFlow(): Promise<string> {
    await this.authManager.removeUser();
    await this.magicAdapter.logout();
    this.passportEventEmitter.emit(PassportEvents.LOGGED_OUT);

    return this.authManager.getDeviceFlowEndSessionEndpoint();
  }

  /**
   * This method should only be called from the logout redirect uri
   * when logout mode is 'silent'.
   */
  public async logoutSilentCallback(url: string): Promise<void> {
    return this.authManager.logoutSilentCallback(url);
  }

  public async getUserInfo(): Promise<UserProfile | undefined> {
    const user = await this.authManager.getUser();
    return user?.profile;
  }

  public async getIdToken(): Promise<string | undefined> {
    const user = await this.authManager.getUser();
    return user?.idToken;
  }

  public async getAccessToken(): Promise<string | undefined> {
    const user = await this.authManager.getUser();
    return user?.accessToken;
  }

  public async getLinkedAddresses(): Promise<string[]> {
    const user = await this.authManager.getUser();
    if (!user?.profile.sub) {
      return [];
    }
    const headers = { Authorization: `Bearer ${user.accessToken}` };
    const linkedAddressesResult = await this.multiRollupApiClients.passportApi.getLinkedAddresses(
      {
        chainName: ChainName.ETHEREUM,
        userId: user?.profile.sub,
      },
      { headers },
    );
    return linkedAddressesResult.data.linked_addresses;
  }
}
