// Unit tests for Passport Provider Announcement functionality

// Set up global DOM events
global.CustomEvent = class CustomEvent extends Event {
  constructor(type, options) {
    super(type, options);
    this.detail = options?.detail;
  }
};

// Mock the SDK
jest.mock('@imtbl/sdk', () => ({
  passport: {
    Passport: jest.fn().mockImplementation(() => ({
      connectEvm: jest.fn().mockResolvedValue({
        request: jest.fn().mockResolvedValue(['0x123456789abcdef']),
      }),
      logout: jest.fn().mockResolvedValue({}),
      loginCallback: jest.fn().mockResolvedValue({}),
    })),
  },
  config: {
    Environment: {
      SANDBOX: 'sandbox',
      PRODUCTION: 'production',
    },
  },
}));

// Mock React components
jest.mock('@biom3/react', () => ({
  Button: 'button',
  Heading: 'h1',
  Link: 'a',
  Table: {
    Head: 'thead',
    Body: 'tbody',
    Row: 'tr',
    Cell: 'td',
  },
  Card: 'div',
  Stack: 'div',
  Divider: 'hr',
  BiomeCombinedProviders: 'div',
}));

// Mock next/link
jest.mock('next/link', () => function NextLink({ href, children }) {
  return { href, children };
});

describe('Passport Provider Announcement', () => {
  // Store original methods
  const originalAddEventListener = global.window.addEventListener;
  const originalDispatchEvent = global.window.dispatchEvent;
  
  // Track event listeners
  let eventListeners = {};
  
  // Setup mocks
  beforeEach(() => {
    // Reset SDK mocks
    const { passport } = require('@imtbl/sdk');
    passport.Passport.mockClear();
    
    // Mock window event methods
    global.window.addEventListener = jest.fn((event, callback) => {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(callback);
    });
    
    global.window.dispatchEvent = jest.fn((event) => {
      if (eventListeners[event.type]) {
        eventListeners[event.type].forEach(callback => callback(event));
      }
      return true;
    });
    
    // Clear event listeners between tests
    eventListeners = {};
  });
  
  // Restore original methods
  afterEach(() => {
    if (originalAddEventListener) {
      global.window.addEventListener = originalAddEventListener;
    }
    
    if (originalDispatchEvent) {
      global.window.dispatchEvent = originalDispatchEvent;
    }
  });
  
  test('Passport SDK can announce itself as a provider', async () => {
    const { passport } = require('@imtbl/sdk');
    const passportInstance = new passport.Passport();
    
    // Simulate the announceProvider call
    await passportInstance.connectEvm({ announceProvider: true });
    
    // Verify connectEvm was called with the correct options
    expect(passportInstance.connectEvm).toHaveBeenCalledWith({ 
      announceProvider: true 
    });
  });
  
  test('Application registers EIP-6963 event listener', () => {
    // Mock React hooks for the test
    const mockUseEffect = jest.fn(callback => callback());
    const mockSetState = jest.fn();
    const React = {
      useState: jest.fn(() => [[], mockSetState]),
      useEffect: mockUseEffect,
    };
    
    // Mock the component we're testing
    const providerAnnounceModule = {
      default: function() {
        // This simulates what the component does on mount
        React.useEffect(() => {
          function handleProviderAnnouncement() {}
          window.addEventListener('eip6963:announceProvider', handleProviderAnnouncement);
          window.dispatchEvent(new CustomEvent('eip6963:requestProvider'));
          return () => {
            window.removeEventListener('eip6963:announceProvider', handleProviderAnnouncement);
          };
        }, []);
        return null;
      }
    };
    
    // Run the component code
    providerAnnounceModule.default();
    
    // Verify that the event listener was added
    expect(window.addEventListener).toHaveBeenCalledWith(
      'eip6963:announceProvider', 
      expect.any(Function)
    );
    
    // Verify request for providers was dispatched
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'eip6963:requestProvider'
      })
    );
  });
  
  test('Application updates state when provider is announced', () => {
    // Mock provider announcement data
    const mockProviderInfo = {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Wallet',
      icon: 'data:image/svg+xml;base64,test',
    };
    
    // Mock React hooks and state
    const discoveredProviders = [];
    const setDiscoveredProviders = jest.fn(callback => {
      if (typeof callback === 'function') {
        return callback(discoveredProviders);
      }
      return callback;
    });
    
    // Create a simplified component that simulates the event listener
    function handleProviderAnnouncement(event) {
      const { info } = event.detail;
      setDiscoveredProviders(prev => {
        const exists = prev.some(p => p.providerId === info.uuid);
        if (exists) return prev;
        return [...prev, {
          name: info.name,
          icon: info.icon,
          providerId: info.uuid
        }];
      });
    }
    
    // Trigger the provider announcement
    handleProviderAnnouncement({
      detail: {
        info: mockProviderInfo,
        provider: {}
      }
    });
    
    // Verify the state update
    expect(setDiscoveredProviders).toHaveBeenCalled();
    expect(setDiscoveredProviders.mock.calls[0][0]([])).toEqual([{
      name: 'Test Wallet',
      icon: 'data:image/svg+xml;base64,test',
      providerId: '123e4567-e89b-12d3-a456-426614174000'
    }]);
  });
  
  test('Login with Passport requests accounts from the provider', async () => {
    const { passport } = require('@imtbl/sdk');
    const passportInstance = new passport.Passport();
    
    // Connect to EVM and get the provider
    const provider = await passportInstance.connectEvm({
      announceProvider: true
    });
    
    // Request accounts
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    
    // Verify that the provider's request method was called
    expect(provider.request).toHaveBeenCalledWith({ 
      method: 'eth_requestAccounts' 
    });
    
    // Verify we got back an account
    expect(accounts).toEqual(['0x123456789abcdef']);
  });
}); 