import { ImmutableXClient } from '@imtbl/immutablex-client';
import { Web3Provider } from '@ethersproject/providers';
import { PassportConfiguration } from '../config';
import { ConfirmationScreen } from '../confirmation';
import registerPassportStarkEx from './workflows/registration';
import { PassportImxProviderFactory } from './passportImxProviderFactory';
import MagicAdapter from '../magicAdapter';
import AuthManager from '../authManager';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { Networks } from '../types';
import { PassportImxProvider } from './passportImxProvider';
import { getStarkSigner } from './getStarkSigner';

jest.mock('@ethersproject/providers');
jest.mock('./workflows/registration');
jest.mock('./getStarkSigner');

describe('PassportImxProviderFactory', () => {
  const authManagerMock = {
    loginSilent: jest.fn(),
    login: jest.fn(),
  };
  const magicAdapterMock = {
    login: jest.fn(),
  };
  const immutableXClient = {
    usersApi: {},
  } as ImmutableXClient;
  const confirmationScreen = {} as ConfirmationScreen;
  const config = {
    network: Networks.SANDBOX,
  } as PassportConfiguration;
  const passportImxProviderFactory = new PassportImxProviderFactory({
    config,
    confirmationScreen,
    immutableXClient,
    authManager: authManagerMock as unknown as AuthManager,
    magicAdapter: magicAdapterMock as unknown as MagicAdapter,
  });
  const ethSignerMock = {};
  const starkSignerMock = {};
  const getSignerMock = jest.fn();

  beforeEach(() => {
    jest.restoreAllMocks();
    getSignerMock.mockReturnValue(ethSignerMock);
    (Web3Provider as unknown as jest.Mock).mockReturnValue({
      getSigner: getSignerMock,
    });
    (registerPassportStarkEx as jest.Mock).mockResolvedValue(null);
    (getStarkSigner as jest.Mock).mockResolvedValue(starkSignerMock);
  });

  describe('getPassportImxProvider', () => {
    describe('when connectSilent is true', () => {
      describe('when no user is logged in', () => {
        it('should return null', async () => {
          authManagerMock.loginSilent.mockResolvedValue(null);

          const result = await passportImxProviderFactory.getPassportImxProvider(true);

          expect(result).toBe(null);
          expect(authManagerMock.loginSilent).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('when the user has no idToken', () => {
      it('should throw an error', async () => {
        authManagerMock.login.mockResolvedValue({ idToken: null });

        await expect(() => passportImxProviderFactory.getPassportImxProvider()).rejects.toThrow(
          new PassportError(
            'Failed to initialise',
            PassportErrorType.WALLET_CONNECTION_ERROR,
          ),
        );
        expect(authManagerMock.login).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the user has not registered', () => {
      describe('when we exceed the number of attempts to obtain a user with the correct metadata', () => {
        it('should throw an error', async () => {
          const magicProviderMock = {};
          const userWithoutEtherKey = {
            idToken: 'idToken123',
            accessToken: 'accessToken123',
          };

          authManagerMock.login.mockResolvedValue(userWithoutEtherKey);
          magicAdapterMock.login.mockResolvedValue(magicProviderMock);
          authManagerMock.loginSilent.mockResolvedValue(userWithoutEtherKey);

          await expect(() => passportImxProviderFactory.getPassportImxProvider()).rejects.toThrow(
            'REFRESH_TOKEN_ERROR',
          );

          expect(authManagerMock.login).toHaveBeenCalledTimes(1);
          expect(magicAdapterMock.login).toHaveBeenCalledWith(userWithoutEtherKey.idToken, config.network);
          expect(getSignerMock).toHaveBeenCalledTimes(1);
          expect(registerPassportStarkEx).toHaveBeenCalledWith({
            ethSigner: ethSignerMock,
            starkSigner: starkSignerMock,
            usersApi: immutableXClient.usersApi,
          }, userWithoutEtherKey.accessToken);
          expect(authManagerMock.loginSilent).toHaveBeenCalledTimes(4);
        });
      });

      describe('when registration is successful', () => {
        it('should register the user and return a PassportImxProvider instance', async () => {
          const magicProviderMock = {};
          const userWithoutMetadata = {
            idToken: 'idToken123',
            accessToken: 'accessToken123',
          };
          const userWithMetadata = {
            ...userWithoutMetadata,
            etherKey: 'etherKey123',
            starkKey: 'starkKey123',
            userAdminKey: 'userAdminKey123',
          };

          authManagerMock.login.mockResolvedValue(userWithoutMetadata);
          magicAdapterMock.login.mockResolvedValue(magicProviderMock);
          authManagerMock.loginSilent.mockResolvedValue(userWithMetadata);

          const result = await passportImxProviderFactory.getPassportImxProvider();

          expect(result).toBeInstanceOf(PassportImxProvider);
          expect(authManagerMock.login).toHaveBeenCalledTimes(1);
          expect(magicAdapterMock.login).toHaveBeenCalledWith(userWithMetadata.idToken, config.network);
          expect(getSignerMock).toHaveBeenCalledTimes(1);
          expect(registerPassportStarkEx).toHaveBeenCalledWith({
            ethSigner: ethSignerMock,
            starkSigner: starkSignerMock,
            usersApi: immutableXClient.usersApi,
          }, userWithMetadata.accessToken);
          expect(authManagerMock.loginSilent).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('when the user has registered previously', () => {
      it('should return a PassportImxProvider instance', async () => {
        const magicProviderMock = {};
        const user = {
          idToken: 'idToken123',
          accessToken: 'accessToken123',
          etherKey: 'etherKey123',
          starkKey: 'starkKey123',
          userAdminKey: 'userAdminKey123',
        };

        authManagerMock.login.mockResolvedValue(user);
        magicAdapterMock.login.mockResolvedValue(magicProviderMock);
        authManagerMock.loginSilent.mockResolvedValue(user);

        const result = await passportImxProviderFactory.getPassportImxProvider();

        expect(result).toBeInstanceOf(PassportImxProvider);
        expect(authManagerMock.login).toHaveBeenCalledTimes(1);
        expect(magicAdapterMock.login).toHaveBeenCalledWith(user.idToken, config.network);
        expect(getSignerMock).toHaveBeenCalledTimes(1);
        expect(registerPassportStarkEx).not.toHaveBeenCalled();
        expect(authManagerMock.loginSilent).not.toHaveBeenCalled();
      });
    });
  });
});
