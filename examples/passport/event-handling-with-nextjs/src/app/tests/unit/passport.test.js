const { render, screen, fireEvent, waitFor, act } = require('@testing-library/react');
const React = require('react');

// Mock the Biom3 components
jest.mock('@biom3/react', () => ({
  Button: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} data-testid="biom3-button">
      {children}
    </button>
  ),
  Heading: ({ children, size, className }) => (
    <h2 className={className} data-testid={`biom3-heading-${size}`}>
      {children}
    </h2>
  ),
  Stack: ({ children, alignItems, gap, direction }) => (
    <div data-testid="biom3-stack" data-align={alignItems} data-gap={gap} data-direction={direction}>
      {children}
    </div>
  ),
  Text: ({ children, variant }) => (
    <span data-testid="biom3-text" data-variant={variant}>
      {children}
    </span>
  ),
  Spinner: ({ size }) => <div data-testid="biom3-spinner" data-size={size}></div>,
  BiomeCombinedProviders: ({ children }) => <div data-testid="biom3-providers">{children}</div>,
}));

// Mock the provider with event handling capabilities
const mockProvider = {
  on: jest.fn(),
  removeListener: jest.fn(),
  disconnect: jest.fn(),
  connected: false,
  request: jest.fn()
};

// Mock the Passport instance
const mockPassportInstance = {
  isAuthenticated: jest.fn(),
  login: jest.fn(),
  loginCallback: jest.fn(),
  logout: jest.fn(),
  logoutCallback: jest.fn(),
  provider: mockProvider,
};

jest.mock('../../../app/utils/setupDefault', () => ({
  passportInstance: mockPassportInstance,
}));

// Import components after mocks are set up
const EventHandlingPage = require('../../../app/event-handling/page').default;
const RedirectPage = require('../../../app/redirect/page').default;
const LogoutPage = require('../../../app/logout/page').default;

describe('EventHandlingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the event handling page correctly', () => {
    render(<EventHandlingPage />);
    expect(screen.getByTestId('biom3-heading-xxLarge')).toHaveTextContent('Passport Event Handling Demo');
    expect(screen.getByText('Connect with Passport')).toBeInTheDocument();
  });

  test('adds event listeners on component mount', () => {
    render(<EventHandlingPage />);
    expect(mockProvider.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockProvider.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockProvider.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
    expect(mockProvider.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));
    expect(mockProvider.on).toHaveBeenCalledWith('message', expect.any(Function));
  });

  test('removes event listeners on component unmount', () => {
    const { unmount } = render(<EventHandlingPage />);
    unmount();
    expect(mockProvider.removeListener).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockProvider.removeListener).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockProvider.removeListener).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
    expect(mockProvider.removeListener).toHaveBeenCalledWith('chainChanged', expect.any(Function));
    expect(mockProvider.removeListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  test('handles login button click', async () => {
    render(<EventHandlingPage />);
    const loginButton = screen.getByText('Connect with Passport');
    
    await act(async () => {
      fireEvent.click(loginButton);
    });
    
    expect(mockPassportInstance.login).toHaveBeenCalled();
  });

  test('handles switch chain button click when connected', async () => {
    // Mock the current chain ID
    mockProvider.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve(['0x123']);
      if (method === 'eth_chainId') return Promise.resolve('0x5');
      if (method === 'wallet_switchEthereumChain') return Promise.resolve(null);
      return Promise.resolve(null);
    });
    
    mockPassportInstance.isAuthenticated.mockResolvedValue(true);
    
    await act(async () => {
      render(<EventHandlingPage />);
    });

    // Check if we're in the authenticated state with accounts
    await waitFor(() => {
      expect(screen.getByText('Switch Chain')).toBeInTheDocument();
    });
    
    // Now click the switch chain button
    const switchChainButton = screen.getByText('Switch Chain');
    
    await act(async () => {
      fireEvent.click(switchChainButton);
    });
    
    expect(mockProvider.request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }], // Should switch to mainnet
    });
  });

  test('handles logout button click when connected', async () => {
    // Setup authenticated state
    mockPassportInstance.isAuthenticated.mockResolvedValue(true);
    mockProvider.request.mockImplementation(({ method }) => {
      if (method === 'eth_accounts') return Promise.resolve(['0x123']);
      if (method === 'eth_chainId') return Promise.resolve('0x5');
      return Promise.resolve(null);
    });
    
    await act(async () => {
      render(<EventHandlingPage />);
    });
    
    // Check if we're in the authenticated state
    await waitFor(() => {
      expect(screen.getByText('Disconnect')).toBeInTheDocument();
    });
    
    // Now click the logout button
    const logoutButton = screen.getByText('Disconnect');
    
    await act(async () => {
      fireEvent.click(logoutButton);
    });
    
    expect(mockPassportInstance.logout).toHaveBeenCalled();
  });

  test('handles event listeners correctly', async () => {
    render(<EventHandlingPage />);
    
    // Extract the event handlers
    const connectHandler = mockProvider.on.mock.calls.find(call => call[0] === 'connect')[1];
    const accountsChangedHandler = mockProvider.on.mock.calls.find(call => call[0] === 'accountsChanged')[1];
    const chainChangedHandler = mockProvider.on.mock.calls.find(call => call[0] === 'chainChanged')[1];
    
    // Simulate events
    await act(async () => {
      connectHandler({ chainId: '0x5' });
    });
    
    await act(async () => {
      accountsChangedHandler(['0xnewaccount']);
    });
    
    await act(async () => {
      chainChangedHandler('0x1');
    });
    
    // Check if events were logged - would need to access internal component state
    // which is difficult without modifying the component for testability
    // This is a limitation of this testing approach
  });
});

describe('RedirectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles successful authentication callback', async () => {
    mockPassportInstance.loginCallback.mockResolvedValue(undefined);
    
    await act(async () => {
      render(<RedirectPage />);
    });
    
    expect(mockPassportInstance.loginCallback).toHaveBeenCalled();
    expect(screen.getByTestId('biom3-heading-xxLarge')).toHaveTextContent('Authentication');
  });

  test('handles authentication callback errors', async () => {
    mockPassportInstance.loginCallback.mockRejectedValue(new Error('Auth failed'));
    
    await act(async () => {
      render(<RedirectPage />);
    });
    
    expect(mockPassportInstance.loginCallback).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.getByText(/Authentication failed: Auth failed/)).toBeInTheDocument();
    });
  });
});

describe('LogoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles successful logout callback', async () => {
    mockPassportInstance.logoutCallback.mockResolvedValue(undefined);
    
    await act(async () => {
      render(<LogoutPage />);
    });
    
    expect(mockPassportInstance.logoutCallback).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.getByText('You have been successfully logged out.')).toBeInTheDocument();
    });
  });

  test('handles logout callback errors', async () => {
    mockPassportInstance.logoutCallback.mockRejectedValue(new Error('Logout failed'));
    
    await act(async () => {
      render(<LogoutPage />);
    });
    
    expect(mockPassportInstance.logoutCallback).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.getByText(/Logout failed: Logout failed/)).toBeInTheDocument();
    });
  });

  test('navigates to home on button click', async () => {
    // Mock implementation of handleReturnHome by spying on router.push
    const mockPush = jest.fn();
    const mockRouter = {
      push: mockPush
    };
    
    // Replace the useRouter implementation just for this test
    jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => mockRouter);
    
    mockPassportInstance.logoutCallback.mockResolvedValue(undefined);
    
    await act(async () => {
      render(<LogoutPage />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Return to Home')).toBeInTheDocument();
    });
    
    const homeButton = screen.getByText('Return to Home');
    
    await act(async () => {
      fireEvent.click(homeButton);
    });
    
    // Check if the router.push was called with the right path
    expect(mockPush).toHaveBeenCalledWith('/');
    
    // Clean up the mock to not affect other tests
    jest.restoreAllMocks();
  });
}); 