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
      new CheckoutError(
        '[GET_BALANCE_ERROR] Cause:Error message',
        CheckoutErrorType.GET_BALANCE_ERROR
      )
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
        '[GET_BALANCE_ERROR]:Custom message. Cause:Error message',
        CheckoutErrorType.GET_BALANCE_ERROR
      )
    );
  });

  it('should throw CheckoutError with the checkout error type, message, and, data', async () => {
    const errorFunction = jest.fn();
    errorFunction.mockRejectedValue(new Error('Error message'));

    try {
      await withCheckoutError(errorFunction, {
        type: CheckoutErrorType.GET_BALANCE_ERROR,
        message: 'Custom message',
        data: { details: 'some error details' },
      });
    } catch (errorObject: any) {
      // 3 separate assertions because rejects.toThrow does not match any object details except for the message field
      // https://github.com/facebook/jest/issues/11693
      expect(errorObject.type).toEqual(CheckoutErrorType.GET_BALANCE_ERROR);
      expect(errorObject.message).toEqual(
        '[GET_BALANCE_ERROR]:Custom message. Cause:Error message'
      );
      expect(errorObject.data).toEqual({
        details: 'some error details',
      });
    }
  });

  it('should throw CheckoutError with the inner CheckoutError details', async () => {
    const errorFunction = jest.fn();
    errorFunction.mockRejectedValue(
      new CheckoutError(
        'Error message',
        CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
        { innerDetails: 'inner details of main error' }
      )
    );
    try {
      await withCheckoutError(errorFunction, {
        type: CheckoutErrorType.GET_BALANCE_ERROR,
        message: 'Custom message',
        data: { details: 'some error details' },
      });
    } catch (errorObject: any) {
      // 3 separate assertions because rejects.toThrow does not match any object details except for the message field
      // https://github.com/facebook/jest/issues/11693
      expect(errorObject.type).toEqual(CheckoutErrorType.GET_BALANCE_ERROR);
      expect(errorObject.message).toEqual(
        '[GET_BALANCE_ERROR]:Custom message. Cause:Error message'
      );
      expect(errorObject.data).toEqual({
        details: 'some error details',
        innerErrorType: CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
        innerDetails: 'inner details of main error',
      });
    }
  });
});
