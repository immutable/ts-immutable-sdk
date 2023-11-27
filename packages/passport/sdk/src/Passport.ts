import { IMXProvider } from '@imtbl/provider';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import { ChainName } from 'network/chains';
import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { PassportImxProviderFactory } from './starkEx';
import { PassportConfiguration } from './config';
import {
  DeviceConnectResponse,
  Networks,
  PassportEventMap,
  PassportEvents,
  PassportModuleConfiguration,
  UserProfile,
} from './types';
import { ConfirmationScreen } from './confirmation';
import { ZkEvmProvider } from './zkEvm';
import { Provider } from './zkEvm/types';
import TypedEventEmitter from './utils/typedEventEmitter';

export class Passport {
  private readonly authManager: AuthManager;

  private readonly config: PassportConfiguration;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly immutableXClient: ImmutableXClient;

  private readonly magicAdapter: MagicAdapter;

  private readonly multiRollupApiClients: MultiRollupApiClients;

  private readonly passportImxProviderFactory: PassportImxProviderFactory;

  private readonly passportEventEmitter: TypedEventEmitter<PassportEventMap>;

  constructor(passportModuleConfiguration: PassportModuleConfiguration) {
    this.config = new PassportConfiguration(passportModuleConfiguration);
    this.authManager = new AuthManager(this.config);
    this.magicAdapter = new MagicAdapter(this.config);
    this.confirmationScreen = new ConfirmationScreen(this.config);
    this.immutableXClient = passportModuleConfiguration.overrides?.immutableXClient
      || new ImmutableXClient({
        baseConfig: passportModuleConfiguration.baseConfig,
      });
    this.multiRollupApiClients = new MultiRollupApiClients(this.config.multiRollupConfig);
    this.passportEventEmitter = new TypedEventEmitter<PassportEventMap>();
    this.passportImxProviderFactory = new PassportImxProviderFactory({
      authManager: this.authManager,
      config: this.config,
      confirmationScreen: this.confirmationScreen,
      immutableXClient: this.immutableXClient,
      magicAdapter: this.magicAdapter,
      passportEventEmitter: this.passportEventEmitter,
    });
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

  public getPKCEAuthorizationUrl(): string {
    return this.authManager.getPKCEAuthorizationUrl();
  }

  public async connectImxPKCEFlow(authorizationCode: string, state: string): Promise<IMXProvider | null> {
    return this.passportImxProviderFactory.getProviderWithPKCEFlow(authorizationCode, state);
  }

  public connectEvm(): Provider {
    if (this.config.network === Networks.PRODUCTION) {
      throw new Error('EVM is not supported on production network');
    }

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
    useCachedSession: boolean
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

    return user ? user.profile : null;
  }

  public async loginWithDeviceFlow(): Promise<DeviceConnectResponse> {
    return this.authManager.loginWithDeviceFlow();
  }

  public async loginWithDeviceFlowCallback(
    deviceCode: string,
    interval: number,
    timeoutMs?: number,
  ): Promise<UserProfile> {
    const user = await this.authManager.loginWithDeviceFlowCallback(deviceCode, interval, timeoutMs);
    return user.profile;
  }

  public async loginCallback(): Promise<void> {
    return this.authManager.loginCallback();
  }

  public async logout(): Promise<void> {
    await this.confirmationScreen.logout();
    await this.authManager.logout();
    // Code after this point is only executed if the logout mode is silent
    await this.magicAdapter.logout();
    this.passportEventEmitter.emit(PassportEvents.LOGGED_OUT);
  }

  public async logoutDeviceFlow(): Promise<void> {
    await this.authManager.removeUser();
    await this.magicAdapter.logout();
    this.passportEventEmitter.emit(PassportEvents.LOGGED_OUT);
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
    const linkedAddressesResult = await this.multiRollupApiClients.passportApi.getLinkedAddresses({
      chainName: ChainName.ETHEREUM,
      userId: user?.profile.sub,
    }, { headers });
    return linkedAddressesResult.data.linked_addresses;
  }
}
