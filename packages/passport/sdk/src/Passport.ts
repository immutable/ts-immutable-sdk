import { IMXProvider } from '@imtbl/provider';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { PassportImxProviderFactory } from './starkEx';
import { PassportConfiguration } from './config';
import {
  PassportModuleConfiguration,
  UserProfile,
  DeviceConnectResponse,
  DeviceTokenResponse,
} from './types';
import { ConfirmationScreen } from './confirmation';

export class Passport {
  private readonly authManager: AuthManager;

  private readonly config: PassportConfiguration;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly immutableXClient: ImmutableXClient;

  private readonly magicAdapter: MagicAdapter;

  private readonly passportImxProviderFactory: PassportImxProviderFactory;

  constructor(passportModuleConfiguration: PassportModuleConfiguration) {
    this.config = new PassportConfiguration(passportModuleConfiguration);
    this.authManager = new AuthManager(this.config);
    this.magicAdapter = new MagicAdapter(this.config);
    this.confirmationScreen = new ConfirmationScreen(this.config);
    this.immutableXClient = passportModuleConfiguration.overrides?.immutableXClient
      || new ImmutableXClient({
        baseConfig: passportModuleConfiguration.baseConfig,
      });
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

  /**
   * @returns {boolean} the stored device flow credentials if they exist
   */
  public checkStoredDeviceFlowCredentials(): DeviceTokenResponse | null {
    return this.authManager.checkStoredDeviceFlowCredentials();
  }

  public async connectImxWithCredentials(tokenResponse: DeviceTokenResponse): Promise<IMXProvider | null> {
    return this.passportImxProviderFactory.getProviderWithCredentials(tokenResponse);
  }

  public async loginCallback(): Promise<void> {
    return this.authManager.loginCallback();
  }

  public async logout(): Promise<void> {
    return this.authManager.logout();
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
}
