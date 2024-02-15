import { IMXClient } from '@imtbl/x-client';
import { ImxApiClients } from '@imtbl/generated-clients';
import registerPassportStarkEx from './workflows/registration';
import { PassportImxProviderFactory } from './passportImxProviderFactory';
import MagicAdapter from '../magicAdapter';
import AuthManager from '../authManager';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { PassportEventMap } from '../types';
import { mockUserImx } from '../test/mocks';
import TypedEventEmitter from '../utils/typedEventEmitter';
import { PassportImxProvider } from './passportImxProvider';
import GuardianClient from '../guardian';

jest.mock('./workflows/registration');
jest.mock('./passportImxProvider');
jest.mock('@imtbl/generated-clients');

describe('PassportImxProviderFactory', () => {
  const mockAuthManager = {
    getUser: jest.fn(),
    forceUserRefresh: jest.fn(),
    login: jest.fn(),
  };
  const imxApiClients = new ImxApiClients({} as any);

  const mockMagicAdapter = {};
  const immutableXClient = {
    usersApi: {},
  } as IMXClient;
  const guardianClient = {} as GuardianClient;
  const passportEventEmitter = new TypedEventEmitter<PassportEventMap>();
  const passportImxProviderFactory = new PassportImxProviderFactory({
    immutableXClient,
    authManager: mockAuthManager as unknown as AuthManager,
    magicAdapter: mockMagicAdapter as unknown as MagicAdapter,
    passportEventEmitter,
    imxApiClients,
    guardianClient,
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
        mockAuthManager.getUser.mockResolvedValue(null);

        const result = await passportImxProviderFactory.getProviderSilent();

        expect(result).toBe(null);
        expect(mockAuthManager.getUser).toHaveBeenCalledTimes(1);
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
      mockAuthManager.getUser.mockRejectedValue(new Error('error'));
      mockAuthManager.login.mockResolvedValue(mockUserImx);
      const result = await passportImxProviderFactory.getProvider();

      expect(result).toBe(mockPassportImxProvider);
      expect(mockAuthManager.getUser).toHaveBeenCalledTimes(1);
      expect(mockAuthManager.login).toHaveBeenCalledTimes(1);
      expect(registerPassportStarkEx).not.toHaveBeenCalled();
      expect(PassportImxProvider).toHaveBeenCalledWith({
        magicAdapter: mockMagicAdapter,
        authManager: mockAuthManager,
        immutableXClient,
        passportEventEmitter,
        imxApiClients: new ImxApiClients({} as any),
        guardianClient,
      });
    });
  });
});
