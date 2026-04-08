import { PassportError as AuthPassportError } from '@imtbl/auth';
import {
  PassportError,
  PassportErrorType,
} from './passportError';

describe('passportError', () => {
  it('treats errors thrown from auth as PassportError instances', () => {
    const authError = new AuthPassportError(
      'test error',
      PassportErrorType.AUTHENTICATION_ERROR,
    );

    expect(authError).toBeInstanceOf(PassportError);
  });
});
