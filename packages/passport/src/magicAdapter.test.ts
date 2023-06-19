import { LoginWithOpenIdParams, OpenIdExtension } from '@magic-ext/oidc';
import { Magic } from 'magic-sdk';
import MagicAdapter from './magicAdapter';
import { PassportConfiguration } from './config';
import { PassportError, PassportErrorType } from './errors/passportError';
import { Networks } from './types';

const loginWithOIDCMock:jest.MockedFunction<(args: LoginWithOpenIdParams) => Promise<void>> = jest.fn();

const rpcProvider = {};

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

  beforeEach(() => {
    jest.clearAllMocks();
    (Magic as jest.Mock).mockImplementation(() => ({
      openid: {
        loginWithOIDC: loginWithOIDCMock,
      },
      rpcProvider,
    }));
    magicWallet = new MagicAdapter(config);
  });

  describe('login', () => {
    it('should call loginWithOIDC and initialise the provider with the correct arguments', async () => {
      const magicProvider = await magicWallet.login(idToken, config.network);

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
        await magicWallet.login(idToken, config.network);
      }).rejects.toThrow(
        new PassportError(
          'WALLET_CONNECTION_ERROR: oops',
          PassportErrorType.WALLET_CONNECTION_ERROR,
        ),
      );
    });
  });
});
