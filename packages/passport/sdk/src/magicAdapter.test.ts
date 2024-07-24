import { LoginWithOpenIdParams } from '@magic-ext/oidc';
import { Magic } from 'magic-sdk';
import { setImmediate } from 'timers';
import { Web3Provider } from '@ethersproject/providers';
import MagicAdapter from './magicAdapter';
import { PassportConfiguration } from './config';
import { PassportEventMap } from './types';
import AuthManager from './authManager';
import TypedEventEmitter from './utils/typedEventEmitter';
import { mockUserZkEvm } from './test/mocks';
import { PassportError, PassportErrorType } from './errors/passportError';

const loginWithOIDCMock: jest.MockedFunction<(args: LoginWithOpenIdParams) => Promise<void>> = jest.fn();

const rpcProvider = {};
const ethSigner = {};

const logoutMock = jest.fn();
const isMagicLoggedInMock = jest.fn();

jest.mock('@ethersproject/providers');
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
        isLoggedIn: isMagicLoggedInMock,
      },
      rpcProvider,
      preload,
    }));
    (Web3Provider as unknown as jest.Mock).mockImplementation(() => ({
      getSigner: jest.fn().mockImplementation(() => { }),
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
        authManagerMock.getUser.mockResolvedValue(mockUserZkEvm);
        jest.spyOn(window.document, 'readyState', 'get').mockReturnValue('complete');
        preload.mockResolvedValue(Promise.resolve());
        const magicAdapter = new MagicAdapter(config, authManager, passportEventEmitter);
        // @ts-ignore
        expect(magicAdapter.lazyMagicClient).toBeDefined();
      });

      it('should re-initialise magic signer if magic user is not logged in', async () => {
        (Web3Provider as unknown as jest.Mock).mockImplementation(() => ({
          getSigner: jest.fn().mockResolvedValue(ethSigner),
        }));
        authManagerMock.getUser.mockResolvedValue(mockUserZkEvm);
        const initialiseSigner = jest.spyOn(MagicAdapter.prototype as any, 'initialiseSigner');
        const getSigner = jest.spyOn(MagicAdapter.prototype as any, 'getSigner');

        const magicAdapter = new MagicAdapter(config, authManager, passportEventEmitter);
        // initialiseSigners is invoked asynchronously, so wait
        await new Promise(setImmediate);

        // @ts-ignore
        expect(magicAdapter.lazyMagicClient).toBeDefined();
        // mock magic user is not logged in originally, but mock the relog
        isMagicLoggedInMock.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

        expect(await magicAdapter.getSigner()).toBe(ethSigner);
        expect(initialiseSigner).toHaveBeenCalledTimes(1);
        expect(getSigner).toHaveBeenCalledTimes(1);
      });

      it('should throw a PassportError when signer initialisation fails', async () => {
        jest.spyOn(window.document, 'readyState', 'get').mockReturnValue('complete');
        preload.mockResolvedValue(Promise.resolve());

        // mock that a user session exists so signer is generated
        authManagerMock.getUser.mockResolvedValue(mockUserZkEvm);
        (Web3Provider as unknown as jest.Mock).mockImplementation(() => ({
          getSigner: () => {
            throw new Error('Something went wrong');
          },
        }));

        const magicAdapter = new MagicAdapter(config, authManager, passportEventEmitter);

        // @ts-ignore
        expect(magicAdapter.lazyMagicClient).toBeDefined();
        await expect(magicAdapter.getSigner()).rejects.toThrow(
          new PassportError(
            'Something went wrong',
            PassportErrorType.WALLET_CONNECTION_ERROR,
          ),
        );
      });
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
      await magicAdapter.logout();

      expect(logoutMock).toHaveBeenCalled();
    });
  });
});
