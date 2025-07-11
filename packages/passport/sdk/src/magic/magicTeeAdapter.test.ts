import { MagicTeeApiClients } from '@imtbl/generated-clients';
import { trackDuration } from '@imtbl/metrics';
import { isAxiosError } from 'axios';
import AuthManager from '../authManager';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { withMetricsAsync } from '../utils/metrics';
import MagicTeeAdapter from './magicTeeAdapter';

// Mock dependencies
jest.mock('../utils/metrics');
jest.mock('@imtbl/metrics');
jest.mock('axios', () => ({
  isAxiosError: jest.fn(),
}));

describe('MagicTeeAdapter', () => {
  let authManager: jest.Mocked<AuthManager>;
  let magicTeeApiClient: jest.Mocked<MagicTeeApiClients>;
  let adapter: MagicTeeAdapter;
  let mockCreateWallet: jest.Mock;
  let mockPersonalSign: jest.Mock;
  let mockIsAxiosError: jest.Mock;

  const mockUser = {
    idToken: 'test-id-token',
    accessToken: 'test-access-token',
    profile: {
      sub: 'test-user-id',
      email: 'test@example.com',
    },
  };

  const mockHeaders = {
    Authorization: 'Bearer test-id-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    authManager = {
      getUser: jest.fn(),
    } as any;

    mockCreateWallet = jest.fn();
    mockPersonalSign = jest.fn();
    mockIsAxiosError = isAxiosError as unknown as jest.Mock;

    magicTeeApiClient = {
      walletApi: {
        createWalletV1WalletPost: mockCreateWallet,
      },
      transactionApi: {
        signMessageV1WalletPersonalSignPost: mockPersonalSign,
      },
    } as any;

    adapter = new MagicTeeAdapter(authManager, magicTeeApiClient);

    // Mock withMetricsAsync to call the function directly
    (withMetricsAsync as jest.Mock).mockImplementation(async (fn, flowName) => {
      const mockFlow = {
        details: { flowName },
        addEvent: jest.fn(),
      };
      return fn(mockFlow);
    });
  });

  describe('constructor', () => {
    it('should initialize with provided dependencies', () => {
      expect(adapter).toBeInstanceOf(MagicTeeAdapter);
      expect(adapter.authManager).toBe(authManager);
      expect(adapter.magicTeeApiClient).toBe(magicTeeApiClient);
    });
  });

  describe('createWallet', () => {
    it('should successfully create wallet and return public address', async () => {
      const mockPublicAddress = '0x123456789abcdef';
      const mockResponse = {
        data: {
          public_address: mockPublicAddress,
        },
      };

      authManager.getUser.mockResolvedValue(mockUser as any);
      mockCreateWallet.mockResolvedValue(mockResponse as any);

      const result = await adapter.createWallet();

      expect(result).toBe(mockPublicAddress);
      expect(authManager.getUser).toHaveBeenCalledTimes(1);
      expect(mockCreateWallet).toHaveBeenCalledWith(
        {
          createWalletRequestModel: {
            chain: 'ETH',
          },
        },
        { headers: mockHeaders },
      );
      expect(trackDuration).toHaveBeenCalledWith(
        'passport',
        'magicCreateWallet',
        expect.any(Number),
      );
    });

    it('should throw detailed error when API call fails with axios error and response', async () => {
      const axiosError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
        message: 'Request failed',
      };

      authManager.getUser.mockResolvedValue(mockUser as any);
      mockCreateWallet.mockRejectedValue(axiosError);
      mockIsAxiosError.mockReturnValue(true);

      await expect(adapter.createWallet()).rejects.toThrow(
        'Failed to create wallet with status 500: {"error":"Internal server error"}',
      );
    });

    it('should throw detailed error when API call fails with axios error without response', async () => {
      const axiosError = {
        message: 'Network error',
      };

      authManager.getUser.mockResolvedValue(mockUser as any);
      mockCreateWallet.mockRejectedValue(axiosError);
      mockIsAxiosError.mockReturnValue(true);

      await expect(adapter.createWallet()).rejects.toThrow(
        'Failed to create wallet: Network error',
      );
    });

    it('should throw detailed error when API call fails with non-axios error', async () => {
      const genericError = new Error('Generic error');

      authManager.getUser.mockResolvedValue(mockUser as any);
      mockCreateWallet.mockRejectedValue(genericError);
      mockIsAxiosError.mockReturnValue(false);

      await expect(adapter.createWallet()).rejects.toThrow(
        'Failed to create wallet: Generic error',
      );
    });

    it('should throw PassportError when user is not logged in', async () => {
      authManager.getUser.mockResolvedValue(null);

      await expect(adapter.createWallet()).rejects.toThrow(
        new PassportError(
          'User has been logged out',
          PassportErrorType.NOT_LOGGED_IN_ERROR,
        ),
      );
    });
  });

  describe('personalSign', () => {
    it('should successfully sign string message and return signature', async () => {
      const message = 'Hello, world!';
      const mockSignature = '0xabcdef123456';
      const mockResponse = {
        data: {
          signature: mockSignature,
        },
      };

      authManager.getUser.mockResolvedValue(mockUser as any);
      mockPersonalSign.mockResolvedValue(mockResponse as any);

      const result = await adapter.personalSign(message);

      expect(result).toBe(mockSignature);
      expect(authManager.getUser).toHaveBeenCalledTimes(1);
      expect(mockPersonalSign).toHaveBeenCalledWith(
        {
          personalSignRequest: {
            message_base64: Buffer.from(message, 'utf-8').toString('base64'),
            chain: 'ETH',
          },
        },
        { headers: mockHeaders },
      );
      expect(trackDuration).toHaveBeenCalledWith(
        'passport',
        'magicPersonalSign',
        expect.any(Number),
      );
    });

    it('should successfully sign Uint8Array message and return signature', async () => {
      const message = new Uint8Array([72, 101, 108, 108, 111]); // "Hello" in bytes
      const expectedHexMessage = '0x48656c6c6f';
      const mockSignature = '0xabcdef123456';
      const mockResponse = {
        data: {
          signature: mockSignature,
        },
      };

      authManager.getUser.mockResolvedValue(mockUser as any);
      mockPersonalSign.mockResolvedValue(mockResponse as any);

      const result = await adapter.personalSign(message);

      expect(result).toBe(mockSignature);
      expect(mockPersonalSign).toHaveBeenCalledWith(
        {
          personalSignRequest: {
            message_base64: Buffer.from(expectedHexMessage, 'utf-8').toString('base64'),
            chain: 'ETH',
          },
        },
        { headers: mockHeaders },
      );
    });

    it('should throw detailed error when API call fails with axios error and response', async () => {
      const message = 'Hello, world!';
      const axiosError = {
        response: {
          status: 400,
          data: { error: 'Bad request' },
        },
        message: 'Request failed',
      };

      authManager.getUser.mockResolvedValue(mockUser as any);
      mockPersonalSign.mockRejectedValue(axiosError);
      mockIsAxiosError.mockReturnValue(true);

      await expect(adapter.personalSign(message)).rejects.toThrow(
        'Failed to create signature using EOA with status 400: {"error":"Bad request"}',
      );
    });

    it('should throw detailed error when API call fails with axios error without response', async () => {
      const message = 'Hello, world!';
      const axiosError = {
        message: 'Network timeout',
      };

      authManager.getUser.mockResolvedValue(mockUser as any);
      mockPersonalSign.mockRejectedValue(axiosError);
      mockIsAxiosError.mockReturnValue(true);

      await expect(adapter.personalSign(message)).rejects.toThrow(
        'Failed to create signature using EOA: Network timeout',
      );
    });

    it('should throw detailed error when API call fails with non-axios error', async () => {
      const message = 'Hello, world!';
      const genericError = new Error('Signing failed');

      authManager.getUser.mockResolvedValue(mockUser as any);
      mockPersonalSign.mockRejectedValue(genericError);
      mockIsAxiosError.mockReturnValue(false);

      await expect(adapter.personalSign(message)).rejects.toThrow(
        'Failed to create signature using EOA: Signing failed',
      );
    });

    it('should throw PassportError when user is not logged in', async () => {
      const message = 'Hello, world!';
      authManager.getUser.mockResolvedValue(null);

      await expect(adapter.personalSign(message)).rejects.toThrow(
        new PassportError(
          'User has been logged out',
          PassportErrorType.NOT_LOGGED_IN_ERROR,
        ),
      );
    });
  });

  describe('getHeaders', () => {
    it('should return headers with authorization token when user is logged in', async () => {
      authManager.getUser.mockResolvedValue(mockUser as any);

      const result = await adapter.getHeaders();

      expect(result).toEqual({
        Authorization: 'Bearer test-id-token',
      });
      expect(authManager.getUser).toHaveBeenCalledTimes(1);
    });

    it('should throw PassportError when user is not logged in', async () => {
      authManager.getUser.mockResolvedValue(null);

      await expect(adapter.getHeaders()).rejects.toThrow(
        new PassportError(
          'User has been logged out',
          PassportErrorType.NOT_LOGGED_IN_ERROR,
        ),
      );
    });
  });

  describe('metrics integration', () => {
    it('should call withMetricsAsync with correct flow name for createWallet', async () => {
      const mockPublicAddress = '0x123456789abcdef';
      const mockResponse = {
        data: {
          public_address: mockPublicAddress,
        },
      };

      authManager.getUser.mockResolvedValue(mockUser as any);
      mockCreateWallet.mockResolvedValue(mockResponse as any);

      await adapter.createWallet();

      expect(withMetricsAsync).toHaveBeenCalledWith(
        expect.any(Function),
        'magicCreateWallet',
      );
    });

    it('should call withMetricsAsync with correct flow name for personalSign', async () => {
      const message = 'Hello, world!';
      const mockSignature = '0xabcdef123456';
      const mockResponse = {
        data: {
          signature: mockSignature,
        },
      };

      authManager.getUser.mockResolvedValue(mockUser as any);
      mockPersonalSign.mockResolvedValue(mockResponse as any);

      await adapter.personalSign(message);

      expect(withMetricsAsync).toHaveBeenCalledWith(
        expect.any(Function),
        'magicPersonalSign',
      );
    });

    it('should track duration for successful createWallet calls', async () => {
      const mockPublicAddress = '0x123456789abcdef';
      const mockResponse = {
        data: {
          public_address: mockPublicAddress,
        },
      };

      authManager.getUser.mockResolvedValue(mockUser as any);
      mockCreateWallet.mockResolvedValue(mockResponse as any);

      await adapter.createWallet();

      expect(trackDuration).toHaveBeenCalledWith(
        'passport',
        'magicCreateWallet',
        expect.any(Number),
      );
    });

    it('should track duration for successful personalSign calls', async () => {
      const message = 'Hello, world!';
      const mockSignature = '0xabcdef123456';
      const mockResponse = {
        data: {
          signature: mockSignature,
        },
      };

      authManager.getUser.mockResolvedValue(mockUser as any);
      mockPersonalSign.mockResolvedValue(mockResponse as any);

      await adapter.personalSign(message);

      expect(trackDuration).toHaveBeenCalledWith(
        'passport',
        'magicPersonalSign',
        expect.any(Number),
      );
    });
  });
});
