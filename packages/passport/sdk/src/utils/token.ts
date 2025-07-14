import jwt_decode from 'jwt-decode';
import {
  User as OidcUser,
} from 'oidc-client-ts';
import { IdTokenPayload, TokenPayload } from '../types';

export function isIdTokenExpired(idToken: string | undefined): boolean {
  if (!idToken) {
    return false;
  }

  const decodedToken = jwt_decode<IdTokenPayload>(idToken);
  const now = Math.floor(Date.now() / 1000);
  return decodedToken.exp < now;
}

export function isAccessTokenExpiredOrExpiring(oidcUser: OidcUser): boolean {
  const { id_token: idToken, access_token: accessToken } = oidcUser;

  // Handle missing tokens - assume they need to login again
  if (!accessToken || !idToken) {
    return true;
  }

  // Decode the access token to check its expiration
  try {
    const decodedAccessToken = jwt_decode<TokenPayload>(accessToken);
    const now = Math.floor(Date.now() / 1000);

    // Access tokens without expiration claims are invalid (security vulnerability)
    if (!decodedAccessToken.exp) {
      return true;
    }

    // Check if access token is expired or expiring in 30 seconds or less
    if (decodedAccessToken.exp <= now + 30) {
      return true;
    }
  } catch (error) {
    // If we can't decode the access token, assume it's invalid
    return true;
  }

  return isIdTokenExpired(idToken);
}
