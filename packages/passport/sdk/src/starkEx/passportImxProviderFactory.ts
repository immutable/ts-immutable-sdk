import { EthSigner, StarkSigner } from '@imtbl/core-sdk';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import { Web3Provider } from '@ethersproject/providers';
import registerPassportStarkEx from './workflows/registration';
import { PassportError, PassportErrorType, withPassportError } from '../errors/passportError';
import { PassportConfiguration } from '../config';
import AuthManager from '../authManager';
import { ConfirmationScreen } from '../confirmation';
import MagicAdapter from '../magicAdapter';
import { DeviceTokenResponse, PassportEventMap, User, UserImx, } from '../types';
import { PassportImxProvider } from './passportImxProvider';
import { getStarkSigner } from './getStarkSigner';
import TypedEventEmitter from '../typedEventEmitter';
import axios from 'axios';

export type PassportImxProviderFactoryInput = {
  authManager: AuthManager;
  config: PassportConfiguration;
  confirmationScreen: ConfirmationScreen;
  immutableXClient: ImmutableXClient;
  magicAdapter: MagicAdapter;
  passportEventEmitter: TypedEventEmitter<PassportEventMap>;
};

export class PassportImxProviderFactory {
  private readonly authManager: AuthManager;

  private readonly config: PassportConfiguration;

  private readonly confirmationScreen: ConfirmationScreen;

  private readonly immutableXClient: ImmutableXClient;

  private readonly magicAdapter: MagicAdapter;

  private readonly passportEventEmitter: TypedEventEmitter<PassportEventMap>;

  constructor({
                authManager,
                config,
                confirmationScreen,
                immutableXClient,
                magicAdapter,
                passportEventEmitter,
              }: PassportImxProviderFactoryInput) {
    this.authManager = authManager;
    this.config = config;
    this.confirmationScreen = confirmationScreen;
    this.immutableXClient = immutableXClient;
    this.magicAdapter = magicAdapter;
    this.passportEventEmitter = passportEventEmitter;
  }

  public async getProvider(): Promise<PassportImxProvider> {
    const user = await this.authManager.login();
    return this.createProviderInstance(user);
  }

  public async getProviderSilent(): Promise<PassportImxProvider | null> {
    const user = await this.authManager.loginSilent();
    if (!user) {
      return null;
    }

    return this.createProviderInstance(user);
  }

  public async getProviderWithDeviceFlow(
    deviceCode: string,
    interval: number,
    timeoutMs?: number,
  ): Promise<PassportImxProvider> {
    const user = await this.authManager.connectImxDeviceFlow(deviceCode, interval, timeoutMs);
    return this.createProviderInstance(user);
  }

  public async getProviderWithPKCEFlow(authorizationCode: string, state: string): Promise<PassportImxProvider> {
    const user = await this.authManager.connectImxPKCEFlow(authorizationCode, state);
    return this.createProviderInstance(user);
  }

  public async getProviderWithCredentials(tokenResponse: DeviceTokenResponse): Promise<PassportImxProvider | null> {
    const user = await this.authManager.connectImxWithCredentials(tokenResponse);
    if (!user) {
      return null;
    }

    return this.createProviderInstance(user);
  }

  private async createProviderInstance(user: User): Promise<PassportImxProvider> {
    console.log("createProviderInstance")
    if (!user.idToken) {
      throw new PassportError(
        'Failed to initialise',
        PassportErrorType.WALLET_CONNECTION_ERROR,
      );
    }


    const magicRpcProvider = await this.magicAdapter.login(user.idToken, this.config.network);
    const web3Provider = new Web3Provider(
      magicRpcProvider,
    );
    const ethSigner = web3Provider.getSigner();
    const starkSigner = await getStarkSigner(ethSigner);

    console.log("check user registered!!!!")
    if (!user.imx?.ethAddress) {
      let startTime = new Date().getTime();
      console.log("time start", startTime)
      console.log("registering async")
      const userImx = await this.registerStarkEx(ethSigner, starkSigner, user.accessToken);
      let finishTime = new Date().getTime();
      console.log("registered", finishTime)
      console.log("duration", (finishTime - startTime) / 1000)
      return new PassportImxProvider({
        user: userImx,
        starkSigner,
        immutableXClient: this.immutableXClient,
        confirmationScreen: this.confirmationScreen,
        config: this.config,
        passportEventEmitter: this.passportEventEmitter,
      });
    }

    return new PassportImxProvider({
      user: user as UserImx,
      starkSigner,
      immutableXClient: this.immutableXClient,
      confirmationScreen: this.confirmationScreen,
      config: this.config,
      passportEventEmitter: this.passportEventEmitter,
    });
  }

  private async registerStarkEx(userAdminKeySigner: EthSigner, starkSigner: StarkSigner, jwt: string) {
    return withPassportError<UserImx>(async () => {
      await this.updateAuth0User();
      await registerPassportStarkEx(
        {
          ethSigner: userAdminKeySigner,
          starkSigner,
          usersApi: this.immutableXClient.usersApi,
        },
        jwt,
      );


      return {} as UserImx;
    }, PassportErrorType.REFRESH_TOKEN_ERROR);
  }

  private async updateAuth0User() {
    try {
      let token = '';

      const userId = 'email|652cb7be310dbd78d1188c4d'; // Replace with the actual user ID


      const apiUrl = 'https://prod.immutable.auth0app.com/api/v2/users/' + userId; // Replace with your API endpoint

      const userData = {
        user_metadata: {
          yundi: 'fufufuf'
        }
      };
      let axiosResponse = await axios.patch(apiUrl, userData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("update user result", axiosResponse)

    } catch (e) {
      console.log("erropr", e)
    }
  }
}
