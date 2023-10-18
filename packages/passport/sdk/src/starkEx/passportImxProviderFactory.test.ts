import { ImmutableXClient } from '@imtbl/immutablex-client';
import { Web3Provider } from '@ethersproject/providers';
import { ConfirmationScreen } from '../confirmation';
import registerPassportStarkEx from './workflows/registration';
import { PassportImxProviderFactory } from './passportImxProviderFactory';
import MagicAdapter from '../magicAdapter';
import AuthManager from '../authManager';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { PassportEventMap } from '../types';
import { PassportImxProvider } from './passportImxProvider';
import { getStarkSigner } from './getStarkSigner';
import { mockUserImx, testConfig } from '../test/mocks';
import TypedEventEmitter from '../typedEventEmitter';

jest.mock('@ethersproject/providers');
jest.mock('./workflows/registration');
jest.mock('./getStarkSigner');
jest.mock('./passportImxProvider');

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
  const config = testConfig;
  const passportEventEmitter = new TypedEventEmitter<PassportEventMap>();
  const passportImxProviderFactory = new PassportImxProviderFactory({
    config,
    confirmationScreen,
    immutableXClient,
    authManager: authManagerMock as unknown as AuthManager,
    magicAdapter: magicAdapterMock as unknown as MagicAdapter,
    passportEventEmitter,
  });
  const passportImxProviderMock = {};
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
    (PassportImxProvider as jest.Mock).mockImplementation(() => passportImxProviderMock);
  });

  describe('getProviderSilent', () => {
    describe('when no user is logged in', () => {
      it('should return null', async () => {
        authManagerMock.loginSilent.mockResolvedValue(null);

        const result = await passportImxProviderFactory.getProviderSilent();

        expect(result).toBe(null);
        expect(authManagerMock.loginSilent).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getProvider', () => {
    describe('when the user has no idToken', () => {
      it('should throw an error', async () => {
        authManagerMock.login.mockResolvedValue({ idToken: null });

        await expect(() => passportImxProviderFactory.getProvider()).rejects.toThrow(
          new PassportError(
            'Failed to initialise',
            PassportErrorType.WALLET_CONNECTION_ERROR,
          ),
        );
        expect(authManagerMock.login).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the user has registered previously', () => {
      it('should return a PassportImxProvider instance', async () => {
        const magicProviderMock = {};

        authManagerMock.login.mockResolvedValue(mockUserImx);
        magicAdapterMock.login.mockResolvedValue(magicProviderMock);
        authManagerMock.loginSilent.mockResolvedValue(mockUserImx);

        const result = await passportImxProviderFactory.getProvider();

        expect(result).toBe(passportImxProviderMock);
        expect(authManagerMock.login).toHaveBeenCalledTimes(1);
        expect(magicAdapterMock.login).toHaveBeenCalledWith(mockUserImx.idToken);
        expect(getSignerMock).toHaveBeenCalledTimes(1);
        expect(registerPassportStarkEx).not.toHaveBeenCalled();
        expect(authManagerMock.loginSilent).not.toHaveBeenCalled();
        expect(PassportImxProvider).toHaveBeenCalledWith({
          user: mockUserImx,
          starkSigner: starkSignerMock,
          ethSigner: ethSignerMock,
          authManager: authManagerMock,
          immutableXClient,
          config,
          confirmationScreen,
          passportEventEmitter,
        });
      });
    });

    describe('when the user has not previously registered', () => {
      it('should return a PassportImxProviderInstance with empty address fields', async () => {
        const magicProviderMock = {};
        const mockUserImxNoAddress = { ...mockUserImx, imx: {} };
        const mockUserImxEmptyAddresses = { ...mockUserImx, imx: { ethAddress: '', starkAddress: '', userAdminAddress: '' } };
        authManagerMock.login.mockResolvedValue(mockUserImxNoAddress);
        magicAdapterMock.login.mockResolvedValue(magicProviderMock);
        authManagerMock.loginSilent.mockResolvedValue(mockUserImxNoAddress);

        const result = await passportImxProviderFactory.getProvider();

        expect(result).toBe(passportImxProviderMock);
        expect(authManagerMock.login).toHaveBeenCalledTimes(1);
        expect(magicAdapterMock.login).toHaveBeenCalledWith(mockUserImx.idToken);
        expect(getSignerMock).toHaveBeenCalledTimes(1);
        expect(registerPassportStarkEx).not.toHaveBeenCalled();
        expect(authManagerMock.loginSilent).not.toHaveBeenCalled();
        expect(PassportImxProvider).toHaveBeenCalledWith({
          user: mockUserImxEmptyAddresses,
          starkSigner: starkSignerMock,
          ethSigner: ethSignerMock,
          authManager: authManagerMock,
          immutableXClient,
          config,
          confirmationScreen,
          passportEventEmitter,
        });
      });
    });
  });
});
