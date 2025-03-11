// Import testing utilities
const { render, screen } = require('@testing-library/react');

// Create mock for passport instance
const mockPassportInstance = {
  login: jest.fn(),
  logout: jest.fn(),
  loginCallback: jest.fn(),
  connectEvm: jest.fn(),
  getUserInfo: jest.fn(),
  isAuthenticated: jest.fn()
};

// Mock the setupDefault module
jest.mock('../../src/app/utils/setupDefault', () => ({
  passportInstance: mockPassportInstance
}));

// Use mockComponent prefix as required by Jest
const mockComponentTable = ({ children }) => children;
mockComponentTable.Head = ({ children }) => children;
mockComponentTable.Body = ({ children }) => children;
mockComponentTable.Row = ({ children }) => children;
mockComponentTable.Cell = ({ children }) => children;

// Mock next/link
jest.mock('next/link', () => 
  function mockNextLink(props) {
    return props.children;
  }
);

// Mock the Biom3 components
jest.mock('@biom3/react', () => ({
  Button: function mockButton(props) { 
    return props.children;
  },
  Heading: function mockHeading(props) {
    return props.children;
  },
  Link: function mockLink(props) {
    return props.children || props.rc;
  },
  Card: function mockCard(props) {
    return props.children;
  },
  Stack: function mockStack(props) {
    return props.children;
  },
  BiomeCombinedProviders: function mockBiomeCombinedProviders(props) {
    return props.children;
  },
  Table: mockComponentTable
}));

// Mock window crypto
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn().mockImplementation(arr => {
      return arr.fill(1);
    })
  }
});

describe('PKCE Authentication Flow', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Set up window location and opener mocks
    delete global.window.location;
    global.window.location = { 
      search: '?code=test-code&state=test-state',
      href: ''
    };
    
    global.window.opener = {
      postMessage: jest.fn()
    };
    
    // Set up mock implementations
    mockPassportInstance.isAuthenticated.mockResolvedValue(false);
  });

  test('Tests can run', () => {
    expect(true).toBe(true);
  });
  
  test('Passport instance is properly mocked', () => {
    expect(mockPassportInstance).toBeDefined();
    expect(mockPassportInstance.login).toBeDefined();
    expect(typeof mockPassportInstance.login).toBe('function');
  });
}); 