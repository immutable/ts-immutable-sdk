import { ImmutableXClient } from '@imtbl/immutablex-client';
import { Web3Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';
import AuthManager from 'authManager';
import { mockUserImx } from 'test/mocks';
import registerPassportStarkEx from './registration';
import { PassportError, PassportErrorType } from '../../errors/passportError';
import registerStarkEx from './registerStarkEx';

jest.mock('@ethersproject/providers');
jest.mock('./registration');

const mockGetSigner = jest.fn();

const mockLogin = jest.fn();

const mockLoginSilent = jest.fn();

const mockAuthManager = {
  loginSilent: mockLoginSilent,
  login: mockLogin,
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

describe('when we exceed the number of attempts to obtain a user with the correct metadata', () => {
  it('should throw an error', async () => {
    await (expect(() => registerStarkEx(
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

    expect(mockAuthManager.loginSilent).toHaveBeenCalledTimes(4);
    expect(mockAuthManager.loginSilent).toHaveBeenNthCalledWith(1, { forceRefresh: true });
    expect(mockAuthManager.loginSilent).toHaveBeenNthCalledWith(2, { forceRefresh: true });
    expect(mockAuthManager.loginSilent).toHaveBeenNthCalledWith(3, { forceRefresh: true });
    expect(mockAuthManager.loginSilent).toHaveBeenCalledWith({ forceRefresh: true });
  });
});

describe('when registration is successful', () => {
  it('should register the user and return the transaction hash as a string', async () => {
    mockLoginSilent.mockResolvedValue(mockUserImx);
    const txHash = await registerStarkEx(
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
    expect(mockAuthManager.loginSilent).toHaveBeenCalledTimes(1);
    expect(mockAuthManager.loginSilent).toHaveBeenCalledWith({ forceRefresh: true });
  });
});
