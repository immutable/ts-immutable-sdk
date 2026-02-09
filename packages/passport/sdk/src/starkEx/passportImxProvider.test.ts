import { IMXClient } from '@imtbl/x-client';
import { ImxApiClients, imx } from '@imtbl/generated-clients';
import { Auth, User } from '@imtbl/auth';
import { GuardianClient, MagicTEESigner } from '@imtbl/wallet';
import { PassportImxProvider } from './passportImxProvider';
import { ImxGuardianClient } from './imxGuardianClient';
import registerOffchain from './workflows/registerOffchain';
import { getStarkSigner } from './getStarkSigner';
import { PassportError, PassportErrorType } from '../errors/passportError';

jest.mock('./workflows/registerOffchain');
jest.mock('./getStarkSigner');

describe('PassportImxProvider', () => {
  let provider: PassportImxProvider;
  let mockAuth: jest.Mocked<Auth>;
  let mockMagicTEESigner: jest.Mocked<MagicTEESigner>;
  let mockImxApiClients: ImxApiClients;
  let mockGuardianClient: jest.Mocked<GuardianClient>;
  let mockImxGuardianClient: jest.Mocked<ImxGuardianClient>;

  // Mock user WITHOUT IMX metadata (new user)
  const mockUserWithoutImx: User = {
    expired: false,
    idToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUtb2F1dGgyfDEyMzQ1NiIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInBhc3Nwb3J0Ijp7fX0.test',
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-123',
    profile: {
      sub: 'google-oauth2|123456',
      email: 'user@example.com',
      nickname: 'testuser',
    },
  };

  // Mock user WITH IMX metadata (already registered)
  const mockUserWithImx: User = {
    ...mockUserWithoutImx,
    idToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUtb2F1dGgyfDEyMzQ1NiIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInBhc3Nwb3J0Ijp7ImlteFfldGhfYWRkcmVzcyI6IjB4YWJjIiwiaW14X3N0YXJrX2FkZHJlc3MiOiIweDc4OSIsImlteFf1c2VyX2FkbWluX2FkZHJlc3MiOiIweGRlZiJ9fQ.test',
  };

  beforeEach(() => {
    mockAuth = {
      getUser: jest.fn(),
      forceUserRefresh: jest.fn(),
      eventEmitter: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      } as any,
    } as any;

    mockMagicTEESigner = {
      getAddress: jest.fn().mockResolvedValue('0xmagic'),
    } as any;

    mockImxApiClients = new ImxApiClients({} as any);
    mockGuardianClient = {} as any;
    mockImxGuardianClient = {} as any;

    const mockStarkSigner = {
      getAddress: jest.fn().mockResolvedValue('0xstark'),
      signMessage: jest.fn(),
    };
    (getStarkSigner as jest.Mock).mockResolvedValue(mockStarkSigner);

    provider = new PassportImxProvider({
      auth: mockAuth,
      immutableXClient: new IMXClient({ baseConfig: {} as any }),
      passportEventEmitter: mockAuth.eventEmitter as any,
      magicTEESigner: mockMagicTEESigner,
      imxApiClients: mockImxApiClients,
      guardianClient: mockGuardianClient,
      imxGuardianClient: mockImxGuardianClient,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerOffchain', () => {
    describe('when user is NEW (no IMX metadata)', () => {
      it('should successfully register new user without throwing error', async () => {
        // Arrange: User just logged in, NO IMX metadata yet
        mockAuth.getUser.mockResolvedValue(mockUserWithoutImx);

        const mockRegisterResponse: imx.RegisterUserResponse = {
          tx_hash: '0xabc123',
        };
        (registerOffchain as jest.Mock).mockResolvedValue(mockRegisterResponse);

        // Act
        const result = await provider.registerOffchain();

        // Assert: Should succeed without throwing
        expect(result).toEqual(mockRegisterResponse);

        // Verify workflow was called with User (not UserImx)
        expect(registerOffchain).toHaveBeenCalledWith(
          mockMagicTEESigner,
          expect.anything(), // starkSigner
          mockUserWithoutImx, // User without IMX metadata
          mockAuth,
          mockImxApiClients,
        );
      });
    });

    describe('when user is ALREADY registered (has IMX metadata)', () => {
      it('should call workflow successfully', async () => {
        // Arrange: User already has IMX metadata
        mockAuth.getUser.mockResolvedValue(mockUserWithImx);

        const mockRegisterResponse: imx.RegisterUserResponse = {
          tx_hash: '',
        };
        (registerOffchain as jest.Mock).mockResolvedValue(mockRegisterResponse);

        // Act
        const result = await provider.registerOffchain();

        // Assert
        expect(result).toEqual(mockRegisterResponse);
        expect(registerOffchain).toHaveBeenCalled();
      });
    });
  });

  describe('getAddress', () => {
    it('should throw error when user has no IMX metadata', async () => {
      mockAuth.getUser.mockResolvedValue(mockUserWithoutImx);

      await expect(provider.getAddress()).rejects.toThrow(
        new PassportError(
          'User has not been registered with StarkEx',
          PassportErrorType.USER_NOT_REGISTERED_ERROR,
        ),
      );
    });
  });
});
