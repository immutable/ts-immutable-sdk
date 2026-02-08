import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { Passport } from './Passport';
import { PassportError, PassportErrorType } from './errors/passportError';

const mockAuthInstances: any[] = [];

jest.mock('@imtbl/auth', () => {
  const actual = jest.requireActual('@imtbl/auth');
  const authFactory = jest.fn().mockImplementation(() => {
    const instance = {
      login: jest.fn(),
      loginCallback: jest.fn(),
      logout: jest.fn(),
      getUser: jest.fn(),
      storeTokens: jest.fn(),
      getLogoutUrl: jest.fn(),
      logoutSilentCallback: jest.fn(),
      loginWithPKCEFlow: jest.fn(),
      loginWithPKCEFlowCallback: jest.fn(),
      eventEmitter: { emit: jest.fn(), on: jest.fn() },
      getConfig: jest.fn().mockReturnValue({}),
      forceUserRefresh: jest.fn(),
      forceUserRefreshInBackground: jest.fn(),
    };
    mockAuthInstances.push(instance);
    return instance;
  });

  return {
    ...actual,
    Auth: authFactory,
    isUserZkEvm: jest.fn().mockReturnValue(true),
  };
});

jest.mock('@imtbl/wallet', () => {
  const actual = jest.requireActual('@imtbl/wallet');
  const connectWalletMock = jest.fn();

  return {
    connectWallet: connectWalletMock,
    ZkEvmProvider: jest.fn(),
    GuardianClient: jest.fn(),
    MagicTEESigner: jest.fn(),
    WalletConfiguration: jest.fn(),
    ConfirmationScreen: jest.fn(),
    EvmChain: actual.EvmChain,
    getChainConfig: actual.getChainConfig,
    __mocked: {
      connectWalletMock,
    },
  };
});

const multiRollupInstances: any[] = [];

jest.mock('@imtbl/generated-clients', () => {
  const actual = jest.requireActual('@imtbl/generated-clients');
  const multiRollupApiClientsFactory = jest.fn().mockImplementation(() => {
    const instance = {
      passportProfileApi: {
        getUserInfo: jest.fn().mockResolvedValue({ data: { linked_addresses: [] } }),
        linkWalletV2: jest.fn(),
      },
      guardianApi: {},
    };
    multiRollupInstances.push(instance);
    return instance;
  });

  return {
    ...actual,
    MultiRollupApiClients: multiRollupApiClientsFactory,
    MagicTeeApiClients: jest.fn(),
    createConfig: jest.fn((config) => config),
    imxApiConfig: {
      getSandbox: jest.fn(() => ({ basePath: 'sandbox' })),
      getProduction: jest.fn(() => ({ basePath: 'production' })),
    },
  };
});

jest.mock('@imtbl/metrics', () => {
  const actual = jest.requireActual('@imtbl/metrics');
  const trackErrorMock = jest.fn();
  const trackFlowMock = jest.fn(() => ({
    addEvent: jest.fn(),
    details: { flowId: 'flow-id' },
  }));

  return {
    ...actual,
    trackError: trackErrorMock,
    trackFlow: trackFlowMock,
    setPassportClientId: jest.fn(),
    __mocked: {
      trackErrorMock,
      trackFlowMock,
    },
  };
});

jest.mock('./starkEx', () => {
  const factoryMock = {
    getProvider: jest.fn(),
    getProviderSilent: jest.fn(),
  };
  const passportImxProviderFactory = jest.fn().mockImplementation(() => factoryMock);
  return {
    PassportImxProviderFactory: passportImxProviderFactory,
  };
});

jest.mock('./starkEx/imxGuardianClient', () => ({
  ImxGuardianClient: jest.fn().mockImplementation(() => ({
    evaluateTransaction: jest.fn(),
  })),
}));

jest.mock('./utils/imxUser', () => ({
  toUserImx: jest.fn().mockReturnValue({}),
}));

const { PassportImxProviderFactory: passportImxProviderFactoryMock } = jest.requireMock('./starkEx');
const { __mocked: metricsMocks } = jest.requireMock('@imtbl/metrics');
const { __mocked: walletMocks } = jest.requireMock('@imtbl/wallet');
const { trackErrorMock } = metricsMocks;
const { connectWalletMock } = walletMocks;

describe('Passport', () => {
  const baseConfiguration = new ImmutableConfiguration({
    environment: Environment.SANDBOX,
  });

  const oidcConfiguration = {
    clientId: 'client',
    redirectUri: 'https://example.com/redirect',
    popupRedirectUri: 'https://example.com/popup',
    logoutRedirectUri: 'https://example.com/logout',
    scope: 'openid profile',
  };

  const createPassport = () => new Passport({
    baseConfig: baseConfiguration,
    ...oidcConfiguration,
  });

  const getLatestAuthInstance = () => mockAuthInstances[mockAuthInstances.length - 1];
  const getLatestMultiRollupInstance = () => multiRollupInstances[multiRollupInstances.length - 1];
  const getFactoryInstance = () => (passportImxProviderFactoryMock as jest.Mock).mock.results.slice(-1)[0]?.value;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthInstances.length = 0;
    multiRollupInstances.length = 0;
  });

  describe('connectImx', () => {
    it('returns provider from factory', async () => {
      const passport = createPassport();
      const factory = getFactoryInstance();
      const provider = { kind: 'imx' };
      factory.getProvider.mockResolvedValue(provider);

      const result = await passport.connectImx();

      expect(result).toBe(provider);
      expect(factory.getProvider).toHaveBeenCalledTimes(1);
    });

    it('tracks error when factory throws', async () => {
      const passport = createPassport();
      const factory = getFactoryInstance();
      const error = new Error('boom');
      factory.getProvider.mockRejectedValue(error);

      await expect(passport.connectImx()).rejects.toThrow(error);
      expect(trackErrorMock).toHaveBeenCalledWith('passport', 'connectImx', error, { flowId: 'flow-id' });
    });
  });

  describe('connectImxSilent', () => {
    it('returns null when factory resolves null', async () => {
      const passport = createPassport();
      const factory = getFactoryInstance();
      factory.getProviderSilent.mockResolvedValue(null);

      const result = await passport.connectImxSilent();

      expect(result).toBeNull();
      expect(factory.getProviderSilent).toHaveBeenCalledTimes(1);
    });
  });

  describe('connectEvm', () => {
    it('returns provider from connectWallet', async () => {
      const provider = { kind: 'zkEvm' };
      connectWalletMock.mockResolvedValue(provider);
      const passport = createPassport();

      const result = await passport.connectEvm();

      expect(result).toBe(provider);
      expect(connectWalletMock).toHaveBeenCalledWith(expect.objectContaining({
        announceProvider: true,
      }));
    });

    it('passes announceProvider option through', async () => {
      connectWalletMock.mockResolvedValue({ kind: 'zkEvm' });
      const passport = createPassport();

      await passport.connectEvm({ announceProvider: false });

      expect(connectWalletMock).toHaveBeenCalledWith(expect.objectContaining({
        announceProvider: false,
      }));
    });

    it('uses zkEVM chain config by default', async () => {
      connectWalletMock.mockResolvedValue({ kind: 'zkEvm' });
      const passport = createPassport();

      await passport.connectEvm({ announceProvider: true });

      expect(connectWalletMock).toHaveBeenCalledWith(expect.objectContaining({
        chains: expect.arrayContaining([
          expect.objectContaining({
            chainId: 13473, // zkEVM testnet for SANDBOX
            name: 'Immutable zkEVM Testnet',
          }),
        ]),
        feeTokenSymbol: 'IMX',
      }));
    });

    it('throws error for non-zkEVM chains (not yet implemented)', async () => {
      const { EvmChain: actualEvmChain } = jest.requireActual('@imtbl/wallet');
      const passport = createPassport();

      await expect(
        passport.connectEvm({ announceProvider: true, chain: actualEvmChain.ARBITRUM_ONE }),
      ).rejects.toThrow('Chain arbitrum_one is not yet supported. Only ZKEVM is currently available.');
    });
  });

  describe('login flow', () => {
    it('returns user profile from auth login', async () => {
      const passport = createPassport();
      const auth = getLatestAuthInstance();
      const user = { profile: { sub: 'user-1' } };
      auth.login.mockResolvedValue(user);

      const result = await passport.login();

      expect(result).toEqual(user.profile);
      expect(auth.login).toHaveBeenCalledWith(undefined);
    });

    it('forwards login options to auth', async () => {
      const passport = createPassport();
      const auth = getLatestAuthInstance();
      auth.login.mockResolvedValue(null);

      await passport.login({
        useCachedSession: true,
        useSilentLogin: true,
        useRedirectFlow: true,
      });

      expect(auth.login).toHaveBeenCalledWith({
        useCachedSession: true,
        useSilentLogin: true,
        useRedirectFlow: true,
        directLoginOptions: undefined,
      });
    });

    it('calls loginCallback and logout on auth', async () => {
      const passport = createPassport();
      const auth = getLatestAuthInstance();

      await passport.loginCallback();
      await passport.logout();

      expect(auth.loginCallback).toHaveBeenCalledTimes(1);
      expect(auth.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('token helpers', () => {
    it('getUserInfo returns profile from auth user', async () => {
      const passport = createPassport();
      const auth = getLatestAuthInstance();
      const user = { profile: { sub: 'test', nickname: 'nick' } };
      auth.getUser.mockResolvedValue(user);

      const profile = await passport.getUserInfo();

      expect(profile).toEqual(user.profile);
    });

    it('getIdToken and getAccessToken return from auth user', async () => {
      const passport = createPassport();
      const auth = getLatestAuthInstance();
      const user = { idToken: 'id', accessToken: 'access', profile: { sub: 'sub' } };
      auth.getUser.mockResolvedValue(user);

      await expect(passport.getIdToken()).resolves.toEqual('id');
      await expect(passport.getAccessToken()).resolves.toEqual('access');
    });
  });

  describe('getLinkedAddresses', () => {
    it('returns linked addresses when user exists', async () => {
      const passport = createPassport();
      const auth = getLatestAuthInstance();
      const multiRollup = getLatestMultiRollupInstance();
      auth.getUser.mockResolvedValue({ profile: { sub: 'user' }, accessToken: 'token' });
      multiRollup.passportProfileApi.getUserInfo.mockResolvedValue({
        data: { linked_addresses: ['addr-1'] },
      });

      const addresses = await passport.getLinkedAddresses();

      expect(multiRollup.passportProfileApi.getUserInfo).toHaveBeenCalled();
      expect(addresses).toEqual(['addr-1']);
    });

    it('returns empty array when no user', async () => {
      const passport = createPassport();
      const auth = getLatestAuthInstance();
      auth.getUser.mockResolvedValue(null);

      const addresses = await passport.getLinkedAddresses();

      expect(addresses).toEqual([]);
    });
  });

  describe('linkExternalWallet', () => {
    const linkWalletParams = {
      type: 'MetaMask',
      walletAddress: '0xabc',
      signature: 'sig',
      nonce: 'nonce',
    };

    it('throws when user not logged in', async () => {
      const passport = createPassport();
      const auth = getLatestAuthInstance();
      auth.getUser.mockResolvedValue(null);

      await expect(passport.linkExternalWallet(linkWalletParams)).rejects.toThrow(
        new PassportError('User is not logged in', PassportErrorType.NOT_LOGGED_IN_ERROR),
      );
    });

    it('returns linked wallet response', async () => {
      const passport = createPassport();
      const auth = getLatestAuthInstance();
      const multiRollup = getLatestMultiRollupInstance();
      const linkedWallet = { wallet_address: '0xabc' };
      auth.getUser.mockResolvedValue({
        profile: { sub: 'user' },
        accessToken: 'token',
      });
      multiRollup.passportProfileApi.linkWalletV2.mockResolvedValue({
        data: linkedWallet,
      });

      const result = await passport.linkExternalWallet(linkWalletParams);

      expect(result).toEqual(linkedWallet);
      expect(multiRollup.passportProfileApi.linkWalletV2).toHaveBeenCalled();
    });

    it('maps API error codes to PassportError', async () => {
      const passport = createPassport();
      const auth = getLatestAuthInstance();
      const multiRollup = getLatestMultiRollupInstance();
      auth.getUser.mockResolvedValue({
        profile: { sub: 'user' },
        accessToken: 'token',
      });
      const error = new Error('http error') as Error & { response?: any };
      error.response = { data: { code: 'ALREADY_LINKED', message: 'oops' } };
      multiRollup.passportProfileApi.linkWalletV2.mockRejectedValue(error);

      await expect(passport.linkExternalWallet(linkWalletParams)).rejects.toThrow(
        new PassportError('oops', PassportErrorType.LINK_WALLET_ALREADY_LINKED_ERROR),
      );
      expect(trackErrorMock).toHaveBeenCalledWith('passport', 'linkExternalWallet', error);
    });
  });
});
