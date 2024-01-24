import { IdTokenPayload } from 'types';
import jwt_decode from 'jwt-decode';
import {
  User as OidcUser,
} from 'oidc-client-ts';

export function isIdTokenExpired(idToken: string | undefined): boolean {
  if (!idToken) {
    return false;
  }

  const decodedToken = jwt_decode<IdTokenPayload>(idToken);
  const now = Math.floor(Date.now() / 1000) - 10; // refresh if it's expiring within the next 10 seconds
  return decodedToken.exp < now;
}

export function isTokenExpired(oidcUser: OidcUser): boolean {
  const { id_token: idToken, expired } = oidcUser;
  if (expired) {
    return true;
  }
  return isIdTokenExpired(idToken);
}
