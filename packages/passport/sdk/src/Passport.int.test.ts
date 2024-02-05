import { Magic } from 'magic-sdk';
import { UserManager } from 'oidc-client-ts';
import { TransactionRequest } from '@ethersproject/providers';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { OidcConfiguration } from 'types';
import { IMXClient } from '@imtbl/x-client';
import { mockValidIdToken } from './utils/token.test';
import { buildPrivateVars, Passport } from './Passport';
import { RequestArguments } from './zkEvm/types';
import {
  closeMswWorker,
  useMswHandlers,
  resetMswHandlers,
  transactionHash,
  mswHandlers,
} from './mocks/zkEvm/msw';
import { JsonRpcError, RpcErrorCode } from './zkEvm/JsonRpcError';
import GuardianClient from './guardian/guardian';
import { chainIdHex } from './test/mocks';

jest.mock('./guardian/guardian');

jest.mock('magic-sdk');
jest.mock('oidc-client-ts');
jest.mock('@imtbl/x-client');

const mockOidcUser = {
  profile: {
    sub: 'sub123',
    email: 'test@example.com',
    nickname: 'test',
  },
  expired: false,
  id_token: mockValidIdToken,
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

const oidcConfiguration: OidcConfiguration = {
  clientId: '11111',
  redirectUri: 'https://test.com',
  logoutRedirectUri: 'https://test.com',
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
    (GuardianClient as jest.Mock).mockImplementation(() => ({
      validateEVMTransaction: jest.fn(),
      withConfirmationScreen: () => (task: () => void) => task(),
    }));
    (Magic as jest.Mock).mockImplementation(() => ({
      openid: {
        loginWithOIDC: mockLoginWithOidc,
      },
      rpcProvider: {
        request: mockMagicRequest,
      },
      preload: jest.fn(),
    }));
  });

  afterEach(() => {
    resetMswHandlers();
  });

  afterAll(async () => {
    closeMswWorker();
  });

  describe('buildPrivateVars', () => {
    describe('when the env is prod', () => {
      it('sets the prod x URL as the basePath on imxApiClients', () => {
        const baseConfig = new ImmutableConfiguration({
          environment: Environment.PRODUCTION,
        });
        const privateVars = buildPrivateVars({
          baseConfig,
          ...oidcConfiguration,
        });
        expect(privateVars.passportImxProviderFactory.imxApiClients.config.basePath).toEqual('https://api.x.immutable.com');
      });
    });

    describe('when the env is sandbox', () => {
      it('sets the sandbox x URL as the basePath on imxApiClients', () => {
        const baseConfig = new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        });
        const privateVars = buildPrivateVars({
          baseConfig,
          ...oidcConfiguration,
        });
        expect(privateVars.passportImxProviderFactory.imxApiClients.config.basePath).toEqual('https://api.sandbox.x.immutable.com');
      });
    });

    describe('when overrides are provided', () => {
      it('sets imxPublicApiDomain as the basePath on imxApiClients', async () => {
        const baseConfig = new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        });
        const immutableXClient = new IMXClient({
          baseConfig,
        });
        const privateVars = buildPrivateVars({
          baseConfig,
          overrides: {
            authenticationDomain: 'authenticationDomain123',
            imxPublicApiDomain: 'guardianDomain123',
            magicProviderId: 'providerId123',
            magicPublishableApiKey: 'publishableKey123',
            passportDomain: 'customDomain123',
            relayerUrl: 'relayerUrl123',
            zkEvmRpcUrl: 'zkEvmRpcUrl123',
            indexerMrBasePath: 'indexerMrBasePath123',
            orderBookMrBasePath: 'orderBookMrBasePath123',
            passportMrBasePath: 'passportMrBasePath123',
            immutableXClient,
          },
          ...oidcConfiguration,
        });
        expect(privateVars.passportImxProviderFactory.imxApiClients.config.basePath).toEqual('guardianDomain123');
      });
    });
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
          mockSigninSilent.mockResolvedValueOnce(mockOidcUserZkevm);
          useMswHandlers([
            mswHandlers.counterfactualAddress.success,
            mswHandlers.api.chains.success,
          ]);

          const zkEvmProvider = getZkEvmProvider();

          const accounts = await zkEvmProvider.request({
            method: 'eth_requestAccounts',
          });

          expect(accounts).toEqual([mockOidcUserZkevm.profile.passport.zkevm_eth_address]);
          expect(mockGetUser).toHaveBeenCalledTimes(1);
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
              mswHandlers.api.chains.success,
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
          mswHandlers.guardian.evaluateTransaction.success,
        ]);
        mockMagicRequest.mockImplementation(({ method }: RequestArguments) => {
          switch (method) {
            case 'eth_chainId': {
              return Promise.resolve(chainIdHex);
            }
            case 'eth_accounts': {
              return Promise.resolve([magicWalletAddress]);
            }
            case 'personal_sign': {
              return Promise.resolve('0x6b168cf5d90189eaa51d02ff3fa8ffc8956b1ea20fdd34280f521b1acca092305b9ace24e643fe64a30c528323065f5b77e1fb4045bd330aad01e7b9a07591f91b');
            }
            default: {
              throw new Error(`Unexpected method: ${method}`);
            }
          }
        });
        mockGetUser.mockResolvedValue(mockOidcUserZkevm);

        const zkEvmProvider = getZkEvmProvider();

        await zkEvmProvider.request({
          method: 'eth_requestAccounts',
        });
        const transaction: TransactionRequest = {
          to: transferToAddress,
          value: '5000000000000000',
          data: '0x00',
        };
        const result = await zkEvmProvider.request({
          method: 'eth_sendTransaction',
          params: [transaction],
        });

        expect(result).toEqual(transactionHash);
        expect(mockGetUser).toHaveBeenCalledTimes(1);
      });
    });

    describe('eth_accounts', () => {
      it('returns no addresses if the user is not logged in', async () => {
        const zkEvmProvider = getZkEvmProvider();
        const accounts = await zkEvmProvider.request({
          method: 'eth_accounts',
        });
        expect(accounts).toEqual([]);
      });

      it('returns the user\'s ether key if the user is logged in', async () => {
        mockGetUser.mockResolvedValue(mockOidcUserZkevm);
        useMswHandlers([
          mswHandlers.jsonRpcProvider.success,
        ]);

        const zkEvmProvider = getZkEvmProvider();

        const loggedInAccounts = await zkEvmProvider.request({
          method: 'eth_requestAccounts',
        });

        const accounts = await zkEvmProvider.request({
          method: 'eth_accounts',
        });

        expect(accounts).toEqual(loggedInAccounts);
      });
    });
  });
});
