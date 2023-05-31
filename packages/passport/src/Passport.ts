import { EthSigner, StarkSigner } from '@imtbl/core-sdk';
import { IMXProvider } from '@imtbl/provider';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import { ethers } from 'ethers';
import { EthNetworkConfiguration } from 'magic-sdk';
import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import PassportImxProvider from './imxProvider/passportImxProvider';
import { PassportConfiguration } from './config';
import { PassportError, PassportErrorType } from './errors/passportError';
import { getStarkSigner } from './stark';
import {
  PassportModuleConfiguration,
  UserProfile,
  UserWithEtherKey,
  User,
} from './types';
import registerPassport from './workflows/registration';
import { ConfirmationScreen } from './confirmation';
import { ZkEvmProvider } from './ZkEvmProvider';

export class Passport {
  private readonly authManager: AuthManager;

  private readonly magicAdapter: MagicAdapter;

  private readonly config: PassportConfiguration;

  private readonly immutableXClient: ImmutableXClient;

  private readonly confirmationScreen: ConfirmationScreen;

  constructor(passportModuleConfiguration: PassportModuleConfiguration) {
    this.config = new PassportConfiguration(passportModuleConfiguration);
    this.authManager = new AuthManager(this.config);
    this.magicAdapter = new MagicAdapter(this.config);
    this.confirmationScreen = new ConfirmationScreen(this.config);
    this.immutableXClient = passportModuleConfiguration.overrides?.immutableXClient
      || new ImmutableXClient({
        baseConfig: passportModuleConfiguration.baseConfig,
      });
  }

  private async getZkEvmProvider(user: User) {
    if (!user || !user.idToken) {
      throw new PassportError(
        'Failed to initialise',
        PassportErrorType.WALLET_CONNECTION_ERROR,
      );
    }
    const magicNetwork: EthNetworkConfiguration = {
      rpcUrl: this.config.zkEvmRpcUrl,
      chainId: this.config.zkEvmChainId,
    };
    const magicProvider = await this.magicAdapter.login(user.idToken, magicNetwork);
    return new ZkEvmProvider({
      magicProvider,
      config: this.config,
      confirmationScreen: new ConfirmationScreen(this.config),
      user,
    });
  }

  private async getImxProvider(user: User | null) {
    if (!user || !user.idToken) {
      throw new PassportError(
        'Failed to initialise',
        PassportErrorType.WALLET_CONNECTION_ERROR,
      );
    }
    const magicRpcProvider = await this.magicAdapter.login(user.idToken, this.config.network);
    const web3Provider = new ethers.providers.Web3Provider(
      magicRpcProvider,
    );
    const ethSigner = web3Provider.getSigner();
    const starkSigner = await getStarkSigner(ethSigner);

    if (!user.etherKey) {
      const updatedUser = await this.registerUser(
        ethSigner,
        starkSigner,
        user.accessToken,
      );
      return new PassportImxProvider({
        user: updatedUser,
        starkSigner,
        immutableXClient: this.immutableXClient,
        confirmationScreen: this.confirmationScreen,
      });
    }
    const userWithEtherKey = user as UserWithEtherKey;
    return new PassportImxProvider({
      user: userWithEtherKey,
      starkSigner,
      immutableXClient: this.immutableXClient,
      confirmationScreen: this.confirmationScreen,
    });
  }

  public async connectImxSilent(): Promise<IMXProvider | null> {
    const user = await this.authManager.loginSilent();
    if (!user) {
      return null;
    }
    return this.getImxProvider(user);
  }

  public async connectImx(): Promise<IMXProvider> {
    const user = await this.authManager.login();
    return this.getImxProvider(user);
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

  private async registerUser(
    userAdminKeySigner: EthSigner,
    starkSigner: StarkSigner,
    jwt: string,
  ): Promise<UserWithEtherKey> {
    await registerPassport(
      {
        ethSigner: userAdminKeySigner,
        starkSigner,
        usersApi: this.immutableXClient.usersApi,
      },
      jwt,
    );
    const updatedUser = await this.authManager.requestRefreshTokenAfterRegistration();
    if (!updatedUser) {
      throw new PassportError(
        'Failed to get refresh token',
        PassportErrorType.REFRESH_TOKEN_ERROR,
      );
    }
    return updatedUser;
  }
}
