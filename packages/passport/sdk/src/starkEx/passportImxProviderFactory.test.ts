import { ImmutableXClient } from '@imtbl/immutablex-client';
import { ConfirmationScreen } from '../confirmation';
import registerPassportStarkEx from './workflows/registration';
import { PassportImxProviderFactory } from './passportImxProviderFactory';
import MagicAdapter from '../magicAdapter';
import AuthManager from '../authManager';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { PassportEventMap } from '../types';
import { mockUserImx, testConfig } from '../test/mocks';
import TypedEventEmitter from '../utils/typedEventEmitter';
import { PassportImxProvider } from './passportImxProvider';

jest.mock('./workflows/registration');
jest.mock('./passportImxProvider');

describe('PassportImxProviderFactory', () => {
  const mockAuthManager = {
    loginSilent: jest.fn(),
    login: jest.fn(),
  };
  const mockMagicAdapter = {};
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

  beforeEach(() => {
    jest.restoreAllMocks();
    (registerPassportStarkEx as jest.Mock).mockResolvedValue(null);
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

    it('should return a PassportImxProvider instance if silentLogin throws error', async () => {
      mockAuthManager.login.mockResolvedValue(mockUserImx);
      mockAuthManager.loginSilent.mockRejectedValue(new Error('error'));
      mockAuthManager.login.mockResolvedValue(mockUserImx);

      const result = await passportImxProviderFactory.getProvider();

      expect(result).toBe(mockPassportImxProvider);
      expect(mockAuthManager.loginSilent).toHaveBeenCalledTimes(1);
      expect(mockAuthManager.login).toHaveBeenCalledTimes(1);
      expect(registerPassportStarkEx).not.toHaveBeenCalled();
      expect(PassportImxProvider).toHaveBeenCalledWith({
        magicAdapter: mockMagicAdapter,
        authManager: mockAuthManager,
        immutableXClient,
        config,
        confirmationScreen,
        passportEventEmitter,
      });
    });
  });
});
