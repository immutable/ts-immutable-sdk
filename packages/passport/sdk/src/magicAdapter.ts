import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider';
import { Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/oidc';
import { ethers } from 'ethers';
import { trackDuration } from '@imtbl/metrics';
import { Web3Provider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { PassportErrorType, withPassportError } from './errors/passportError';
import { PassportConfiguration } from './config';
import { lazyDocumentReady } from './utils/lazyLoad';
import AuthManager from './authManager';
import { PassportEventMap, PassportEvents, User } from './types';
import TypedEventEmitter from './utils/typedEventEmitter';

type MagicClient = InstanceWithExtensions<SDKBase, [OpenIdExtension]>;

const MAINNET = 'mainnet';

export default class MagicAdapter {
  private readonly config: PassportConfiguration;

  private readonly authManager: AuthManager;

  private readonly lazyMagicClient?: Promise<MagicClient>;

  private magicSigner?: Promise<Signer | undefined> | undefined;

  private magicSignerInitialisationError: unknown | undefined;

  constructor(
    config: PassportConfiguration,
    authManager: AuthManager,
    passportEventEmitter: TypedEventEmitter<PassportEventMap>,
  ) {
    this.config = config;
    this.authManager = authManager;

    passportEventEmitter.on(PassportEvents.LOGGED_IN, this.initialiseSigner.bind(this));
    // Automatically connect an existing user session to Passport
    this.authManager.getUser().then((user) => {
      if (user) {
        this.initialiseSigner(user);
      }
    }).catch(() => {
      // User does not exist, don't initialise an eth signer
    });

    // TODO: Add logout callback AND test logout functionality
    // passportEventEmitter.on(PassportEvents.LOGGED_OUT, clearMagicSigner);

    if (typeof window !== 'undefined') {
      this.lazyMagicClient = lazyDocumentReady<MagicClient>(() => {
        const client = new Magic(this.config.magicPublishableApiKey, {
          extensions: [new OpenIdExtension()],
          network: MAINNET, // We always connect to mainnet to ensure addresses are the same across envs
        });
        client.preload();
        return client;
      });
    }
  }

  /**
   * This method is called asynchronously and initialises the Magic signer.
   * The signer is stored in a promise so that it can be retrieved when needed.
   *
   * If an error is thrown during initialisation, it is stored in the `magicSignerInitialisationError`,
   * so that it doesn't result in an unhandled promise rejection.
   *
   * This error is thrown when the signer is requested through:
   * @see #getSigner
   *
   */
  private initialiseSigner(user: User) {
    const generateSigner = async (): Promise<Signer> => {
      const startTime = performance.now();

      const magicClient = await this.magicClient;
      await magicClient.openid.loginWithOIDC({
        jwt: user.idToken,
        providerId: this.config.magicProviderId,
      });

      trackDuration(
        'passport',
        'magicLogin',
        Math.round(performance.now() - startTime),
      );

      const web3Provider = new Web3Provider(magicClient.rpcProvider as unknown as ethers.providers.ExternalProvider);
      return web3Provider.getSigner();
    };

    this.magicSignerInitialisationError = undefined;
    // eslint-disable-next-line no-async-promise-executor
    this.magicSigner = new Promise(async (resolve) => {
      try {
        resolve(await generateSigner());
      } catch (err) {
        // Capture and store the initialization error
        this.magicSignerInitialisationError = err;
        resolve(undefined);
      }
    });
  }

  private get magicClient(): Promise<MagicClient> {
    if (!this.lazyMagicClient) {
      throw new Error('Cannot perform this action outside of the browser');
    }

    return this.lazyMagicClient;
  }

  public async getSigner(): Promise<Signer> {
    return withPassportError<Signer>(async () => {
      const ethSigner = await this.magicSigner;
      // Throw the stored error if the signers failed to initialise
      if (typeof ethSigner === 'undefined') {
        if (typeof this.magicSignerInitialisationError !== 'undefined') {
          throw this.magicSignerInitialisationError;
        }
        throw new Error('Signer failed to initialise');
      }

      const magicClient = await this.magicClient;
      const isLoggedIn = await magicClient.user.isLoggedIn();
      if (isLoggedIn) return ethSigner;

      const user = await this.authManager.getUser();
      if (!user) {
        throw new Error('Cannot initialise signer without user');
      }

      this.initialiseSigner(user);
      return await this.getSigner();
    }, PassportErrorType.WALLET_CONNECTION_ERROR);
  }

  public async logout() {
    const magicClient = await this.magicClient;
    if (magicClient.user) {
      await magicClient.user.logout();
    }
  }
}
