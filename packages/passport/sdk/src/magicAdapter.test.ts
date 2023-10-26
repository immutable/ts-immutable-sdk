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
  let magicWallet: MagicAdapter;
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
    magicWallet = new MagicAdapter(config);
  });

  describe('preload', () => {
    it('should have called the magic client preload method', () => {
      expect(preload).toHaveBeenCalled();
    });
  });

  describe('window is not defined', () => {
    const { window } = global;
    beforeAll(() => {
    // @ts-expect-error
      delete global.window;
    });
    afterAll(() => {
      global.window = window;
    });
    it('does not call the magic preload method', () => {
      expect(preload).toBeCalledTimes(0);
    });
  });

  describe('login', () => {
    it('should call loginWithOIDC and initialise the provider with the correct arguments', async () => {
      const magicProvider = await magicWallet.login(idToken);

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
      loginWithOIDCMock.mockImplementation(() => {
        throw new Error('oops');
      });

      await expect(async () => {
        await magicWallet.login(idToken);
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
      await magicWallet.login(idToken);
      await magicWallet.logout();

      expect(logoutMock).toHaveBeenCalled();
    });
  });
});
