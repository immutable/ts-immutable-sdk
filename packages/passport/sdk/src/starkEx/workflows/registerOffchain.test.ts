import { AxiosError } from 'axios';
import { ImxApiClients } from '@imtbl/generated-clients';
import { StarkSigner } from '@imtbl/x-client';
import AuthManager from '../../authManager';
import { mockUserImx } from '../../test/mocks';
import registerPassportStarkEx from './registration';
import { PassportError, PassportErrorType } from '../../errors/passportError';
import registerOffchain from './registerOffchain';
import { Signer } from 'ethers';
import { BrowserProvider } from 'ethers';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  BrowserProvider: jest.fn()
}));
jest.mock('./registration');
jest.mock('@imtbl/generated-clients');

const mockGetSigner = jest.fn();

const mockLogin = jest.fn();

const mockForceUserRefresh = jest.fn();
const mockAuthManager = {
  login: mockLogin,
  forceUserRefresh: mockForceUserRefresh,
} as unknown as AuthManager;

const mockEthSigner = { getAddress: jest.fn() } as unknown as Signer;

const mockStarkSigner = {
  signMessage: jest.fn(),
  getAddress: jest.fn(),
  getYCoordinate: jest.fn(),
} as unknown as StarkSigner;

const mockReturnHash = '0x123';

mockGetSigner.mockReturnValue(mockEthSigner);
(BrowserProvider as unknown as jest.Mock).mockReturnValue({
  getSigner: mockGetSigner,
});

(registerPassportStarkEx as jest.Mock).mockResolvedValue(mockReturnHash);

describe('registerOffchain', () => {
  describe('when we exceed the number of attempts to obtain a user with the correct metadata', () => {
    it('should throw an error', async () => {
      const imxApiClients = new ImxApiClients({} as any);

      await (expect(() => registerOffchain(
        mockEthSigner,
        mockStarkSigner,
        mockUserImx,
        mockAuthManager,
        imxApiClients,
      )).rejects.toThrow(new PassportError(
        'Retry failed',
        PassportErrorType.REFRESH_TOKEN_ERROR,
      )));

      expect(registerPassportStarkEx).toHaveBeenCalledWith(
        { ethSigner: mockEthSigner, starkSigner: mockStarkSigner, imxApiClients },
        mockUserImx.accessToken,
      );

      expect(mockAuthManager.forceUserRefresh).toHaveBeenCalledTimes(4);
    });
  });

  describe('when registration is successful', () => {
    it('should register the user and return the transaction hash as a string', async () => {
      const imxApiClients = new ImxApiClients({} as any);
      mockForceUserRefresh.mockResolvedValue(mockUserImx);

      const txHash = await registerOffchain(
        mockEthSigner,
        mockStarkSigner,
        mockUserImx,
        mockAuthManager,
        imxApiClients,
      );

      expect(txHash).toEqual(mockReturnHash);
      expect(registerPassportStarkEx).toHaveBeenCalledWith({
        ethSigner: mockEthSigner,
        starkSigner: mockStarkSigner,
        imxApiClients,
      }, mockUserImx.accessToken);
      expect(mockAuthManager.forceUserRefresh).toHaveBeenCalledTimes(1);
    });

    describe('when registration fails due to a 409 conflict', () => {
      it('should refresh the user to get the updated token', async () => {
        const imxApiClients = new ImxApiClients({} as any);
        // create axios error with status 409
        const err = new AxiosError('User already registered');
        err.response = {
          ...err.response,
          status: 409,
        } as typeof err.response;

        (registerPassportStarkEx as jest.Mock).mockRejectedValue(err);
        mockForceUserRefresh.mockResolvedValue(mockUserImx);

        const hash = await registerOffchain(
          mockEthSigner,
          mockStarkSigner,
          mockUserImx,
          mockAuthManager,
          imxApiClients,
        );

        expect(mockAuthManager.forceUserRefresh).toHaveBeenCalledTimes(1);
        expect(hash).toEqual({ tx_hash: '' });
      });
    });
  });
});
