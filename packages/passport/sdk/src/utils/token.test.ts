import encode from 'jwt-encode';
import {
  User as OidcUser,
} from 'oidc-client-ts';
import { isIdTokenExpired, isAccessTokenExpiredOrExpiring } from './token';

const now = Math.floor(Date.now() / 1000);
const oneHourLater = now + 3600;
const oneHourBefore = now - 3600;

const mockExpiredIdToken = encode({
  iat: oneHourBefore,
  exp: oneHourBefore,
}, 'secret');
export const mockValidIdToken = encode({
  iat: now,
  exp: oneHourLater,
}, 'secret');

describe('isIdTokenExpired', () => {
  it('should return false if idToken is undefined', () => {
    expect(isIdTokenExpired(undefined)).toBe(false);
  });

  it('should return true if idToken is expired', () => {
    expect(isIdTokenExpired(mockExpiredIdToken)).toBe(true);
  });

  it('should return false if idToken is not expired', () => {
    expect(isIdTokenExpired(mockValidIdToken)).toBe(false);
  });
});

describe('isAccessTokenExpiredOrExpiring', () => {
  it('should return true if expired is true', () => {
    const user = {
      id_token: mockValidIdToken,
      expired: true,
    } as unknown as OidcUser;
    expect(isAccessTokenExpiredOrExpiring(user)).toBe(true);
  });

  it('should return false if idToken is valid', () => {
    const user = {
      id_token: mockValidIdToken,
      expired: false,
    } as unknown as OidcUser;
    expect(isAccessTokenExpiredOrExpiring(user)).toBe(false);
  });

  it('should return true idToken is expired', () => {
    const user = {
      id_token: mockExpiredIdToken,
      expired: false,
    } as unknown as OidcUser;
    expect(isAccessTokenExpiredOrExpiring(user)).toBe(true);
  });
});
