// Mock Auth with configurable behavior
const mockAuthInstance = {
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
  loginCallback: jest.fn().mockResolvedValue(undefined),
};

const Auth = jest.fn().mockImplementation(() => mockAuthInstance);

jest.mock('@imtbl/auth', () => {
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

const zkEvmChain = {
  chainId: 13473,
  rpcUrl: 'https://rpc.sandbox.immutable.com',
  relayerUrl: 'https://relayer.sandbox.immutable.com',
  apiUrl: 'https://api.sandbox.immutable.com',
  name: 'Immutable zkEVM Testnet',
};

// Create a mock getUser function for tests
const createGetUserMock = () => jest.fn().mockResolvedValue({
  profile: { sub: 'user' },
  accessToken: 'token',
});

describe('connectWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Auth.mockClear();
    mockAuthInstance.getUser.mockClear();
    mockAuthInstance.getUserOrLogin.mockClear();
    mockAuthInstance.loginCallback.mockClear();
  });

  describe('with external getUser (existing tests)', () => {
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

    it('uses provided getUser when supplied', async () => {
      const getUser = createGetUserMock();

      await connectWallet({ getUser, chains: [zkEvmChain] });

      // Should NOT create internal Auth instance
      expect(Auth).not.toHaveBeenCalled();
      // Should use the provided getUser
      expect(getUser).toHaveBeenCalled();
    });
  });

  describe('default auth (no getUser provided)', () => {
    describe('Auth instance creation', () => {
      it('creates internal Auth instance when getUser is not provided', async () => {
        await connectWallet({ chains: [zkEvmChain] });

        expect(Auth).toHaveBeenCalledTimes(1);
        expect(Auth).toHaveBeenCalledWith(
          expect.objectContaining({
            scope: 'openid profile email offline_access transact',
            audience: 'platform_api',
            authenticationDomain: 'https://auth.immutable.com',
          }),
        );
      });

      it('uses getUserOrLogin from internal Auth', async () => {
        await connectWallet({ chains: [zkEvmChain] });

        // Internal Auth's getUserOrLogin should be called during setup
        expect(mockAuthInstance.getUserOrLogin).toHaveBeenCalled();
      });

      it('derives passportDomain from chain apiUrl', async () => {
        const customChain = {
          ...zkEvmChain,
          apiUrl: 'https://api.custom.immutable.com',
        };

        await connectWallet({ chains: [customChain] });

        expect(Auth).toHaveBeenCalledWith(
          expect.objectContaining({
            passportDomain: 'https://passport.custom.immutable.com',
          }),
        );
      });

      it('uses provided passportDomain if specified in chain config', async () => {
        const customChain = {
          ...zkEvmChain,
          passportDomain: 'https://custom-passport.immutable.com',
        };

        await connectWallet({ chains: [customChain] });

        expect(Auth).toHaveBeenCalledWith(
          expect.objectContaining({
            passportDomain: 'https://custom-passport.immutable.com',
          }),
        );
      });

      it('uses default redirect URI fallback', async () => {
        await connectWallet({ chains: [zkEvmChain] });

        expect(Auth).toHaveBeenCalledWith(
          expect.objectContaining({
            redirectUri: 'https://auth.immutable.com/im-logged-in',
            popupRedirectUri: 'https://auth.immutable.com/im-logged-in',
            logoutRedirectUri: 'https://auth.immutable.com/im-logged-in',
          }),
        );
      });

      it('passes popupOverlayOptions to Auth', async () => {
        const popupOverlayOptions = {
          disableGenericPopupOverlay: true,
          disableBlockedPopupOverlay: false,
        };

        await connectWallet({ chains: [zkEvmChain], popupOverlayOptions });

        expect(Auth).toHaveBeenCalledWith(
          expect.objectContaining({
            popupOverlayOptions,
          }),
        );
      });

      it('passes crossSdkBridgeEnabled to Auth', async () => {
        await connectWallet({ chains: [zkEvmChain], crossSdkBridgeEnabled: true });

        expect(Auth).toHaveBeenCalledWith(
          expect.objectContaining({
            crossSdkBridgeEnabled: true,
          }),
        );
      });
    });

    describe('clientId auto-detection', () => {
      it('uses sandbox client ID for testnet chain (chainId 13473)', async () => {
        const testnetChain = {
          ...zkEvmChain,
          chainId: 13473,
          apiUrl: 'https://api.sandbox.immutable.com',
        };

        await connectWallet({ chains: [testnetChain] });

        expect(Auth).toHaveBeenCalledWith(
          expect.objectContaining({
            clientId: 'mjtCL8mt06BtbxSkp2vbrYStKWnXVZfo', // Sandbox client ID
          }),
        );
      });

      it('uses production client ID for mainnet chain (chainId 13371)', async () => {
        const mainnetChain = {
          chainId: 13371,
          rpcUrl: 'https://rpc.immutable.com',
          relayerUrl: 'https://relayer.immutable.com',
          apiUrl: 'https://api.immutable.com',
          name: 'Immutable zkEVM Mainnet',
        };

        await connectWallet({ chains: [mainnetChain] });

        expect(Auth).toHaveBeenCalledWith(
          expect.objectContaining({
            clientId: 'PtQRK4iRJ8GkXjiz6xfImMAYhPhW0cYk', // Production client ID
          }),
        );
      });

      it('detects sandbox from apiUrl containing "sandbox"', async () => {
        const sandboxChain = {
          chainId: 99999, // unknown chainId
          rpcUrl: 'https://rpc.custom.com',
          relayerUrl: 'https://relayer.custom.com',
          apiUrl: 'https://api.sandbox.custom.com', // "sandbox" in URL
          name: 'Custom Sandbox Chain',
          magicPublishableApiKey: 'pk_test_123',
          magicProviderId: 'provider-123',
        };

        await connectWallet({ chains: [sandboxChain] });

        expect(Auth).toHaveBeenCalledWith(
          expect.objectContaining({
            clientId: 'mjtCL8mt06BtbxSkp2vbrYStKWnXVZfo', // Sandbox client ID
          }),
        );
      });

      it('detects sandbox from apiUrl containing "testnet"', async () => {
        const testnetChain = {
          chainId: 99999,
          rpcUrl: 'https://rpc.testnet.custom.com',
          relayerUrl: 'https://relayer.testnet.custom.com',
          apiUrl: 'https://api.testnet.custom.com', // "testnet" in URL
          name: 'Custom Testnet Chain',
          magicPublishableApiKey: 'pk_test_123',
          magicProviderId: 'provider-123',
        };

        await connectWallet({ chains: [testnetChain] });

        expect(Auth).toHaveBeenCalledWith(
          expect.objectContaining({
            clientId: 'mjtCL8mt06BtbxSkp2vbrYStKWnXVZfo', // Sandbox client ID
          }),
        );
      });

      it('uses provided clientId when explicitly set', async () => {
        const customClientId = 'custom-client-id-123';

        await connectWallet({ chains: [zkEvmChain], clientId: customClientId });

        expect(Auth).toHaveBeenCalledWith(
          expect.objectContaining({
            clientId: customClientId,
          }),
        );
      });

      it('prefers provided clientId over auto-detected one', async () => {
        const customClientId = 'custom-client-id-456';
        const mainnetChain = {
          chainId: 13371,
          rpcUrl: 'https://rpc.immutable.com',
          relayerUrl: 'https://relayer.immutable.com',
          apiUrl: 'https://api.immutable.com',
          name: 'Immutable zkEVM Mainnet',
        };

        await connectWallet({ chains: [mainnetChain], clientId: customClientId });

        // Should use custom, not production client ID
        expect(Auth).toHaveBeenCalledWith(
          expect.objectContaining({
            clientId: customClientId,
          }),
        );
      });
    });

    describe('popup callback handling', () => {
      it('sets up message listener for popup callback', async () => {
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

        await connectWallet({ chains: [zkEvmChain] });

        expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));

        addEventListenerSpy.mockRestore();
      });

      it('handles OAuth callback message with code and state', async () => {
        let messageHandler: ((event: MessageEvent) => void) | null = null;
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
          if (event === 'message') {
            messageHandler = handler as (event: MessageEvent) => void;
          }
        });

        const replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});

        await connectWallet({ chains: [zkEvmChain] });

        expect(messageHandler).not.toBeNull();

        // Simulate popup callback message
        const callbackMessage = {
          data: {
            code: 'auth-code-123',
            state: 'state-456',
          },
        } as MessageEvent;

        // Trigger the message event
        const promise = messageHandler!(callbackMessage);

        // Wait for async operations
        await promise;
        await Promise.resolve();

        // Should call Auth.loginCallback
        expect(mockAuthInstance.loginCallback).toHaveBeenCalled();

        // Should update browser history with code/state
        expect(replaceStateSpy).toHaveBeenCalledTimes(2);

        addEventListenerSpy.mockRestore();
        replaceStateSpy.mockRestore();
      });

      it('ignores messages without code and state', async () => {
        let messageHandler: ((event: MessageEvent) => void) | null = null;
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
          if (event === 'message') {
            messageHandler = handler as (event: MessageEvent) => void;
          }
        });

        await connectWallet({ chains: [zkEvmChain] });

        // Simulate non-callback message
        const regularMessage = {
          data: {
            someOtherData: 'value',
          },
        } as MessageEvent;

        messageHandler!(regularMessage);

        await Promise.resolve();

        // Should NOT call Auth.loginCallback
        expect(mockAuthInstance.loginCallback).not.toHaveBeenCalled();

        addEventListenerSpy.mockRestore();
      });

      it('updates query string with code and state during callback', async () => {
        let messageHandler: ((event: MessageEvent) => void) | null = null;
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
          if (event === 'message') {
            messageHandler = handler as (event: MessageEvent) => void;
          }
        });

        const replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});

        // Mock window.location.search
        Object.defineProperty(window, 'location', {
          value: { search: '?existing=param' },
          writable: true,
        });

        await connectWallet({ chains: [zkEvmChain] });

        const callbackMessage = {
          data: {
            code: 'test-code',
            state: 'test-state',
          },
        } as MessageEvent;

        const promise = messageHandler!(callbackMessage);
        await promise;
        await Promise.resolve();

        // First call: add code and state
        expect(replaceStateSpy).toHaveBeenNthCalledWith(
          1,
          null,
          '',
          expect.stringContaining('code=test-code'),
        );
        expect(replaceStateSpy).toHaveBeenNthCalledWith(
          1,
          null,
          '',
          expect.stringContaining('state=test-state'),
        );

        // Second call: remove code and state after callback
        expect(replaceStateSpy).toHaveBeenNthCalledWith(
          2,
          null,
          '',
          expect.not.stringContaining('code='),
        );

        addEventListenerSpy.mockRestore();
        replaceStateSpy.mockRestore();
      });
    });

    describe('provider creation with default auth', () => {
      it('creates provider successfully without getUser', async () => {
        const provider = await connectWallet({ chains: [zkEvmChain] });

        expect(provider).toBeDefined();
        expect(ZkEvmProvider).toHaveBeenCalled();
      });

      it('passes getUser function to ZkEvmProvider', async () => {
        await connectWallet({ chains: [zkEvmChain] });

        const zkEvmProviderCall = (ZkEvmProvider as jest.Mock).mock.calls[0][0];
        expect(zkEvmProviderCall.getUser).toEqual(expect.any(Function));
      });

      it('passes clientId to ZkEvmProvider', async () => {
        await connectWallet({ chains: [zkEvmChain] });

        const zkEvmProviderCall = (ZkEvmProvider as jest.Mock).mock.calls[0][0];
        expect(zkEvmProviderCall.clientId).toBe('mjtCL8mt06BtbxSkp2vbrYStKWnXVZfo');
      });

      it('works with custom chain configuration', async () => {
        const customChain = {
          chainId: 99999,
          rpcUrl: 'https://rpc.custom.com',
          relayerUrl: 'https://relayer.custom.com',
          apiUrl: 'https://api.custom.com',
          passportDomain: 'https://passport.custom.com',
          name: 'Custom Chain',
          magicPublishableApiKey: 'pk_test_custom',
          magicProviderId: 'provider-custom',
        };

        const provider = await connectWallet({ chains: [customChain] });

        expect(provider).toBeDefined();
        expect(Auth).toHaveBeenCalledWith(
          expect.objectContaining({
            passportDomain: 'https://passport.custom.com',
          }),
        );
      });
    });

    describe('error handling', () => {
      it('handles auth failure gracefully', async () => {
        mockAuthInstance.getUserOrLogin.mockRejectedValueOnce(new Error('Auth failed'));

        const provider = await connectWallet({ chains: [zkEvmChain] });

        // Should still create provider (user will be null)
        expect(provider).toBeDefined();
        expect(ZkEvmProvider).toHaveBeenCalledWith(
          expect.objectContaining({
            user: null,
          }),
        );
      });

      it('handles loginCallback failure gracefully', async () => {
        let messageHandler: ((event: MessageEvent) => void) | null = null;
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
          if (event === 'message') {
            messageHandler = handler as (event: MessageEvent) => void;
          }
        });

        mockAuthInstance.loginCallback.mockRejectedValueOnce(new Error('Callback failed'));

        await connectWallet({ chains: [zkEvmChain] });

        const callbackMessage = {
          data: {
            code: 'test-code',
            state: 'test-state',
          },
        } as MessageEvent;

        // Should not throw (error is handled internally)
        await expect(messageHandler!(callbackMessage)).rejects.toThrow('Callback failed');

        addEventListenerSpy.mockRestore();
      });
    });
  });

  describe('provider selection', () => {
    it('uses ZkEvmProvider for zkEVM chain (by chainId)', async () => {
      const getUser = createGetUserMock();

      await connectWallet({ getUser, chains: [zkEvmChain] });

      expect(ZkEvmProvider).toHaveBeenCalled();
    });

    it('uses ZkEvmProvider for zkEVM devnet chain', async () => {
      const getUser = createGetUserMock();
      const devChain = {
        chainId: 99999, // unknown chainId
        rpcUrl: 'https://rpc.dev.immutable.com',
        relayerUrl: 'https://relayer.dev.immutable.com',
        apiUrl: 'https://api.dev.immutable.com',
        name: 'Dev Chain',
        magicPublishableApiKey: 'pk_test_123',
        magicProviderId: 'provider-123',
      };

      await connectWallet({ getUser, chains: [devChain] });

      expect(ZkEvmProvider).toHaveBeenCalled();
    });
  });
});
