import { LoginWithOpenIdParams } from '@magic-ext/oidc';
import { Magic } from 'magic-sdk';
import { setImmediate } from 'timers';
import MagicAdapter from './magicAdapter';
import { PassportConfiguration } from './config';
// import { PassportError, PassportErrorType } from './errors/passportError';
import { PassportEventMap } from './types';
import AuthManager from './authManager';
import TypedEventEmitter from './utils/typedEventEmitter';
import { mockUserZkEvm } from './test/mocks';

const loginWithOIDCMock: jest.MockedFunction<(args: LoginWithOpenIdParams) => Promise<void>> = jest.fn();

const rpcProvider = {};

const logoutMock = jest.fn();

jest.mock('magic-sdk');
jest.mock('@magic-ext/oidc', () => ({
  OpenIdExtension: jest.fn(),
}));

describe('MagicWallet', () => {
  const apiKey = 'pk_live_A7D9211D7547A338';
  const providerId = 'mPGZAvZsFkyfT6OWfML1HgTKjPqYOPkhhOj-8qCGeqI=';
  const config: PassportConfiguration = {
    magicPublishableApiKey: apiKey,
    magicProviderId: providerId,
  } as PassportConfiguration;
  const idToken = 'e30=.e30=.e30=';
  const preload = jest.fn();

  const authManagerMock = {
    getUserOrLogin: jest.fn().mockResolvedValue(mockUserZkEvm),
    getUser: jest.fn().mockResolvedValue(mockUserZkEvm),
  };
  const authManager = authManagerMock as Partial<AuthManager> as AuthManager;
  const passportEventEmitter = new TypedEventEmitter<PassportEventMap>();

  beforeEach(() => {
    jest.resetAllMocks();
    (Magic as jest.Mock).mockImplementation(() => ({
      openid: {
        loginWithOIDC: loginWithOIDCMock,
      },
      user: {
        logout: logoutMock,
      },
      rpcProvider,
      preload,
    }));
  });

  describe('constructor', () => {
    describe('when window defined', () => {
      let originalDocument: Document | undefined;

      beforeAll(() => {
        originalDocument = window.document;
        const mockDocument = {
          ...window.document,
          readyState: 'complete',
        };
        (window as any).document = mockDocument;
      });
      afterAll(() => {
        (window as any).document = originalDocument;
      });
      it('starts initialising the magicClient', () => {
        jest.spyOn(window.document, 'readyState', 'get').mockReturnValue('complete');
        preload.mockResolvedValue(Promise.resolve());
        const magicAdapter = new MagicAdapter(config, authManager, passportEventEmitter);
        // @ts-ignore
        expect(magicAdapter.lazyMagicClient).toBeDefined();
      });

      it('should initialise magic signer from existing user session when instantiated', async () => {
        jest.spyOn(window.document, 'readyState', 'get').mockReturnValue('complete');
        preload.mockResolvedValue(Promise.resolve());
        // mock that a user session exists so signer is generated
        authManagerMock.getUser.mockReturnValue(Promise.resolve(mockUserZkEvm));
        const initialiseSigner = jest.spyOn(MagicAdapter.prototype as any, 'initialiseSigner');

        const magicAdapter = new MagicAdapter(config, authManager, passportEventEmitter);

        // initialiseSigners is invoked asyncrhonously, so wait
        await new Promise(setImmediate);

        // @ts-ignore
        expect(magicAdapter.lazyMagicClient).toBeDefined();
        expect(authManagerMock.getUser).toHaveBeenCalledTimes(1);
        expect(initialiseSigner).toHaveBeenCalledTimes(1);
      });

      // it('should throw a PassportError when an error is thrown', async () => {
      //   preload.mockResolvedValue(Promise.resolve());
      //   const magicAdapter = new MagicAdapter(config, authManager, passportEventEmitter);

      //   loginWithOIDCMock.mockImplementation(() => {
      //     throw new Error('oops');
      //   });

      //   await expect(async () => {
      //     await magicAdapter.login(idToken);
      //   }).rejects.toThrow(
      //     new PassportError(
      //       'oops',
      //       PassportErrorType.WALLET_CONNECTION_ERROR,
      //     ),
      //   );
      // });
    });

    describe('when window is undefined', () => {
      const { window } = global;
      beforeAll(() => {
        // @ts-expect-error
        delete global.window;
      });
      afterAll(() => {
        global.window = window;
      });

      it('does nothing', () => {
        const magicAdapter = new MagicAdapter(config, authManager, passportEventEmitter);
        // @ts-ignore
        expect(magicAdapter.magicClientPromise).toBeUndefined();
      });
    });
  });

  describe('logout', () => {
    it('calls the logout function', async () => {
      preload.mockResolvedValue(Promise.resolve());
      const magicAdapter = new MagicAdapter(config, authManager, passportEventEmitter);
      await magicAdapter.login(idToken);
      await magicAdapter.logout();

      expect(logoutMock).toHaveBeenCalled();
    });
  });
});
