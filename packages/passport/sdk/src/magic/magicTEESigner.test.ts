import { MagicTeeApiClients } from '@imtbl/generated-clients';
import { trackDuration } from '@imtbl/metrics';
import { isAxiosError } from 'axios';
import MagicTEESigner from './magicTEESigner';
import AuthManager from '../authManager';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { mockUser, mockUserImx, mockUserZkEvm } from '../test/mocks';
import { withMetricsAsync } from '../utils/metrics';

// Mock all dependencies
jest.mock('@imtbl/metrics');
jest.mock('axios');
jest.mock('../utils/metrics');

describe('MagicTEESigner', () => {
  let magicTEESigner: MagicTEESigner;
  let mockAuthManager: jest.Mocked<AuthManager>;
  let mockMagicTeeApiClient: jest.Mocked<MagicTeeApiClients>;
  let mockFlow: any;
  let mockCreateWalletV1WalletPost: jest.Mock;
  let mockSignMessageV1WalletPersonalSignPost: jest.Mock;

  const mockWalletResponse = {
    data: {
      public_address: mockUserZkEvm.zkEvm.userAdminAddress,
    },
  };

  const mockSignatureResponse = {
    data: {
      signature: '0xsignature123',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock AuthManager
    mockAuthManager = {
      getUser: jest.fn(),
    } as any;

    // Mock API methods
    mockCreateWalletV1WalletPost = jest.fn();
    mockSignMessageV1WalletPersonalSignPost = jest.fn();

    // Mock MagicTeeApiClients
    mockMagicTeeApiClient = {
      walletApi: {
        createWalletV1WalletPost: mockCreateWalletV1WalletPost,
      },
      transactionApi: {
        signMessageV1WalletPersonalSignPost: mockSignMessageV1WalletPersonalSignPost,
      },
    } as any;

    // Mock Flow
    mockFlow = {
      details: {
        flowName: 'testFlow',
        flowId: '123',
      },
      addEvent: jest.fn(),
    };

    // Mock withMetricsAsync
    (withMetricsAsync as jest.Mock).mockImplementation(async (fn) => fn(mockFlow));

    // Mock trackDuration
    (trackDuration as jest.Mock).mockImplementation(() => {});

    // Mock isAxiosError
    (isAxiosError as unknown as jest.Mock).mockImplementation((error) => error && error.isAxiosError === true);

    magicTEESigner = new MagicTEESigner(mockAuthManager, mockMagicTeeApiClient);
  });

  describe('getAddress', () => {
    it('should return wallet address when user is logged in', async () => {
      mockAuthManager.getUser.mockResolvedValue(mockUser);
      mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);

      const address = await magicTEESigner.getAddress();

      expect(address).toBe(mockUserZkEvm.zkEvm.userAdminAddress);
      expect(mockCreateWalletV1WalletPost).toHaveBeenCalledWith(
        {
          createWalletRequestModel: {
            chain: 'ETH',
          },
        },
        { headers: { Authorization: `Bearer ${mockUser.idToken}` } },
      );
    });

    it('should throw error when user is not logged in', async () => {
      mockAuthManager.getUser.mockResolvedValue(null);

      await expect(magicTEESigner.getAddress()).rejects.toThrow(
        new PassportError(
          'User has been logged out',
          PassportErrorType.NOT_LOGGED_IN_ERROR,
        ),
      );
    });

    it('should reuse existing wallet for same user', async () => {
      mockAuthManager.getUser.mockResolvedValue(mockUser);
      mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);

      // Call getAddress twice
      const address1 = await magicTEESigner.getAddress();
      const address2 = await magicTEESigner.getAddress();

      expect(address1).toBe(mockUserZkEvm.zkEvm.userAdminAddress);
      expect(address2).toBe(mockUserZkEvm.zkEvm.userAdminAddress);
      // Should only call createWallet once
      expect(mockCreateWalletV1WalletPost).toHaveBeenCalledTimes(1);
    });

    it('should create new wallet when user changes', async () => {
      const user1 = { ...mockUser, profile: { ...mockUser.profile, sub: 'user1' } };
      const user2 = { ...mockUser, profile: { ...mockUser.profile, sub: 'user2' } };

      mockAuthManager.getUser
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2)
        .mockResolvedValueOnce(user2);

      mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);

      // First call with user1
      await magicTEESigner.getAddress();

      // Second call with user2 (different user)
      await magicTEESigner.getAddress();

      expect(mockCreateWalletV1WalletPost).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors gracefully', async () => {
      mockAuthManager.getUser.mockResolvedValue(mockUser);
      const apiError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };
      (isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockCreateWalletV1WalletPost.mockRejectedValue(apiError);

      await expect(magicTEESigner.getAddress()).rejects.toThrow(
        'Failed to create wallet with status 500: {"message":"Internal server error"}',
      );
    });

    it('should handle network errors gracefully', async () => {
      mockAuthManager.getUser.mockResolvedValue(mockUser);
      const networkError = {
        isAxiosError: true,
        message: 'Network Error',
      };
      (isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockCreateWalletV1WalletPost.mockRejectedValue(networkError);

      await expect(magicTEESigner.getAddress()).rejects.toThrow(
        'Failed to create wallet: Network Error',
      );
    });

    it('should handle non-axios errors gracefully', async () => {
      mockAuthManager.getUser.mockResolvedValue(mockUser);
      const genericError = new Error('Generic error');
      (isAxiosError as unknown as jest.Mock).mockReturnValue(false);
      mockCreateWalletV1WalletPost.mockRejectedValue(genericError);

      await expect(magicTEESigner.getAddress()).rejects.toThrow(
        'Failed to create wallet: Generic error',
      );
    });

    it('should handle concurrent wallet creation requests', async () => {
      mockAuthManager.getUser.mockResolvedValue(mockUser);
      mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);

      // Make two concurrent calls
      const [address1, address2] = await Promise.all([
        magicTEESigner.getAddress(),
        magicTEESigner.getAddress(),
      ]);

      expect(address1).toBe(mockUserZkEvm.zkEvm.userAdminAddress);
      expect(address2).toBe(mockUserZkEvm.zkEvm.userAdminAddress);
      // Should only call createWallet once even with concurrent requests
      expect(mockCreateWalletV1WalletPost).toHaveBeenCalledTimes(1);
    });

    it('should track metrics for wallet creation', async () => {
      mockAuthManager.getUser.mockResolvedValue(mockUser);
      mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);

      await magicTEESigner.getAddress();

      expect(withMetricsAsync).toHaveBeenCalledWith(
        expect.any(Function),
        'magicCreateWallet',
      );
      expect(trackDuration).toHaveBeenCalledWith(
        'passport',
        'testFlow',
        expect.any(Number),
      );
    });
  });

  describe('signMessage', () => {
    beforeEach(() => {
      mockAuthManager.getUser.mockResolvedValue(mockUser);
      mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);
      mockSignMessageV1WalletPersonalSignPost.mockResolvedValue(mockSignatureResponse);
    });

    it('should sign string message successfully', async () => {
      const message = 'Hello, world!';
      const signature = await magicTEESigner.signMessage(message);

      expect(signature).toBe('0xsignature123');
      expect(mockSignMessageV1WalletPersonalSignPost).toHaveBeenCalledWith(
        {
          personalSignRequest: {
            message_base64: Buffer.from(message, 'utf-8').toString('base64'),
            chain: 'ETH',
          },
        },
        { headers: { Authorization: `Bearer ${mockUser.idToken}` } },
      );
    });

    it('should sign Uint8Array message successfully', async () => {
      const message = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const signature = await magicTEESigner.signMessage(message);

      expect(signature).toBe('0xsignature123');
      expect(mockSignMessageV1WalletPersonalSignPost).toHaveBeenCalledWith(
        {
          personalSignRequest: {
            message_base64: Buffer.from(`0x${Buffer.from(message).toString('hex')}`, 'utf-8').toString('base64'),
            chain: 'ETH',
          },
        },
        { headers: { Authorization: `Bearer ${mockUser.idToken}` } },
      );
    });

    it('should throw error when user is not logged in', async () => {
      mockAuthManager.getUser.mockResolvedValue(null);

      await expect(magicTEESigner.signMessage('test')).rejects.toThrow(
        new PassportError(
          'User has been logged out',
          PassportErrorType.NOT_LOGGED_IN_ERROR,
        ),
      );
    });

    it('should handle API errors gracefully', async () => {
      const apiError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: 'Invalid signature request' },
        },
      };
      (isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockSignMessageV1WalletPersonalSignPost.mockRejectedValue(apiError);

      await expect(magicTEESigner.signMessage('test')).rejects.toThrow(
        'Failed to create signature using EOA with status 400: {"message":"Invalid signature request"}',
      );
    });

    it('should handle network errors gracefully', async () => {
      const networkError = {
        isAxiosError: true,
        message: 'Network Error',
      };
      (isAxiosError as unknown as jest.Mock).mockReturnValue(true);
      mockSignMessageV1WalletPersonalSignPost.mockRejectedValue(networkError);

      await expect(magicTEESigner.signMessage('test')).rejects.toThrow(
        'Failed to create signature using EOA: Network Error',
      );
    });

    it('should handle non-axios errors gracefully', async () => {
      const genericError = new Error('Generic error');
      (isAxiosError as unknown as jest.Mock).mockReturnValue(false);
      mockSignMessageV1WalletPersonalSignPost.mockRejectedValue(genericError);

      await expect(magicTEESigner.signMessage('test')).rejects.toThrow(
        'Failed to create signature using EOA: Generic error',
      );
    });

    it('should track metrics for message signing', async () => {
      await magicTEESigner.signMessage('test');

      expect(withMetricsAsync).toHaveBeenCalledWith(
        expect.any(Function),
        'magicPersonalSign',
      );
      expect(trackDuration).toHaveBeenCalledWith(
        'passport',
        'testFlow',
        expect.any(Number),
      );
    });

    it('should ensure wallet is created before signing', async () => {
      await magicTEESigner.signMessage('test');

      // Should call both createWallet and signMessage
      expect(mockCreateWalletV1WalletPost).toHaveBeenCalled();
      expect(mockSignMessageV1WalletPersonalSignPost).toHaveBeenCalled();
    });
  });

  describe('error handling in createWallet', () => {
    it('should reset createWalletPromise on error', async () => {
      mockAuthManager.getUser.mockResolvedValue(mockUser);

      const error = new Error('API Error');
      mockCreateWalletV1WalletPost
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockWalletResponse);

      // First call should fail
      await expect(magicTEESigner.getAddress()).rejects.toThrow('API Error');

      // Second call should succeed (promise should be reset)
      const address = await magicTEESigner.getAddress();
      expect(address).toBe(mockUserZkEvm.zkEvm.userAdminAddress);
      expect(mockCreateWalletV1WalletPost).toHaveBeenCalledTimes(2);
    });
  });

  describe('headers generation', () => {
    it('should generate correct headers for authenticated user', async () => {
      mockAuthManager.getUser.mockResolvedValue(mockUser);
      mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);

      await magicTEESigner.getAddress();

      expect(mockCreateWalletV1WalletPost).toHaveBeenCalledWith(
        expect.any(Object),
        {
          headers: {
            Authorization: `Bearer ${mockUser.idToken}`,
          },
        },
      );
    });

    it('should throw error when trying to generate headers for null user', async () => {
      mockAuthManager.getUser.mockResolvedValue(null);

      await expect(magicTEESigner.getAddress()).rejects.toThrow(
        new PassportError(
          'User has been logged out',
          PassportErrorType.NOT_LOGGED_IN_ERROR,
        ),
      );
    });
  });

  describe('wallet address validation', () => {
    describe('IMX user wallet address validation', () => {
      it('should throw error when IMX user wallet address does not match TEE wallet address', async () => {
        const imxUserWithMismatchedAddress = {
          ...mockUserImx,
          imx: {
            ...mockUserImx.imx,
            userAdminAddress: '0xdifferentaddress123',
          },
        };

        mockAuthManager.getUser.mockResolvedValue(imxUserWithMismatchedAddress);
        mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);

        await expect(magicTEESigner.getAddress()).rejects.toThrow(
          new PassportError(
            'Wallet address mismatch.'
              + `Rollup: IMX, TEE address: ${mockWalletResponse.data.public_address}, `
              + `profile address: ${imxUserWithMismatchedAddress.imx.userAdminAddress}`,
            PassportErrorType.WALLET_CONNECTION_ERROR,
          ),
        );
      });

      it('should succeed when IMX user wallet address matches TEE wallet address', async () => {
        const imxUserWithMatchingAddress = {
          ...mockUserImx,
          imx: {
            ...mockUserImx.imx,
            userAdminAddress: mockWalletResponse.data.public_address,
          },
        };

        mockAuthManager.getUser.mockResolvedValue(imxUserWithMatchingAddress);
        mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);

        const address = await magicTEESigner.getAddress();

        expect(address).toBe(mockWalletResponse.data.public_address);
        expect(mockCreateWalletV1WalletPost).toHaveBeenCalledWith(
          {
            createWalletRequestModel: {
              chain: 'ETH',
            },
          },
          { headers: { Authorization: `Bearer ${imxUserWithMatchingAddress.idToken}` } },
        );
      });
    });

    describe('zkEVM user wallet address validation', () => {
      it('should throw error when zkEVM user wallet address does not match TEE wallet address', async () => {
        const zkEvmUserWithMismatchedAddress = {
          ...mockUserZkEvm,
          zkEvm: {
            ...mockUserZkEvm.zkEvm,
            userAdminAddress: '0xdifferentaddress456',
          },
        };

        mockAuthManager.getUser.mockResolvedValue(zkEvmUserWithMismatchedAddress);
        mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);

        await expect(magicTEESigner.getAddress()).rejects.toThrow(
          new PassportError(
            'Wallet address mismatch.'
              + `Rollup: zkEVM, TEE address: ${mockWalletResponse.data.public_address}, `
              + `profile address: ${zkEvmUserWithMismatchedAddress.zkEvm.userAdminAddress}`,
            PassportErrorType.WALLET_CONNECTION_ERROR,
          ),
        );
      });

      it('should succeed when zkEVM user wallet address matches TEE wallet address', async () => {
        const zkEvmUserWithMatchingAddress = {
          ...mockUserZkEvm,
          zkEvm: {
            ...mockUserZkEvm.zkEvm,
            userAdminAddress: mockWalletResponse.data.public_address,
          },
        };

        mockAuthManager.getUser.mockResolvedValue(zkEvmUserWithMatchingAddress);
        mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);

        const address = await magicTEESigner.getAddress();

        expect(address).toBe(mockWalletResponse.data.public_address);
        expect(mockCreateWalletV1WalletPost).toHaveBeenCalledWith(
          {
            createWalletRequestModel: {
              chain: 'ETH',
            },
          },
          { headers: { Authorization: `Bearer ${zkEvmUserWithMatchingAddress.idToken}` } },
        );
      });
    });

    describe('regular user (no wallet validation)', () => {
      it('should succeed for regular user without IMX or zkEVM properties', async () => {
        mockAuthManager.getUser.mockResolvedValue(mockUser);
        mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);

        const address = await magicTEESigner.getAddress();

        expect(address).toBe(mockWalletResponse.data.public_address);
        expect(mockCreateWalletV1WalletPost).toHaveBeenCalledWith(
          {
            createWalletRequestModel: {
              chain: 'ETH',
            },
          },
          { headers: { Authorization: `Bearer ${mockUser.idToken}` } },
        );
      });
    });

    describe('wallet address validation in signMessage', () => {
      it('should validate wallet address before signing message for IMX user', async () => {
        const imxUserWithMismatchedAddress = {
          ...mockUserImx,
          imx: {
            ...mockUserImx.imx,
            userAdminAddress: '0xdifferentaddress123',
          },
        };

        mockAuthManager.getUser.mockResolvedValue(imxUserWithMismatchedAddress);
        mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);

        await expect(magicTEESigner.signMessage('test message')).rejects.toThrow(
          new PassportError(
            'Wallet address mismatch.'
              + `Rollup: IMX, TEE address: ${mockWalletResponse.data.public_address}, `
              + `profile address: ${imxUserWithMismatchedAddress.imx.userAdminAddress}`,
            PassportErrorType.WALLET_CONNECTION_ERROR,
          ),
        );
      });

      it('should validate wallet address before signing message for zkEVM user', async () => {
        const zkEvmUserWithMismatchedAddress = {
          ...mockUserZkEvm,
          zkEvm: {
            ...mockUserZkEvm.zkEvm,
            userAdminAddress: '0xdifferentaddress456',
          },
        };

        mockAuthManager.getUser.mockResolvedValue(zkEvmUserWithMismatchedAddress);
        mockCreateWalletV1WalletPost.mockResolvedValue(mockWalletResponse);

        await expect(magicTEESigner.signMessage('test message')).rejects.toThrow(
          new PassportError(
            'Wallet address mismatch.'
              + `Rollup: zkEVM, TEE address: ${mockWalletResponse.data.public_address}, `
              + `profile address: ${zkEvmUserWithMismatchedAddress.zkEvm.userAdminAddress}`,
            PassportErrorType.WALLET_CONNECTION_ERROR,
          ),
        );
      });
    });
  });
});
