import { ethers } from 'ethers';
import { Magic } from 'magic-sdk';
import { LoginWithOpenIdParams, OpenIdExtension } from '@magic-ext/oidc';
import MagicAdapter from './magicAdapter';
import { PassportError, PassportErrorType } from './errors/passportError';

const loginWithOIDCMock: jest.MockedFunction<
  (args: LoginWithOpenIdParams) => Promise<void>
> = jest.fn();
const web3ProviderInstance = { getSigner: jest.fn() };
const web3ProviderMock = ethers.providers.Web3Provider as jest.MockedClass<
  typeof ethers.providers.Web3Provider
>;

const rpcProvider = {};

jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn().mockImplementation(() => web3ProviderInstance),
    },
  },
}));
jest.mock('@magic-ext/oidc', () => ({
  OpenIdExtension: jest.fn(),
}));
jest.mock('magic-sdk', () => ({
  Magic: jest.fn(() => ({
    openid: {
      loginWithOIDC: loginWithOIDCMock,
    },
    rpcProvider,
  })),
}));

describe('MagicWallet', () => {
  let magicWallet: MagicAdapter;
  const apiKey = 'pk_live_A7D9211D7547A338';
  const providerId = 'mPGZAvZsFkyfT6OWfML1HgTKjPqYOPkhhOj-8qCGeqI=';
  const network = 'goerli';
  const idToken = 'e30=.e30=.e30=';

  beforeEach(() => {
    jest.clearAllMocks();
    magicWallet = new MagicAdapter(network);
  });

  describe('constructor', () => {
    it('should initialise the Magic client with the correct arguments', () => {
      expect(Magic).toHaveBeenCalledWith(apiKey, {
        network,
        extensions: [new OpenIdExtension()],
      });
    });
  });

  describe('login', () => {
    it('should call loginWithOIDC and initialise the provider with the correct arguments', async () => {
      const signer = await magicWallet.login(idToken);

      expect(loginWithOIDCMock).toHaveBeenCalledWith({
        jwt: idToken,
        providerId,
      });
      expect(ethers.providers.Web3Provider).toHaveBeenCalledWith(rpcProvider);
      expect(signer).toEqual(web3ProviderInstance);
    });

    it('should throw a PassportError when an error is thrown', async () => {
      web3ProviderMock.mockImplementation(() => {
        throw new Error('oops');
      });

      await expect(async () => {
        await magicWallet.login(idToken);
      }).rejects.toThrow(
        new PassportError(
          'WALLET_CONNECTION_ERROR: oops',
          PassportErrorType.WALLET_CONNECTION_ERROR,
        ),
      );
    });
  });
});
