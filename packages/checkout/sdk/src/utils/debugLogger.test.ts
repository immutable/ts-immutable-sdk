import { Environment } from '@imtbl/config';
import { debugLogger, measureAsyncExecution } from './debugLogger';
import { CheckoutConfiguration } from '../config';

describe('debugLogger', () => {
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

  it('should call console.debug in SANDBOX environment', () => {
    const testCheckoutConfig = { environment: Environment.SANDBOX } as CheckoutConfiguration;
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    const debugString = 'Test Debug String';
    debugLogger(testCheckoutConfig, debugString, 1);
    expect(consoleDebugSpy).toHaveBeenCalledWith(debugString, 1);
    consoleDebugSpy.mockRestore();
  });

  it('should not call console.debug in PRODUCTION environment', () => {
    const testCheckoutConfig = { environment: Environment.PRODUCTION } as CheckoutConfiguration;
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    const debugString = 'Test Debug String';
    debugLogger(testCheckoutConfig, debugString, 1);
    expect(consoleDebugSpy).not.toBeCalled();
    consoleDebugSpy.mockRestore();
  });
});
