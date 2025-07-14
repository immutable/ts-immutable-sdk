import encode from 'jwt-encode';
import {
  User as OidcUser,
} from 'oidc-client-ts';
import { isIdTokenExpired, isAccessTokenExpiredOrExpiring } from './token';

const now = Math.floor(Date.now() / 1000);
const oneHourLater = now + 3600;
const oneHourBefore = now - 3600;
const fifteenSecondsLater = now + 15;
const fortyFiveSecondsLater = now + 45;

const mockExpiredIdToken = encode({
  iat: oneHourBefore,
  exp: oneHourBefore,
}, 'secret');

export const mockValidIdToken = encode({
  iat: now,
  exp: oneHourLater,
}, 'secret');

const mockFreshAccessToken = encode({
  exp: fortyFiveSecondsLater, // Expires in 45 seconds (outside 30-second buffer)
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
  it('should return true if access token is missing', () => {
    const user = {
      id_token: mockValidIdToken,
      access_token: undefined,
    } as unknown as OidcUser;
    expect(isAccessTokenExpiredOrExpiring(user)).toBe(true);
  });

  it('should return true if id token is missing', () => {
    const mockValidAccessToken = encode({
      exp: oneHourLater,
    }, 'secret');

    const user = {
      id_token: undefined,
      access_token: mockValidAccessToken,
    } as unknown as OidcUser;
    expect(isAccessTokenExpiredOrExpiring(user)).toBe(true);
  });

  it('should return true if access token is expired', () => {
    const mockExpiredAccessToken = encode({
      exp: oneHourBefore,
    }, 'secret');

    const user = {
      id_token: mockValidIdToken,
      access_token: mockExpiredAccessToken,
    } as unknown as OidcUser;
    expect(isAccessTokenExpiredOrExpiring(user)).toBe(true);
  });

  it('should return true if access token is expiring within 30 seconds', () => {
    const mockExpiringAccessToken = encode({
      exp: fifteenSecondsLater, // Expires in 15 seconds (within 30-second buffer)
    }, 'secret');

    const user = {
      id_token: mockValidIdToken,
      access_token: mockExpiringAccessToken,
    } as unknown as OidcUser;
    expect(isAccessTokenExpiredOrExpiring(user)).toBe(true);
  });

  it('should return true if access token is valid but id token is expired', () => {
    const user = {
      id_token: mockExpiredIdToken,
      access_token: mockFreshAccessToken,
    } as unknown as OidcUser;
    expect(isAccessTokenExpiredOrExpiring(user)).toBe(true);
  });

  it('should return false if both tokens are valid and not expiring', () => {
    const user = {
      id_token: mockValidIdToken,
      access_token: mockFreshAccessToken,
    } as unknown as OidcUser;
    expect(isAccessTokenExpiredOrExpiring(user)).toBe(false);
  });

  it('should return true if access token is malformed', () => {
    const user = {
      id_token: mockValidIdToken,
      access_token: 'invalid-jwt-token',
    } as unknown as OidcUser;
    expect(isAccessTokenExpiredOrExpiring(user)).toBe(true);
  });

  it('should return true if access token has no exp claim (security vulnerability)', () => {
    const accessTokenWithoutExp = encode({
      iat: now,
      sub: 'user123',
    }, 'secret');

    const user = {
      id_token: mockValidIdToken,
      access_token: accessTokenWithoutExp,
    } as unknown as OidcUser;
    expect(isAccessTokenExpiredOrExpiring(user)).toBe(true);
  });
});
