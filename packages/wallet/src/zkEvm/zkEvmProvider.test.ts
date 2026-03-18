import { TypedEventEmitter } from '@imtbl/auth';
import { WalletEvents, WalletEventMap } from '../types';
import { ProviderEvent } from './types';
import { ZkEvmProvider } from './zkEvmProvider';
import { WalletConfiguration } from '../config';

jest.mock('viem', () => {
  const actual = jest.requireActual<typeof import('viem')>('viem');
  return {
    ...actual,
    createPublicClient: jest.fn(() => ({})),
    http: jest.fn(() => ({})),
  };
});

jest.mock('./relayerClient', () => ({
  RelayerClient: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../guardian', () => jest.fn().mockImplementation(() => ({
  withConfirmationScreen: () => (fn: () => Promise<any>) => fn(),
})));

jest.mock('./sessionActivity/sessionActivity', () => ({
  trackSessionActivity: jest.fn(),
}));

const mockUserWithZkEvm = {
  profile: { sub: 'user-123' },
  accessToken: 'token',
  zkEvm: { ethAddress: '0x1234567890123456789012345678901234567890' },
};

describe('ZkEvmProvider', () => {
  const walletEventEmitter = new TypedEventEmitter<WalletEventMap>();
  const config = new WalletConfiguration({
    passportDomain: 'https://passport.immutable.com',
    zkEvmRpcUrl: 'https://rpc.test.immutable.com',
    relayerUrl: 'https://relayer.test.immutable.com',
    indexerMrBasePath: 'https://api.test.immutable.com',
  });

  const mockGetUser = jest.fn().mockResolvedValue(null);
  const mockEthSigner = {
    getAddress: jest.fn().mockResolvedValue('0xabc'),
    signMessage: jest.fn(),
    signTypedData: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('emits accountsChanged when LOGGED_IN event is received with zkEvm user', () => {
    const provider = new ZkEvmProvider({
      getUser: mockGetUser,
      clientId: 'test-client',
      config,
      multiRollupApiClients: {} as any,
      walletEventEmitter,
      guardianClient: {} as any,
      ethSigner: mockEthSigner as any,
      user: null,
      sessionActivityApiUrl: null,
    });

    const accountsChangedHandler = jest.fn();
    provider.on(ProviderEvent.ACCOUNTS_CHANGED, accountsChangedHandler);

    walletEventEmitter.emit(WalletEvents.LOGGED_IN, mockUserWithZkEvm as any);

    expect(accountsChangedHandler).toHaveBeenCalledWith([mockUserWithZkEvm.zkEvm.ethAddress]);
  });
});
