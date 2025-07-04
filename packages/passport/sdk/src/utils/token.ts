import jwt_decode from 'jwt-decode';
import {
  User as OidcUser,
} from 'oidc-client-ts';
import { IdTokenPayload } from '../types';

export function isIdTokenExpired(idToken: string | undefined): boolean {
  if (!idToken) {
    return false;
  }

  const decodedToken = jwt_decode<IdTokenPayload>(idToken);
  const now = Math.floor(Date.now() / 1000);
  return decodedToken.exp < now;
}

export function isAccessTokenExpiredOrExpiring(oidcUser: OidcUser): boolean {
  const { id_token: idToken, expired, expires_in } = oidcUser;
  if (expired) {
    return true;
  }

  // if token will expire in 30 seconds or less, return true
  if (expires_in && expires_in <= 30) {
    return true;
  }

  // Handle missing idToken - assume they need to login again
  if (!idToken) {
    return true;
  }

  return isIdTokenExpired(idToken);
}
