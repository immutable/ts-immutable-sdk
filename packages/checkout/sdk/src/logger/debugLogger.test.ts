import { Environment } from '@imtbl/config';
import { CheckoutConfiguration } from '../config';
import { debugLogger, measureAsyncExecution } from './debugLogger';

describe('debugLogger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  it('should call underlying function and return result of the promise', async () => {
    const testCheckoutConfig = { environment: Environment.SANDBOX } as CheckoutConfiguration;
    const debugString = 'Test Debug String';
    const mockResult = 'Mock Result';
    const mockPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve(mockResult), 100);
    });
    const result = await measureAsyncExecution<string>(testCheckoutConfig, debugString, mockPromise);
    expect(result).toEqual(mockResult);
  });

  it('should call console if production false', () => {
    const testCheckoutConfig = { environment: Environment.SANDBOX } as CheckoutConfiguration;
    const consoleDebugSpy = jest.spyOn(console, 'info').mockImplementation();
    const debugString = 'Test Debug String';
    debugLogger(testCheckoutConfig, debugString, 1);
    expect(consoleDebugSpy).toHaveBeenCalledWith(debugString, 1);
    consoleDebugSpy.mockRestore();
  });

  it('should not call console if production', () => {
    const testCheckoutConfig = { environment: Environment.PRODUCTION } as CheckoutConfiguration;
    const consoleDebugSpy = jest.spyOn(console, 'info').mockImplementation();
    const debugString = 'Test Debug String';
    debugLogger(testCheckoutConfig, debugString, 1);
    expect(consoleDebugSpy).not.toBeCalled();
    consoleDebugSpy.mockRestore();
  });
});
