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
    getUserOrLogin: jest.fn().mockResolvedValue({ profile: { sub: 'user' }, accessToken: 'token' }),
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

jest.mock('./sequence/sequenceProvider', () => ({
  SequenceProvider: jest.fn(),
}));

jest.mock('./provider/eip6963', () => ({
  announceProvider: jest.fn(),
  passportProviderInfo: { name: 'passport', rdns: 'com.immutable.passport', icon: '' },
}));

const { connectWallet } = require('./connectWallet');

const { announceProvider } = jest.requireMock('./provider/eip6963');
const { ZkEvmProvider } = jest.requireMock('./zkEvm/zkEvmProvider');
const { SequenceProvider } = jest.requireMock('./sequence/sequenceProvider');

const zkEvmChain = {
  chainId: 13473,
  rpcUrl: 'https://rpc.sandbox.immutable.com',
  relayerUrl: 'https://relayer.sandbox.immutable.com',
  apiUrl: 'https://api.sandbox.immutable.com',
  name: 'Immutable zkEVM Testnet',
};

const arbitrumChain = {
  chainId: 42161,
  rpcUrl: 'https://arb1.arbitrum.io/rpc',
  relayerUrl: 'https://next-arbitrum-one-relayer.sequence.app',
  apiUrl: 'https://api.immutable.com',
  name: 'Arbitrum One',
  sequenceIdentityInstrumentEndpoint: 'https://sequence.immutable.com',
};

// Create a mock getUser function for tests
const createGetUserMock = () => jest.fn().mockResolvedValue({
  profile: { sub: 'user' },
  accessToken: 'token',
});

describe('connectWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('announces provider by default', async () => {
    const getUser = createGetUserMock();

    const provider = await connectWallet({ getUser, chains: [zkEvmChain] });

    expect(ZkEvmProvider).toHaveBeenCalled();
    expect(announceProvider).toHaveBeenCalledWith({
      info: expect.any(Object),
      provider,
    });
  });

  it('does not announce provider when disabled', async () => {
    const getUser = createGetUserMock();

    await connectWallet({ getUser, chains: [zkEvmChain], announceProvider: false });

    expect(announceProvider).not.toHaveBeenCalled();
  });

  describe('provider selection', () => {
    it('uses ZkEvmProvider for zkEVM chain (by chainId)', async () => {
      const getUser = createGetUserMock();

      await connectWallet({ getUser, chains: [zkEvmChain] });

      expect(ZkEvmProvider).toHaveBeenCalled();
      expect(SequenceProvider).not.toHaveBeenCalled();
    });

    it('uses ZkEvmProvider for zkEVM devnet chain', async () => {
      const getUser = createGetUserMock();
      const devChain = {
        chainId: 15003, // zkEVM devnet chainId
        rpcUrl: 'https://rpc.dev.immutable.com',
        relayerUrl: 'https://relayer.dev.immutable.com',
        apiUrl: 'https://api.dev.immutable.com',
        name: 'Dev Chain',
        magicPublishableApiKey: 'pk_test_123',
        magicProviderId: 'provider-123',
      };

      await connectWallet({ getUser, chains: [devChain] });

      expect(ZkEvmProvider).toHaveBeenCalled();
      expect(SequenceProvider).not.toHaveBeenCalled();
    });

    it('uses SequenceProvider for non-zkEVM chain (Arbitrum)', async () => {
      const getUser = createGetUserMock();

      await connectWallet({ getUser, chains: [arbitrumChain] });

      expect(SequenceProvider).toHaveBeenCalled();
      expect(ZkEvmProvider).not.toHaveBeenCalled();
    });
  });
});
