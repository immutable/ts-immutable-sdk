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

    expect(
      await withCheckoutError(anyFn, {
        type: CheckoutErrorType.GET_BALANCE_ERROR,
      })
    ).toEqual(returnValue);
  });

  it('should throw CheckoutError with the checkout error type', async () => {
    const errorFunction = jest.fn();
    errorFunction.mockRejectedValue(new Error('Error message'));

    await expect(
      withCheckoutError(errorFunction, {
        type: CheckoutErrorType.GET_BALANCE_ERROR,
      })
    ).rejects.toThrow(
      new CheckoutError('Error message', CheckoutErrorType.GET_BALANCE_ERROR)
    );
  });

  it('should throw CheckoutError with the checkout error type and custom error message', async () => {
    const errorFunction = jest.fn();
    errorFunction.mockRejectedValue(new Error('Error message'));

    await expect(
      withCheckoutError(errorFunction, {
        type: CheckoutErrorType.GET_BALANCE_ERROR,
        message: 'Custom message',
      })
    ).rejects.toThrow(
      new CheckoutError(
        'Custom message. Cause:Error message',
        CheckoutErrorType.GET_BALANCE_ERROR
      )
    );
  });

  it('should throw CheckoutError with the checkout error type, message, and, data', async () => {
    const errorFunction = jest.fn();
    errorFunction.mockRejectedValue(new Error('Error message'));

    await expect(
      withCheckoutError(errorFunction, {
        type: CheckoutErrorType.GET_BALANCE_ERROR,
        message: 'Custom message',
        data: { details: 'some error details' },
      })
    ).rejects.toThrow(
      new CheckoutError(
        'Custom message. Cause:Error message',
        CheckoutErrorType.GET_BALANCE_ERROR,
        {
          details: 'some error details',
        }
      )
    );
  });

  it('should throw CheckoutError with the with internal CheckoutError details', async () => {
    const errorFunction = jest.fn();
    errorFunction.mockRejectedValue(
      new CheckoutError(
        'Error message',
        CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
        { innerDetails: 'inner details of main error' }
      )
    );

    await expect(
      withCheckoutError(errorFunction, {
        type: CheckoutErrorType.GET_BALANCE_ERROR,
        message: 'Custom message',
        data: { details: 'some error details' },
      })
    ).rejects.toThrow(
      new CheckoutError(
        'Custom message. Cause:Error message',
        CheckoutErrorType.GET_BALANCE_ERROR,
        {
          details: 'some error details',
          innerDetails: 'inner details of main error',
        }
      )
    );
  });
});
