import { LoginWithOpenIdParams, OpenIdExtension } from '@magic-ext/oidc';
import { Magic } from 'magic-sdk';
import MagicAdapter from './magicAdapter';
import { PassportConfiguration } from './config';
import { PassportError, PassportErrorType } from './errors/passportError';
import { Networks } from './types';

const loginWithOIDCMock:jest.MockedFunction<(args: LoginWithOpenIdParams) => Promise<void>> = jest.fn();

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
    network: Networks.SANDBOX,
    magicPublishableApiKey: apiKey,
    magicProviderId: providerId,
  } as PassportConfiguration;
  const idToken = 'e30=.e30=.e30=';
  const preload = jest.fn();

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
        const magicAdapter = new MagicAdapter(config);
        // @ts-ignore
        expect(magicAdapter.lazyMagicClient).toBeDefined();
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
        const magicAdapter = new MagicAdapter(config);
        // @ts-ignore
        expect(magicAdapter.magicClientPromise).toBeUndefined();
      });
    });
  });

  describe('login', () => {
    it('should call loginWithOIDC and initialise the provider with the correct arguments', async () => {
      preload.mockResolvedValue(Promise.resolve());
      const magicAdapter = new MagicAdapter(config);
      const magicProvider = await magicAdapter.login(idToken);

      expect(Magic).toHaveBeenCalledWith(apiKey, {
        network: config.network,
        extensions: [new OpenIdExtension()],
      });

      expect(loginWithOIDCMock).toHaveBeenCalledWith({
        jwt: idToken,
        providerId,
      });

      expect(magicProvider).toEqual(rpcProvider);
    });

    it('should throw a PassportError when an error is thrown', async () => {
      preload.mockResolvedValue(Promise.resolve());
      const magicAdapter = new MagicAdapter(config);

      loginWithOIDCMock.mockImplementation(() => {
        throw new Error('oops');
      });

      await expect(async () => {
        await magicAdapter.login(idToken);
      }).rejects.toThrow(
        new PassportError(
          'oops',
          PassportErrorType.WALLET_CONNECTION_ERROR,
        ),
      );
    });
  });

  describe('logout', () => {
    it('calls the logout function', async () => {
      preload.mockResolvedValue(Promise.resolve());
      const magicAdapter = new MagicAdapter(config);
      await magicAdapter.login(idToken);
      await magicAdapter.logout();

      expect(logoutMock).toHaveBeenCalled();
    });
  });
});
