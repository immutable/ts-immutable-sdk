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
  const mockAuthManager = {
    loginSilent: jest.fn(),
    login: jest.fn(),
  };
  const mockMagicAdapter = {
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
    authManager: mockAuthManager as unknown as AuthManager,
    magicAdapter: mockMagicAdapter as unknown as MagicAdapter,
    passportEventEmitter,
  });
  const mockPassportImxProvider = {};
  const mockEthSigner = {};
  const mockStarkSigner = {};
  const mockGetSigner = jest.fn();

  beforeEach(() => {
    jest.restoreAllMocks();
    mockGetSigner.mockReturnValue(mockEthSigner);
    (Web3Provider as unknown as jest.Mock).mockReturnValue({
      getSigner: mockGetSigner,
    });
    (registerPassportStarkEx as jest.Mock).mockResolvedValue(null);
    (getStarkSigner as jest.Mock).mockResolvedValue(mockStarkSigner);
    (PassportImxProvider as jest.Mock).mockImplementation(() => mockPassportImxProvider);
  });

  describe('getProviderSilent', () => {
    describe('when no user is logged in', () => {
      it('should return null', async () => {
        mockAuthManager.loginSilent.mockResolvedValue(null);

        const result = await passportImxProviderFactory.getProviderSilent();

        expect(result).toBe(null);
        expect(mockAuthManager.loginSilent).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getProvider', () => {
    describe('when the user has no idToken', () => {
      it('should throw an error', async () => {
        mockAuthManager.login.mockResolvedValue({ idToken: null });

        await expect(() => passportImxProviderFactory.getProvider()).rejects.toThrow(
          new PassportError(
            'Failed to initialise',
            PassportErrorType.WALLET_CONNECTION_ERROR,
          ),
        );
        expect(mockAuthManager.login).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the user has registered previously', () => {
      it('should return a PassportImxProvider instance', async () => {
        const mockMagicProvider = {};

        mockAuthManager.login.mockResolvedValue(mockUserImx);
        mockMagicAdapter.login.mockResolvedValue(mockMagicProvider);
        mockAuthManager.loginSilent.mockResolvedValue(mockUserImx);

        const result = await passportImxProviderFactory.getProvider();

        expect(result).toBe(mockPassportImxProvider);
        expect(mockAuthManager.login).toHaveBeenCalledTimes(1);
        expect(mockMagicAdapter.login).toHaveBeenCalledWith(mockUserImx.idToken);
        expect(mockGetSigner).toHaveBeenCalledTimes(1);
        expect(registerPassportStarkEx).not.toHaveBeenCalled();
        expect(mockAuthManager.loginSilent).not.toHaveBeenCalled();
        expect(PassportImxProvider).toHaveBeenCalledWith({
          starkSigner: mockStarkSigner,
          ethSigner: mockEthSigner,
          authManager: mockAuthManager,
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
        // const mockUserImxEmptyAddresses = { ...mockUserImx, imx: { ethAddress: '', starkAddress: '', userAdminAddress: '' } };
        mockAuthManager.login.mockResolvedValue(mockUserImxNoAddress);
        mockMagicAdapter.login.mockResolvedValue(magicProviderMock);
        mockAuthManager.loginSilent.mockResolvedValue(mockUserImxNoAddress);

        const result = await passportImxProviderFactory.getProvider();

        expect(result).toBe(mockPassportImxProvider);
        expect(mockAuthManager.login).toHaveBeenCalledTimes(1);
        expect(mockMagicAdapter.login).toHaveBeenCalledWith(mockUserImx.idToken);
        expect(mockGetSigner).toHaveBeenCalledTimes(1);
        expect(registerPassportStarkEx).not.toHaveBeenCalled();
        expect(mockAuthManager.loginSilent).not.toHaveBeenCalled();
        expect(PassportImxProvider).toHaveBeenCalledWith({
          starkSigner: mockStarkSigner,
          ethSigner: mockEthSigner,
          authManager: mockAuthManager,
          immutableXClient,
          config,
          confirmationScreen,
          passportEventEmitter,
        });
      });
    });
  });
});
