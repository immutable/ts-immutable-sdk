import { ImmutableXClient } from '@imtbl/immutablex-client';
import { Web3Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';
import AuthManager from 'authManager';
import { mockUserImx } from 'test/mocks';
import { AxiosError } from 'axios';
import registerPassportStarkEx from './registration';
import { PassportError, PassportErrorType } from '../../errors/passportError';
import registerOffchain from './registerOffchain';

jest.mock('@ethersproject/providers');
jest.mock('./registration');

const mockGetSigner = jest.fn();

const mockLogin = jest.fn();

const mockForceUserRefresh = jest.fn();
const mockAuthManager = {
  login: mockLogin,
  forceUserRefresh: mockForceUserRefresh,
} as unknown as AuthManager;

const mockImmutableXClient = {
  usersApi: {},
} as ImmutableXClient;

const mockEthSigner = { getAddress: jest.fn() } as unknown as Signer;

const mockStarkSigner = { getAddress: jest.fn() } as unknown as Signer;

const mockReturnHash = '0x123';

mockGetSigner.mockReturnValue(mockEthSigner);
(Web3Provider as unknown as jest.Mock).mockReturnValue({
  getSigner: mockGetSigner,
});

(registerPassportStarkEx as jest.Mock).mockResolvedValue(mockReturnHash);

describe('registerOffchain', () => {
  describe('when we exceed the number of attempts to obtain a user with the correct metadata', () => {
    it('should throw an error', async () => {
      await (expect(() => registerOffchain(
        mockEthSigner,
        mockStarkSigner,
        mockUserImx,
        mockAuthManager,
        mockImmutableXClient.usersApi,
      )).rejects.toThrow(new PassportError(
        'Retry failed',
        PassportErrorType.REFRESH_TOKEN_ERROR,
      )));

      expect(registerPassportStarkEx).toHaveBeenCalledWith(
        { ethSigner: mockEthSigner, starkSigner: mockStarkSigner, usersApi: mockImmutableXClient.usersApi },
        mockUserImx.accessToken,
      );

      expect(mockAuthManager.forceUserRefresh).toHaveBeenCalledTimes(4);
    });
  });

  describe('when registration is successful', () => {
    it('should register the user and return the transaction hash as a string', async () => {
      mockForceUserRefresh.mockResolvedValue(mockUserImx);

      const txHash = await registerOffchain(
        mockEthSigner,
        mockStarkSigner,
        mockUserImx,
        mockAuthManager,
        mockImmutableXClient.usersApi,
      );

      expect(txHash).toEqual(mockReturnHash);
      expect(registerPassportStarkEx).toHaveBeenCalledWith({
        ethSigner: mockEthSigner,
        starkSigner: mockStarkSigner,
        usersApi: mockImmutableXClient.usersApi,
      }, mockUserImx.accessToken);
      expect(mockAuthManager.forceUserRefresh).toHaveBeenCalledTimes(1);
    });

    describe('when registration fails due to a 409 conflict', () => {
      it('should refresh the user to get the updated token', async () => {
        // create axios error with status 409
        const err = new AxiosError('User already registered');
        err.status = 409;

        (registerPassportStarkEx as jest.Mock).mockRejectedValue(err);
        mockForceUserRefresh.mockResolvedValue(mockUserImx);

        const hash = await registerOffchain(
          mockEthSigner,
          mockStarkSigner,
          mockUserImx,
          mockAuthManager,
          mockImmutableXClient.usersApi,
        );

        expect(mockAuthManager.forceUserRefresh).toHaveBeenCalledTimes(1);
        expect(hash).toEqual({ tx_hash: '' });
      });
    });
  });
});
