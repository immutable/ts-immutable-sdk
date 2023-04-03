import {
  PassportError,
  PassportErrorType,
  withPassportError,
} from './passportError';

describe('passportError', () => {
  afterEach(jest.resetAllMocks);

  describe('withPassportError', () => {
    it('should execute the function without throwing the error', async () => {
      const returnValue = 'success';
      const anyFn = jest.fn();
      anyFn.mockReturnValue(returnValue);

      await expect(
        await withPassportError(anyFn, 
          PassportErrorType.AUTHENTICATION_ERROR,
        )
      ).toEqual(returnValue);
    });

    it('should re-throw PassportError with ', async () => {
      const errorFunction = jest.fn();
      errorFunction.mockRejectedValue(new Error('SOMETHINGWRONG'));

      await expect(
        withPassportError(errorFunction, 
          PassportErrorType.AUTHENTICATION_ERROR,
        )
      ).rejects.toThrow(
        new PassportError(
          'AUTHENTICATION_ERROR: SOMETHINGWRONG',
          PassportErrorType.AUTHENTICATION_ERROR
        )
      );
    });
  });
});
