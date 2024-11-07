import { Magic } from 'magic-sdk';
import { UserManager } from 'oidc-client-ts';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { IMXClient } from '@imtbl/x-client';
import encode from 'jwt-encode';
import { TransactionRequest } from 'ethers';
import { OidcConfiguration } from './types';
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
import GuardianClient from './guardian';
import { chainIdHex, mockUserZkEvm } from './test/mocks';

jest.mock('./guardian');
jest.mock('magic-sdk');
jest.mock('oidc-client-ts');
jest.mock('@imtbl/x-client');

const authenticationDomain = 'example.com';
const redirectUri = 'example.com';
const logoutRedirectUri = 'example.com';
const clientId = 'clientId123';
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
  id_token: encode({
    passport: {
      zkevm_eth_address: mockUserZkEvm.zkEvm.ethAddress,
      zkevm_user_admin_address: mockUserZkEvm.zkEvm.userAdminAddress,
    },
  }, 'secret'),
};

const oidcConfiguration: OidcConfiguration = {
  clientId,
  redirectUri,
  logoutRedirectUri,
};

const getZkEvmProvider = () => {
  const passport = new Passport({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
    audience: 'platform_api',
    clientId,
    redirectUri,
    logoutRedirectUri,
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
      validateEVMTransaction: jest.fn().mockResolvedValue(undefined),
      withConfirmationScreen: () => (task: () => void) => task(),
    }));
    (Magic as jest.Mock).mockImplementation(() => ({
      openid: { loginWithOIDC: mockLoginWithOidc },
      rpcProvider: { request: mockMagicRequest },
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
        const baseConfig = new ImmutableConfiguration({ environment: Environment.PRODUCTION });

        const privateVars = buildPrivateVars({
          baseConfig,
          ...oidcConfiguration,
        });

        expect(privateVars.passportImxProviderFactory.imxApiClients.config.basePath).toEqual('https://api.x.immutable.com');
      });
    });

    describe('when the env is sandbox', () => {
      it('sets the sandbox x URL as the basePath on imxApiClients', () => {
        const baseConfig = new ImmutableConfiguration({ environment: Environment.SANDBOX });

        const privateVars = buildPrivateVars({
          baseConfig,
          ...oidcConfiguration,
        });

        expect(privateVars.passportImxProviderFactory.imxApiClients.config.basePath).toEqual('https://api.sandbox.x.immutable.com');
      });
    });

    describe('when overrides are provided', () => {
      it('sets imxPublicApiDomain as the basePath on imxApiClients', async () => {
        const baseConfig = new ImmutableConfiguration({ environment: Environment.SANDBOX });
        const immutableXClient = new IMXClient({ baseConfig });
        const overrides = {
          authenticationDomain,
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
        };

        const { passportImxProviderFactory } = buildPrivateVars({
          baseConfig,
          overrides,
          ...oidcConfiguration,
        });

        expect(passportImxProviderFactory.imxApiClients.config.basePath).toEqual(overrides.imxPublicApiDomain);
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
            mswHandlers.rpcProvider.success,
          ]);

          const zkEvmProvider = getZkEvmProvider();

          const accounts = await zkEvmProvider.request({
            method: 'eth_requestAccounts',
          });

          expect(accounts).toEqual([mockUserZkEvm.zkEvm.ethAddress]);
          expect(mockGetUser).toHaveBeenCalledTimes(2);
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

        it.only('registers the user and returns the ether key', async () => {
          mockSigninPopup.mockResolvedValue(mockOidcUser);
          mockSigninSilent.mockResolvedValueOnce(mockOidcUserZkevm);
          useMswHandlers([
            mswHandlers.rpcProvider.success,
            mswHandlers.counterfactualAddress.success,
            mswHandlers.api.chains.success,
          ]);

          const zkEvmProvider = getZkEvmProvider();

          const accounts = await zkEvmProvider.request({
            method: 'eth_requestAccounts',
          });

          // expect(accounts).toEqual([mockUserZkEvm.zkEvm.ethAddress]);
          // expect(mockGetUser).toHaveBeenCalledTimes(3);
        });

        describe('when the registration request fails', () => {
          it('throws an error', async () => {
            mockSigninPopup.mockResolvedValue(mockOidcUser);
            mockGetUser.mockResolvedValueOnce(null);
            mockGetUser.mockResolvedValueOnce(mockOidcUser);
            mockSigninSilent.mockResolvedValue(mockOidcUser);
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
          mswHandlers.rpcProvider.success,
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
        expect(mockGetUser).toHaveBeenCalledTimes(6);
      });

      it('ethSigner is initialised if user logs in after connectEvm', async () => {
        const transferToAddress = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';

        useMswHandlers([
          mswHandlers.counterfactualAddress.success,
          mswHandlers.rpcProvider.success,
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
        mockGetUser.mockResolvedValueOnce(Promise.resolve(null));
        mockSigninPopup.mockResolvedValue(mockOidcUserZkevm);
        mockSigninSilent.mockResolvedValueOnce(mockOidcUserZkevm);

        const passport = new Passport({
          baseConfig: new ImmutableConfiguration({
            environment: Environment.SANDBOX,
          }),
          audience: 'platform_api',
          clientId,
          redirectUri,
          logoutRedirectUri,
          scope: 'openid offline_access profile email transact',
        });

        // user isn't logged in, so wont set signer when provider is instantiated
        // #doc request-accounts
        const provider = passport.connectEvm();
        const accounts = await provider.request({
          method: 'eth_requestAccounts',
        });
        // #enddoc request-accounts

        // user logs in, ethSigner is initialised
        await passport.login();

        mockGetUser.mockResolvedValue(Promise.resolve(mockOidcUserZkevm));

        expect(accounts).toEqual([mockUserZkEvm.zkEvm.ethAddress]);

        const transaction: TransactionRequest = {
          to: transferToAddress,
          value: '5000000000000000',
          data: '0x00',
        };
        const result = await provider.request({
          method: 'eth_sendTransaction',
          params: [transaction],
        });

        expect(result).toEqual(transactionHash);
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
          mswHandlers.rpcProvider.success,
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
