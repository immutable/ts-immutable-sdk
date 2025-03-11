const React = require('react');
const { render, fireEvent, waitFor, screen, act } = require('@testing-library/react');
require('@testing-library/jest-dom');

// Create a mock for the passport SDK
const mockPassportInstance = {
  login: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: jest.fn(),
  getUserInfo: jest.fn(),
  loginCallback: jest.fn(),
};

// Mock the setupDefault module
jest.mock('../../src/app/utils/setupDefault', () => ({
  passportInstance: mockPassportInstance
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next/link to fix Link behavior in tests
jest.mock('next/link', () => {
  return function MockLink({ children, href }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock the modules
jest.mock('@biom3/react', () => ({
  Button: ({ children, onClick, disabled, variant }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
  Stack: ({ children, gap, direction, alignItems }) => (
    <div data-stack data-gap={gap} data-direction={direction} data-align={alignItems}>
      {children}
    </div>
  ),
  Card: ({ children }) => <div data-card>{children}</div>,
  Divider: () => <hr data-divider />,
}));

// Import the page components after mocking
const SilentAuth = require('../../src/app/silent-auth/page').default;

describe('Passport Silent Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display logged out state initially', async () => {
    mockPassportInstance.isAuthenticated.mockResolvedValue(false);
    
    await act(async () => {
      render(<SilentAuth />);
    });
    
    expect(screen.getByText('Status: Logged Out')).toBeInTheDocument();
    expect(screen.getByText('Try Silent Login')).toBeInTheDocument();
    expect(screen.getByText('Manual Login (Fallback)')).toBeInTheDocument();
  });

  it('should attempt silent login when the button is clicked', async () => {
    mockPassportInstance.isAuthenticated.mockResolvedValue(false);
    mockPassportInstance.login.mockResolvedValue({ 
      sub: 'user123', 
      email: 'user@example.com' 
    });
    
    await act(async () => {
      render(<SilentAuth />);
    });
    
    await act(async () => {
      const silentLoginButton = screen.getByText('Try Silent Login');
      fireEvent.click(silentLoginButton);
    });
    
    expect(mockPassportInstance.login).toHaveBeenCalledWith({ useSilentLogin: true });
    
    await waitFor(() => {
      expect(screen.getByText('Status: Logged In')).toBeInTheDocument();
      expect(screen.getByText('ID: user123')).toBeInTheDocument();
      expect(screen.getByText('Email: user@example.com')).toBeInTheDocument();
    });
  });

  it('should show error when silent login fails', async () => {
    mockPassportInstance.isAuthenticated.mockResolvedValue(false);
    mockPassportInstance.login.mockResolvedValue(null);
    
    await act(async () => {
      render(<SilentAuth />);
    });
    
    await act(async () => {
      const silentLoginButton = screen.getByText('Try Silent Login');
      fireEvent.click(silentLoginButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Error: Silent login failed. You need to login manually.')).toBeInTheDocument();
    });
  });

  it('should handle token refresh', async () => {
    mockPassportInstance.isAuthenticated.mockResolvedValue(true);
    mockPassportInstance.getUserInfo.mockResolvedValue({ 
      sub: 'user123', 
      email: 'user@example.com' 
    });
    
    await act(async () => {
      render(<SilentAuth />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Status: Logged In')).toBeInTheDocument();
    });
    
    mockPassportInstance.logout.mockResolvedValue();
    mockPassportInstance.login.mockClear(); // Clear previous calls
    mockPassportInstance.login.mockResolvedValue({ 
      sub: 'user123', 
      email: 'refreshed@example.com' 
    });
    
    await act(async () => {
      const refreshButton = screen.getByText('Manually Refresh Token');
      fireEvent.click(refreshButton);
    });
    
    expect(mockPassportInstance.logout).toHaveBeenCalledWith({ silent: true });
    
    // Wait for the async operations to complete
    await waitFor(() => {
      expect(mockPassportInstance.login).toHaveBeenCalledWith({ useSilentLogin: true });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Email: refreshed@example.com')).toBeInTheDocument();
    });
  });
}); 