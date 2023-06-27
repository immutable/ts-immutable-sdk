import { Magic } from 'magic-sdk';
import { UserManager } from 'oidc-client-ts';
import { TransactionRequest } from '@ethersproject/providers';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { Passport } from './Passport';
import { RequestArguments } from './zkEvm/types';
import {
  closeMswWorker,
  useMswHandlers,
  resetMswHandlers,
  transactionHash,
  mswHandlers,
} from './mocks/zkEvm/msw';
import { JsonRpcError, RpcErrorCode } from './zkEvm/JsonRpcError';

jest.mock('magic-sdk');
jest.mock('oidc-client-ts');

const mockOidcUser = {
  profile: {
    sub: 'sub123',
    email: 'test@example.com',
    nickname: 'test',
  },
  expired: false,
  id_token: 'idToken123',
  access_token: 'accessToken123',
  refresh_token: 'refreshToken123',
};
const mockOidcUserZkevm = {
  ...mockOidcUser,
  profile: {
    ...mockOidcUser.profile,
    passport: {
      zkevm_eth_address: '0x7EEC32793414aAb720a90073607733d9e7B0ecD0',
      zkevm_user_admin_address: '0x123',
    },
  },
};

const getZkEvmProvider = () => {
  const passport = new Passport({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
    audience: 'platform_api',
    clientId: 'clientId123',
    logoutRedirectUri: 'https://example.com/logout',
    redirectUri: 'https://example.com/login',
    scope: 'openid offline_access profile email transact',
  });

  return passport.connectEvm();
};

describe('Passport', () => {
  const mockSigninPopup = jest.fn();
  const mockSigninSilent = jest.fn();
  const mockGetUser = jest.fn();
  const mockLoginWithOidc = jest.fn();
  const mockMagicRequest = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (UserManager as jest.Mock).mockImplementation(() => ({
      signinPopup: mockSigninPopup,
      signinSilent: mockSigninSilent,
      getUser: mockGetUser,
    }));
    (Magic as jest.Mock).mockImplementation(() => ({
      openid: {
        loginWithOIDC: mockLoginWithOidc,
      },
      rpcProvider: {
        request: mockMagicRequest,
      },
    }));
    resetMswHandlers();
  });

  afterAll(() => {
    closeMswWorker();
  });

  describe('zkEvm', () => {
    const magicWalletAddress = '0x3082e7c88f1c8b4e24be4a75dee018ad362d84d4';

    describe('eth_requestAccounts', () => {
      describe('when the user has registered before', () => {
        it('returns the users ether key', async () => {
          mockGetUser.mockResolvedValue(mockOidcUserZkevm);
          useMswHandlers([
            mswHandlers.jsonRpcProvider.success,
          ]);

          const zkEvmProvider = getZkEvmProvider();

          const accounts = await zkEvmProvider.request({
            method: 'eth_requestAccounts',
          });

          expect(accounts).toEqual([mockOidcUserZkevm.profile.passport.zkevm_eth_address]);
          expect(mockGetUser).toHaveBeenCalledTimes(1);
        });
      });

      describe('when the user is logging in for the first time', () => {
        beforeEach(() => {
          mockMagicRequest.mockImplementationOnce(({ method }: RequestArguments) => {
            expect(method).toEqual('eth_accounts');
            return Promise.resolve([magicWalletAddress]);
          });
          mockMagicRequest.mockImplementationOnce(({ method }: RequestArguments) => {
            expect(method).toEqual('eth_accounts');
            return Promise.resolve([magicWalletAddress]);
          });
          mockMagicRequest.mockImplementationOnce(({ method }: RequestArguments) => {
            expect(method).toEqual('personal_sign');
            return Promise.resolve('0x05107ba1d76d8a5ba3415df36eb5af65f4c670778eed257f5704edcb03802cfc662f66b76e5aa032c2305e61ce77ed858bc9850f8c945ab6c3cb6fec796aae421c');
          });
        });

        it('registers the user and returns the ether key', async () => {
          mockSigninPopup.mockResolvedValue(mockOidcUser);
          mockGetUser.mockResolvedValueOnce(null);
          mockGetUser.mockResolvedValueOnce(mockOidcUser);
          mockSigninSilent.mockResolvedValue(mockOidcUserZkevm);
          useMswHandlers([
            mswHandlers.counterfactualAddress.success,
            mswHandlers.jsonRpcProvider.success,
          ]);

          const zkEvmProvider = getZkEvmProvider();

          const accounts = await zkEvmProvider.request({
            method: 'eth_requestAccounts',
          });

          expect(accounts).toEqual([mockOidcUserZkevm.profile.passport.zkevm_eth_address]);
          expect(mockGetUser).toHaveBeenCalledTimes(2);
          expect(mockSigninSilent).toHaveBeenCalledTimes(1);
          expect(mockMagicRequest).toHaveBeenCalledTimes(3);
        });

        describe('when the registration request fails', () => {
          it('throws an error', async () => {
            mockSigninPopup.mockResolvedValue(mockOidcUser);
            mockGetUser.mockResolvedValueOnce(null);
            mockGetUser.mockResolvedValueOnce(mockOidcUser);
            mockSigninSilent.mockResolvedValue(mockOidcUserZkevm);
            useMswHandlers([
              mswHandlers.counterfactualAddress.internalServerError,
            ]);

            const zkEvmProvider = getZkEvmProvider();

            await expect(async () => zkEvmProvider.request({
              method: 'eth_requestAccounts',
            })).rejects.toEqual(new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, 'Failed to create counterfactual address: AxiosError: Request failed with status code 500'));
          });
        });
      });
    });

    describe('eth_sendTransaction', () => {
      it('successfully initialises the zkEvm provider and sends a transaction', async () => {
        const transferToAddress = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';

        useMswHandlers([
          mswHandlers.counterfactualAddress.success,
          mswHandlers.jsonRpcProvider.success,
          mswHandlers.relayer.success,
        ]);
        mockMagicRequest.mockImplementationOnce(({ method }: RequestArguments) => {
          expect(method).toEqual('eth_accounts');
          return Promise.resolve([magicWalletAddress]);
        });
        mockMagicRequest.mockImplementationOnce(({ method }: RequestArguments) => {
          expect(method).toEqual('personal_sign');
          return Promise.resolve('0x6b168cf5d90189eaa51d02ff3fa8ffc8956b1ea20fdd34280f521b1acca092305b9ace24e643fe64a30c528323065f5b77e1fb4045bd330aad01e7b9a07591f91b');
        });
        mockMagicRequest.mockImplementationOnce(({ method }: RequestArguments) => {
          expect(method).toEqual('eth_accounts');
          return Promise.resolve([magicWalletAddress]);
        });
        mockMagicRequest.mockImplementationOnce(({ method }: RequestArguments) => {
          expect(method).toEqual('personal_sign');
          return Promise.resolve('0xa29c8ff87dbbf59f4f46ea3006e5b27980fa4262668ad0bc1f0b24bc01a727e92ef80db88e391707bec7bdf1e1479d2fa994b732e0cb28c9438c1d0e7e67b52d1b');
        });
        mockGetUser.mockResolvedValue(mockOidcUserZkevm);

        const zkEvmProvider = getZkEvmProvider();

        await zkEvmProvider.request({
          method: 'eth_requestAccounts',
        });
        const transaction: TransactionRequest = {
          to: transferToAddress,
          value: '500000000000000000',
          data: '0x',
        };
        const result = await zkEvmProvider.request({
          method: 'eth_sendTransaction',
          params: [transaction],
        });

        expect(result).toEqual(transactionHash);
        expect(mockGetUser).toHaveBeenCalledTimes(1);
      });
    });
  });
});
