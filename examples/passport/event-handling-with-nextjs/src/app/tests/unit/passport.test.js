const { render, screen, fireEvent, act } = require('@testing-library/react');
const React = require('react');

// Mock the Passport SDK
const mockPassport = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  provider: {
    on: jest.fn(),
    removeListener: jest.fn(),
  },
};

// Mock the usePassport hook
jest.mock('@imtbl/sdk/passport', () => ({
  usePassport: () => mockPassport,
}));

// Mock Biom3 Button component
jest.mock('@biom3/react', () => ({
  Button: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

const EventHandlingPage = require('../../event-handling/page').default;

describe('EventHandlingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the event handling page with connect button', () => {
    render(<EventHandlingPage />);
    expect(screen.getByText('Passport Event Handling Example')).toBeInTheDocument();
    expect(screen.getByText('Connect Passport')).toBeInTheDocument();
  });

  it('sets up event listeners on mount', () => {
    render(<EventHandlingPage />);
    expect(mockPassport.provider.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockPassport.provider.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockPassport.provider.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
    expect(mockPassport.provider.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(<EventHandlingPage />);
    unmount();
    expect(mockPassport.provider.removeListener).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockPassport.provider.removeListener).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockPassport.provider.removeListener).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
    expect(mockPassport.provider.removeListener).toHaveBeenCalledWith('chainChanged', expect.any(Function));
  });

  it('handles connect button click', async () => {
    render(<EventHandlingPage />);
    const connectButton = screen.getByText('Connect Passport');
    
    await act(async () => {
      fireEvent.click(connectButton);
    });

    expect(mockPassport.connect).toHaveBeenCalled();
  });

  it('handles disconnect button click', async () => {
    render(<EventHandlingPage />);
    const disconnectButton = screen.getByText('Disconnect');
    
    await act(async () => {
      fireEvent.click(disconnectButton);
    });

    expect(mockPassport.disconnect).toHaveBeenCalled();
  });
}); 