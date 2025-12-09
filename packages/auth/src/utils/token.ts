import {
  User as OidcUser,
} from 'oidc-client-ts';
import { IdTokenPayload, TokenPayload } from '../types';
import { decodeJwtPayload } from './jwt';

function isTokenExpiredOrExpiring(token: string): boolean {
  try {
    // try to decode the token as access token payload or id token payload
    const decodedToken = decodeJwtPayload<TokenPayload | IdTokenPayload>(token);
    const now = Math.floor(Date.now() / 1000);

    // Tokens without expiration claims are invalid (security vulnerability)
    if (!decodedToken.exp) {
      return true;
    }

    // Check if token is expired or expiring in 30 seconds or less
    return decodedToken.exp <= now + 30;
  } catch (error) {
    // If we can't decode the token, assume it's invalid
    return true;
  }
}

export function isAccessTokenExpiredOrExpiring(oidcUser: OidcUser): boolean {
  const { id_token: idToken, access_token: accessToken } = oidcUser;

  if (!accessToken || !idToken) {
    return true;
  }

  // Check if either token is expired or expiring
  return isTokenExpiredOrExpiring(accessToken) || isTokenExpiredOrExpiring(idToken);
}
