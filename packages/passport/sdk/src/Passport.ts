import { IMXProvider } from '@imtbl/provider';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { PassportImxProviderFactory } from './starkEx';
import { PassportConfiguration } from './config';
import {
  DeviceConnectResponse, DeviceTokenResponse, Networks, PassportModuleConfiguration, UserProfile,
} from './types';
import { ConfirmationScreen } from './confirmation';
import { ZkEvmProvider } from './zkEvm';
import { Provider } from './zkEvm/types';

export class Passport {
  private readonly authManager: AuthManager;

  private readonly config: PassportConfiguration;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly immutableXClient: ImmutableXClient;

  private readonly magicAdapter: MagicAdapter;

  private readonly passportImxProviderFactory: PassportImxProviderFactory;

  private readonly multiRollupApiClients: MultiRollupApiClients;

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
    this.passportImxProviderFactory = new PassportImxProviderFactory({
      authManager: this.authManager,
      config: this.config,
      confirmationScreen: this.confirmationScreen,
      immutableXClient: this.immutableXClient,
      magicAdapter: this.magicAdapter,
    });
  }

  public async connectImxSilent(): Promise<IMXProvider | null> {
    return this.passportImxProviderFactory.getProviderSilent();
  }

  public async connectImx(): Promise<IMXProvider> {
    return this.passportImxProviderFactory.getProvider();
  }

  public async loginWithDeviceFlow(): Promise<DeviceConnectResponse> {
    return this.authManager.loginWithDeviceFlow();
  }

  public async connectImxDeviceFlow(
    deviceCode: string,
    interval: number,
    timeoutMs?: number,
  ): Promise<IMXProvider | null> {
    return this.passportImxProviderFactory.getProviderWithDeviceFlow(deviceCode, interval, timeoutMs);
  }

  getPKCEAuthorizationUrl(): string {
    return this.authManager.getPKCEAuthorizationUrl();
  }

  public async connectImxPKCEFlow(authorizationCode: string, state: string): Promise<IMXProvider | null> {
    return this.passportImxProviderFactory.getProviderWithPKCEFlow(authorizationCode, state);
  }

  /**
   * @returns {boolean} the stored device flow credentials if they exist
   */
  public checkStoredDeviceFlowCredentials(): DeviceTokenResponse | null {
    return this.authManager.checkStoredDeviceFlowCredentials();
  }

  public async connectImxWithCredentials(tokenResponse: DeviceTokenResponse): Promise<IMXProvider | null> {
    return this.passportImxProviderFactory.getProviderWithCredentials(tokenResponse);
  }

  public connectEvm(): Provider {
    if (this.config.network === Networks.PRODUCTION) {
      throw new Error('EVM is not supported on production network');
    }

    return new ZkEvmProvider({
      authManager: this.authManager,
      magicAdapter: this.magicAdapter,
      config: this.config,
      confirmationScreen: this.confirmationScreen,
      multiRollupApiClients: this.multiRollupApiClients,
    });
  }

  public async loginCallback(): Promise<void> {
    return this.authManager.loginCallback();
  }

  public async logout(): Promise<void> {
    return this.authManager.logout();
  }

  /**
   * This method should only be called from the logout redirect uri
   * when logout mode is 'silent'.
   */
  public async logoutSilentCallback(url: string): Promise<void> {
    return this.authManager.logoutSilentCallback(url);
  }

  public async logoutDeviceFlow(): Promise<void> {
    return this.authManager.logoutDeviceFlow();
  }

  public async getUserInfo(): Promise<UserProfile | undefined> {
    const user = await this.authManager.getUser();
    return user?.profile;
  }

  public async getUserInfoDeviceFlow(): Promise<UserProfile | undefined> {
    const user = await this.authManager.getUserDeviceFlow();
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
}
