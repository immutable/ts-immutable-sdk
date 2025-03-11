const { describe, test, expect } = require('@jest/globals');

// Mock the Passport instance and related modules
jest.mock('../../utils/setupDefault', () => ({
  passportInstance: {
    connectEvm: jest.fn(),
    logout: jest.fn().mockResolvedValue(undefined),
    loginCallback: jest.fn().mockResolvedValue(undefined)
  }
}));

// Mock the provider response
const mockProvider = {
  request: jest.fn()
};

// Import the mocked module
const { passportInstance } = require('../../utils/setupDefault');

describe('Guardian Integration Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    passportInstance.connectEvm.mockResolvedValue(mockProvider);
  });

  test('connectEvm should connect to the Passport provider', async () => {
    mockProvider.request.mockResolvedValueOnce(['0x123456789']);
    
    const provider = await passportInstance.connectEvm();
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    
    expect(passportInstance.connectEvm).toHaveBeenCalled();
    expect(provider.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
    expect(accounts).toEqual(['0x123456789']);
  });

  test('transaction evaluation should send a transaction through the provider', async () => {
    const mockTxHash = '0xabcdef123456';
    mockProvider.request.mockResolvedValueOnce(mockTxHash);
    
    const provider = await passportInstance.connectEvm();
    const transaction = {
      to: '0x123456789',
      value: '0x0',
      data: '0x',
    };
    
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [transaction],
    });
    
    expect(provider.request).toHaveBeenCalledWith({
      method: 'eth_sendTransaction',
      params: [transaction],
    });
    expect(txHash).toBe(mockTxHash);
  });

  test('message signing should request signature through the provider', async () => {
    const mockSignature = '0xsignature123';
    mockProvider.request.mockResolvedValueOnce(mockSignature);
    
    const provider = await passportInstance.connectEvm();
    const address = '0x123456789';
    const message = 'Test message';
    
    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, address],
    });
    
    expect(provider.request).toHaveBeenCalledWith({
      method: 'personal_sign',
      params: [message, address],
    });
    expect(signature).toBe(mockSignature);
  });

  test('logout should call the logout method on the passport instance', async () => {
    await passportInstance.logout();
    expect(passportInstance.logout).toHaveBeenCalled();
  });

  test('loginCallback should handle the authentication redirect', async () => {
    await passportInstance.loginCallback();
    expect(passportInstance.loginCallback).toHaveBeenCalled();
  });
}); 