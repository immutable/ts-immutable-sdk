const React = require('react');
const { render, screen, fireEvent, waitFor, act } = require('@testing-library/react');
require('@testing-library/jest-dom');

// Mock biom3 components
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

// Create mock for next/link
jest.mock('next/link', () => 
  ({ children, href }) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  )
);

// Mock provider and passport instance
const mockProvider = {
  on: jest.fn(),
  removeListener: jest.fn(),
  disconnect: jest.fn(),
  connected: false,
  request: jest.fn()
};

const mockPassportInstance = {
  isAuthenticated: jest.fn(),
  login: jest.fn(),
  loginCallback: jest.fn(),
  logout: jest.fn(),
  provider: mockProvider,
};

jest.mock('../../../app/utils/setupDefault', () => ({
  passportInstance: mockPassportInstance,
}));

// Import after mocks are setup
const EventHandlingPage = require('../../../app/event-handling/page').default;
const RedirectPage = require('../../../app/redirect/page').default;
const LogoutPage = require('../../../app/logout/page').default;

describe('Event Handling Implementation', () => {
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
    mockProvider.connected = false;
  });

  test('renders event handling page with disconnected state', () => {
    render(<EventHandlingPage />);
    
    expect(screen.getByText('Immutable Passport Event Handling')).toBeInTheDocument();
    expect(screen.getByText('Connection Status:')).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByText('Connect to Passport')).toBeInTheDocument();
    expect(screen.queryByText('Current Account:')).not.toBeInTheDocument();
  });

  test('connects to passport when connect button is clicked', async () => {
    mockPassportInstance.login.mockResolvedValue();
    
    render(<EventHandlingPage />);
    
    const connectButton = screen.getByText('Connect to Passport');
    fireEvent.click(connectButton);
    
    expect(mockPassportInstance.login).toHaveBeenCalled();
  });
  
  test('handles connect event properly', async () => {
    render(<EventHandlingPage />);
    
    // Simulate connect event
    const connectHandler = mockProvider.on.mock.calls.find(call => call[0] === 'connect')[1];
    
    await act(async () => {
      connectHandler();
    });
    
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText(/Event Log/)).toBeInTheDocument();
  });
  
  test('handles disconnect event properly', async () => {
    // Set initial state to connected
    mockProvider.connected = true;
    
    render(<EventHandlingPage />);
    
    // Find the disconnect event handler
    const disconnectHandler = mockProvider.on.mock.calls.find(call => call[0] === 'disconnect')[1];
    
    await act(async () => {
      disconnectHandler();
    });
    
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });
  
  test('handles accountsChanged event properly', async () => {
    mockProvider.connected = true;
    
    render(<EventHandlingPage />);
    
    // Find the accounts changed handler
    const accountsChangedHandler = mockProvider.on.mock.calls.find(call => call[0] === 'accountsChanged')[1];
    
    await act(async () => {
      accountsChangedHandler(['0x1234567890abcdef1234567890abcdef12345678']);
    });
    
    // Should display truncated account
    expect(screen.getByText('Current Account:')).toBeInTheDocument();
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
  });
  
  test('handles chainChanged event properly', async () => {
    mockProvider.connected = true;
    
    render(<EventHandlingPage />);
    
    // Find the chain changed handler
    const chainChangedHandler = mockProvider.on.mock.calls.find(call => call[0] === 'chainChanged')[1];
    
    await act(async () => {
      chainChangedHandler('0x5');
    });
    
    expect(screen.getByText('Current Chain ID:')).toBeInTheDocument();
    expect(screen.getByText('0x5')).toBeInTheDocument();
  });
  
  test('cleans up event listeners on unmount', () => {
    const { unmount } = render(<EventHandlingPage />);
    
    // Check that event listeners were set up
    expect(mockProvider.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockProvider.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockProvider.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
    expect(mockProvider.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));
    
    // Unmount to trigger cleanup
    unmount();
    
    // Check that listeners were removed
    expect(mockProvider.removeListener).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockProvider.removeListener).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockProvider.removeListener).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
    expect(mockProvider.removeListener).toHaveBeenCalledWith('chainChanged', expect.any(Function));
  });
});

describe('Redirect Page', () => {
  test('shows loading state initially', () => {
    render(<RedirectPage />);
    
    expect(screen.getByText('Authentication Callback')).toBeInTheDocument();
    expect(screen.getByText('Processing authentication...')).toBeInTheDocument();
    expect(screen.getByTestId('biom3-spinner')).toBeInTheDocument();
  });
  
  test('handles successful login callback', async () => {
    mockPassportInstance.loginCallback.mockResolvedValue();
    
    render(<RedirectPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Authentication successful!')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Redirecting you to the event handling page...')).toBeInTheDocument();
  });
  
  test('handles login callback error', async () => {
    mockPassportInstance.loginCallback.mockRejectedValue(new Error('Authentication failed'));
    
    render(<RedirectPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Authentication failed!')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Error: Authentication failed')).toBeInTheDocument();
    expect(screen.getByText('Return to Event Handling')).toBeInTheDocument();
  });
});

describe('Logout Page', () => {
  test('displays logout success message', () => {
    render(<LogoutPage />);
    
    expect(screen.getByText('Logged Out')).toBeInTheDocument();
    expect(screen.getByText('You have been logged out successfully.')).toBeInTheDocument();
    expect(screen.getByText('All event listeners have been cleaned up automatically.')).toBeInTheDocument();
  });
  
  test('handles logout with error parameters', () => {
    // Mock window.location.search
    delete window.location;
    window.location = { 
      search: '?error=logout_failed&error_description=Failed%20to%20logout' 
    };
    
    render(<LogoutPage />);
    
    expect(screen.getByText('Logout error: Failed to logout')).toBeInTheDocument();
  });
}); 