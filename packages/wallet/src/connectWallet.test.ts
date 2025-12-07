jest.mock('@imtbl/auth', () => {
  const Auth = jest.fn().mockImplementation(() => ({
    getConfig: jest.fn().mockReturnValue({
      authenticationDomain: 'https://auth.immutable.com',
      passportDomain: 'https://passport.immutable.com',
      oidcConfiguration: {
        clientId: 'client',
        redirectUri: 'https://redirect',
      },
    }),
    getUser: jest.fn().mockResolvedValue({ profile: { sub: 'user' } }),
  }));

  const TypedEventEmitter = jest.fn().mockImplementation(() => ({
    emit: jest.fn(),
    on: jest.fn(),
  }));

  return { Auth, TypedEventEmitter };
});

const multiRollupInstance = {
  guardianApi: {},
};

jest.mock('@imtbl/generated-clients', () => ({
  MultiRollupApiClients: jest.fn().mockImplementation(() => multiRollupInstance),
  MagicTeeApiClients: jest.fn().mockImplementation(() => ({})),
  createConfig: jest.fn((config) => config),
  mr: { GuardianApi: jest.fn().mockImplementation(() => ({})) },
}));

jest.mock('./guardian', () => jest.fn().mockImplementation(() => ({
  getPreferredFeeTokenSymbol: jest.fn().mockReturnValue('IMX'),
})));

jest.mock('./magic/magicTEESigner', () => jest.fn().mockImplementation(() => ({
  getAddress: jest.fn(),
})));

jest.mock('./zkEvm/zkEvmProvider', () => ({
  ZkEvmProvider: jest.fn(),
}));

jest.mock('./provider/eip6963', () => ({
  announceProvider: jest.fn(),
  passportProviderInfo: { name: 'passport', rdns: 'com.immutable.passport', icon: '' },
}));

const { connectWallet } = require('./connectWallet');

const { announceProvider } = jest.requireMock('./provider/eip6963');
const { ZkEvmProvider } = jest.requireMock('./zkEvm/zkEvmProvider');

const chain = {
  chainId: 13473,
  rpcUrl: 'https://rpc.sandbox.immutable.com',
  relayerUrl: 'https://relayer.sandbox.immutable.com',
  apiUrl: 'https://api.sandbox.immutable.com',
  name: 'Immutable zkEVM Testnet',
};

const createAuthStub = () => ({
  getConfig: jest.fn().mockReturnValue({
    authenticationDomain: 'https://auth.immutable.com',
    passportDomain: 'https://passport.immutable.com',
    oidcConfiguration: {
      clientId: 'client',
      redirectUri: 'https://redirect',
    },
  }),
  getUser: jest.fn().mockResolvedValue({ profile: { sub: 'user' } }),
  loginCallback: jest.fn(),
  eventEmitter: { emit: jest.fn(), on: jest.fn() },
});

describe('connectWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('announces provider by default', async () => {
    const auth = createAuthStub();

    const provider = await connectWallet({ auth, chains: [chain] });

    expect(ZkEvmProvider).toHaveBeenCalled();
    expect(announceProvider).toHaveBeenCalledWith({
      info: expect.any(Object),
      provider,
    });
  });

  it('does not announce provider when disabled', async () => {
    const auth = createAuthStub();

    await connectWallet({ auth, chains: [chain], announceProvider: false });

    expect(announceProvider).not.toHaveBeenCalled();
  });
});
