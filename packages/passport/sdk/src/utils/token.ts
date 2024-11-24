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

export function isTokenExpired(oidcUser: OidcUser): boolean {
  const { id_token: idToken, expired } = oidcUser;
  if (expired) {
    return true;
  }
  return isIdTokenExpired(idToken);
}
