import { IMXClient } from '@imtbl/x-client';
import { ImxApiClients } from '@imtbl/generated-clients';
import { PassportImxProviderFactory } from './passportImxProviderFactory';
import MagicAdapter from '../magicAdapter';
import AuthManager from '../authManager';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { PassportEventMap } from '../types';
import TypedEventEmitter from '../utils/typedEventEmitter';
import { PassportImxProvider } from './passportImxProvider';
import GuardianClient from '../guardian';

jest.mock('./workflows/registration');
jest.mock('./passportImxProvider');
jest.mock('@imtbl/generated-clients');

describe('PassportImxProviderFactory', () => {
  const mockAuthManager = {
    getUser: jest.fn(),
    getUserOrLogin: jest.fn(),
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
        mockAuthManager.getUserOrLogin.mockResolvedValue({ idToken: null });

        await expect(() => passportImxProviderFactory.getProvider()).rejects.toThrow(
          new PassportError(
            'Failed to initialise',
            PassportErrorType.WALLET_CONNECTION_ERROR,
          ),
        );
        expect(mockAuthManager.getUserOrLogin).toHaveBeenCalledTimes(1);
      });
    });

    it('should return a PassportImxProvider instance', async () => {
      mockAuthManager.getUserOrLogin.mockResolvedValue({ idToken: 'id123' });

      const result = await passportImxProviderFactory.getProvider();

      expect(result).toBe(mockPassportImxProvider);
      expect(mockAuthManager.getUserOrLogin).toHaveBeenCalledTimes(1);
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
