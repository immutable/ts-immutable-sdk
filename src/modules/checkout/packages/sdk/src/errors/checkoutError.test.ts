import {
  CheckoutError,
  CheckoutErrorType,
  withCheckoutError,
} from './checkoutError';
  
describe('checkoutError', () => {
  afterEach(jest.resetAllMocks);
  
  it('should execute the function without throwing the error', async () => {
    const returnValue = 'success';
    const anyFn = jest.fn();
    anyFn.mockReturnValue(returnValue);

    expect(await withCheckoutError(anyFn, {
      type: CheckoutErrorType.BALANCE_ERROR,
    })).toEqual(returnValue);
  });

  it('should throw CheckoutError with the checkout error type', async () => {
    const errorFunction = jest.fn();
    errorFunction.mockRejectedValue(new Error('Error message'));

    await expect(withCheckoutError(errorFunction, {
      type: CheckoutErrorType.BALANCE_ERROR,
    })).rejects.toThrow(new CheckoutError(
      'Error message',
      CheckoutErrorType.BALANCE_ERROR
    ));
  });

  it('should throw CheckoutError with the checkout error type and custom error message', async () => {
    const errorFunction = jest.fn();
    errorFunction.mockRejectedValue(new Error('Error message'));

    await expect(withCheckoutError(errorFunction, {
      type: CheckoutErrorType.BALANCE_ERROR,
      message: "Custom message"
    })).rejects.toThrow(new CheckoutError(
      'Custom message',
      CheckoutErrorType.BALANCE_ERROR
    ));
  });
});
