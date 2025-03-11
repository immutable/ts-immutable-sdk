// Simple test to verify Passport SDK initialization
const { passportInstance } = require('../../src/app/utils/setupDefault');

// Mock the SDK to avoid actual network calls
jest.mock('@imtbl/sdk', () => {
  return {
    config: {
      Environment: {
        SANDBOX: 'sandbox',
        PRODUCTION: 'production'
      }
    },
    passport: {
      Passport: jest.fn().mockImplementation(() => {
        return {
          baseConfig: {
            environment: 'sandbox'
          },
          connectEvm: jest.fn().mockResolvedValue({
            request: jest.fn().mockResolvedValue(['0x1234567890abcdef1234567890abcdef12345678'])
          }),
          logout: jest.fn().mockResolvedValue(undefined),
          loginCallback: jest.fn().mockResolvedValue(undefined)
        };
      })
    }
  };
});

describe('Passport SDK Event Handling', () => {
  test('passportInstance is properly initialized', () => {
    expect(passportInstance).toBeDefined();
    expect(passportInstance.baseConfig).toBeDefined();
    expect(passportInstance.baseConfig.environment).toBe('sandbox');
  });

  test('passportInstance has required methods', () => {
    expect(typeof passportInstance.connectEvm).toBe('function');
    expect(typeof passportInstance.logout).toBe('function');
    expect(typeof passportInstance.loginCallback).toBe('function');
  });
}); 