import { Magic } from 'magic-sdk';
import { UserManager } from 'oidc-client-ts';
import { TransactionRequest } from '@ethersproject/providers';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { Passport } from './Passport';
import { RequestArguments } from './zkEvm/types';
import { setupMsw } from './mocks/msw';

jest.mock('magic-sdk');
jest.mock('oidc-client-ts');

const mockOidcUser = {
  profile: {
    sub: 'sub123',
    email: 'test@example.com',
    nickname: 'test',
    passport: {
      ether_key: '0x001',
    },
  },
  expired: false,
  id_token: 'idToken123',
  access_token: 'accessToken123',
  refresh_token: 'refreshToken123',
};
const relayerId = '0x745';
const chainId = '13372';

const mswWorker = setupMsw({
  relayerId,
  chainId,
});

describe('Passport', () => {
  const mockSigninPopup = jest.fn();
  const mockGetUser = jest.fn();
  const mockLoginWithOidc = jest.fn();
  const mockMagicRequest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (UserManager as jest.Mock).mockImplementation(() => ({
      signinPopup: mockSigninPopup,
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
    mswWorker.resetHandlers();
  });

  beforeAll(() => {
    mswWorker.listen({
      onUnhandledRequest(req) {
        expect(req).not.toBeDefined();
      },
    });
  });

  afterAll(() => {
    mswWorker.close();
  });

  describe('zkEvm', () => {
    it('successfully initialises the zkEvm provider and sends a transaction', async () => {
      const magicWalletAddress = '0x3082e7c88f1c8b4e24be4a75dee018ad362d84d4';
      const smartContractWalletAddress = '0x7EEC32793414aAb720a90073607733d9e7B0ecD0';
      const transferToAddress = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
      const transactionHash = '0x867';

      const expectedMagicRequestCalls: { method: string, returnValue: any }[] = [
        { method: 'eth_accounts', returnValue: [magicWalletAddress] },
        { method: 'personal_sign', returnValue: '0x6b168cf5d90189eaa51d02ff3fa8ffc8956b1ea20fdd34280f521b1acca092305b9ace24e643fe64a30c528323065f5b77e1fb4045bd330aad01e7b9a07591f91b' },
        { method: 'eth_accounts', returnValue: [magicWalletAddress] },
        { method: 'personal_sign', returnValue: '0xa29c8ff87dbbf59f4f46ea3006e5b27980fa4262668ad0bc1f0b24bc01a727e92ef80db88e391707bec7bdf1e1479d2fa994b732e0cb28c9438c1d0e7e67b52d1b' },
      ];

      mockMagicRequest.mockImplementation(({ method }: RequestArguments) => {
        const expectedCall = expectedMagicRequestCalls.shift();
        expect(method).toEqual(expectedCall?.method);
        return Promise.resolve(expectedCall?.returnValue);
      });
      mockSigninPopup.mockResolvedValue(mockOidcUser);
      mockGetUser.mockResolvedValue(mockOidcUser);

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
      const zkEvmProvider = passport.connectEvm();

      const accounts = await zkEvmProvider.request({
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

      expect(accounts).toEqual([smartContractWalletAddress]);
      expect(result).toEqual(transactionHash);
    });
  });
});
