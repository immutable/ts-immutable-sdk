import {
    ProviderError,
    ProviderErrorType,
    withProviderError,
  } from './providerError';
  
describe('providerError', () => {
  afterEach(jest.resetAllMocks);
  
  it('should execute the function without throwing the error', async () => {
    const returnValue = 'success';
    const anyFn = jest.fn();
    anyFn.mockReturnValue(returnValue);

    expect(await withProviderError(anyFn, {
        type: ProviderErrorType.PROVIDER_CONNECTION_ERROR,
    })).toEqual(returnValue);
  });

  it('should throw ProviderError with the provider error type', async () => {
    const errorFunction = jest.fn();
    errorFunction.mockRejectedValue(new Error('Error message'));

    await expect(withProviderError(errorFunction, {
        type: ProviderErrorType.PROVIDER_CONNECTION_ERROR,
    })).rejects.toThrow(new ProviderError(
        'Error message',
        ProviderErrorType.PROVIDER_CONNECTION_ERROR
    ));
  });

  it('should throw ProviderError with the provider error type and custom error message', async () => {
    const errorFunction = jest.fn();
    errorFunction.mockRejectedValue(new Error('Error message'));

    await expect(withProviderError(errorFunction, {
        type: ProviderErrorType.PROVIDER_CONNECTION_ERROR,
        message: "Custom message"
    })).rejects.toThrow(new ProviderError(
        'Custom message',
        ProviderErrorType.PROVIDER_CONNECTION_ERROR
    ));
  });
});
