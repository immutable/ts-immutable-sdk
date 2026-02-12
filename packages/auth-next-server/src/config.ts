// NextAuthConfig type from next-auth v5
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Type exists in next-auth v5 but TS resolver may use stale types
import type { NextAuthConfig } from 'next-auth';
import CredentialsImport from 'next-auth/providers/credentials';
import { encode as encodeImport } from 'next-auth/jwt';
import type { ImmutableAuthConfig, ImmutableTokenData, UserInfoResponse } from './types';
import { isTokenExpired, refreshAccessToken, extractZkEvmFromIdToken } from './refresh';
import {
  DEFAULT_AUTH_DOMAIN,
  IMMUTABLE_PROVIDER_ID,
  DEFAULT_SESSION_MAX_AGE_SECONDS,
} from './constants';
import { deriveDefaultClientId, deriveDefaultRedirectUri } from './defaultConfig';

// Handle ESM/CJS interop - in some bundler configurations, the default export
// may be nested under a 'default' property
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Credentials = ((CredentialsImport as any).default || CredentialsImport) as typeof CredentialsImport;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultJwtEncode = ((encodeImport as any).default || encodeImport) as typeof encodeImport;

/**
 * Validate tokens by calling the userinfo endpoint.
 * This is the standard OAuth 2.0 way to validate access tokens server-side.
 * The auth server validates signature, issuer, audience, and expiry.
 *
 * @param accessToken - The access token to validate
 * @param authDomain - The authentication domain
 * @returns The user info if valid, null otherwise
 */
async function validateTokens(
  accessToken: string,
  authDomain: string,
): Promise<UserInfoResponse | null> {
  try {
    const response = await fetch(`${authDomain}/userinfo`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('[auth-next-server] Token validation failed:', response.status, response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[auth-next-server] Token validation error:', error);
    return null;
  }
}

/**
 * Create Auth.js v5 configuration for Immutable authentication.
 *
 * Config is optional - when omitted, sensible defaults are used:
 * - `clientId`: Auto-detected (sandbox for localhost/sandbox hostnames or NODE_ENV=development, production otherwise)
 * - `redirectUri`: Auto-derived from `window.location.origin + '/callback'` (path only on server)
 *
 * @param config - Optional configuration. All fields can be overridden.
 *
 * @example
 * ```typescript
 * // Zero config - only AUTH_SECRET required in .env
 * import NextAuth from "next-auth";
 * import { createAuthConfig } from "@imtbl/auth-next-server";
 *
 * export const { handlers, auth, signIn, signOut } = NextAuth(createAuthConfig());
 * ```
 *
 * @example
 * ```typescript
 * // With custom config
 * import NextAuth from "next-auth";
 * import { createAuthConfig } from "@imtbl/auth-next-server";
 *
 * export const { handlers, auth, signIn, signOut } = NextAuth(createAuthConfig({
 *   clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
 *   redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
 * }));
 * ```
 */
export function createAuthConfig(config?: Partial<ImmutableAuthConfig>): NextAuthConfig {
  const clientId = config?.clientId || deriveDefaultClientId();
  const redirectUri = config?.redirectUri || deriveDefaultRedirectUri();
  const resolvedConfig: ImmutableAuthConfig = {
    clientId,
    redirectUri,
    audience: config?.audience,
    scope: config?.scope,
    authenticationDomain: config?.authenticationDomain,
  };
  const authDomain = resolvedConfig.authenticationDomain || DEFAULT_AUTH_DOMAIN;

  return {
    // Custom jwt.encode: strip idToken from the cookie to reduce size and avoid
    // CloudFront 413 "Request Entity Too Large" errors. The idToken (~1-2 KB) is
    // still available in session responses (after sign-in or token refresh) because
    // the session callback runs BEFORE encode. All data extracted FROM idToken
    // (email, nickname, zkEvm) remains in the cookie as separate fields.
    // On the client, idToken is persisted in localStorage by @imtbl/auth-next-client.
    jwt: {
      async encode(params) {
        const { token, ...rest } = params;
        if (token) {
          const { idToken, ...cookieToken } = token as Record<string, unknown>;
          return defaultJwtEncode({ ...rest, token: cookieToken });
        }
        return defaultJwtEncode(params);
      },
    },

    providers: [
      Credentials({
        id: IMMUTABLE_PROVIDER_ID,
        name: 'Immutable',
        credentials: {
          tokens: { label: 'Tokens', type: 'text' },
        },
        async authorize(credentials) {
          if (!credentials?.tokens || typeof credentials.tokens !== 'string') {
            return null;
          }

          let tokenData: ImmutableTokenData;
          try {
            tokenData = JSON.parse(credentials.tokens);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[auth-next-server] Failed to parse token data:', error);
            return null;
          }

          // Validate required fields exist to prevent TypeError on malformed requests
          // accessTokenExpires must be a valid number to ensure isTokenExpired() works correctly
          // (NaN comparisons always return false, which would prevent token refresh)
          if (
            !tokenData.accessToken
            || typeof tokenData.accessToken !== 'string'
            || !tokenData.profile
            || typeof tokenData.profile !== 'object'
            || !tokenData.profile.sub
            || typeof tokenData.profile.sub !== 'string'
            || typeof tokenData.accessTokenExpires !== 'number'
            || Number.isNaN(tokenData.accessTokenExpires)
          ) {
            // eslint-disable-next-line no-console
            console.error('[auth-next-server] Invalid token data structure - missing required fields');
            return null;
          }

          // Validate tokens server-side via userinfo endpoint.
          // This is the standard OAuth 2.0 way - the auth server validates the token.
          const userInfo = await validateTokens(tokenData.accessToken, authDomain);
          if (!userInfo) {
            // eslint-disable-next-line no-console
            console.error('[auth-next-server] Token validation failed - rejecting authentication');
            return null;
          }

          // Verify the user ID (sub) from userinfo matches the client-provided profile.
          // This prevents spoofing a different user ID with a valid token.
          if (userInfo.sub !== tokenData.profile.sub) {
            // eslint-disable-next-line no-console
            console.error(
              '[auth-next-server] User ID mismatch - userinfo sub:',
              userInfo.sub,
              'provided sub:',
              tokenData.profile.sub,
            );
            return null;
          }

          // Return user object with validated data
          return {
            id: userInfo.sub,
            sub: userInfo.sub,
            email: userInfo.email ?? tokenData.profile.email,
            nickname: userInfo.nickname ?? tokenData.profile.nickname,
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            idToken: tokenData.idToken,
            accessTokenExpires: tokenData.accessTokenExpires,
            zkEvm: tokenData.zkEvm,
          };
        },
      }),
    ],

    callbacks: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async jwt({
        token, user, trigger, session: sessionUpdate,
      }: any) {
        try {
          // Initial sign in - store all token data
          if (user) {
            return {
              ...token,
              sub: user.sub,
              email: user.email,
              nickname: user.nickname,
              accessToken: user.accessToken,
              refreshToken: user.refreshToken,
              idToken: user.idToken,
              accessTokenExpires: user.accessTokenExpires,
              zkEvm: user.zkEvm,
            };
          }

          // Handle session update (for client-side token sync or forceRefresh)
          // When client-side Auth refreshes tokens via TOKEN_REFRESHED event,
          // it calls updateSession() which triggers this callback with the new tokens.
          // We clear any stale error (e.g., TokenExpired) on successful update.
          if (trigger === 'update' && sessionUpdate) {
            const update = sessionUpdate as Record<string, unknown>;

            // If forceRefresh is requested, perform server-side token refresh
            // This is used after zkEVM registration to get updated claims from IDP
            if (update.forceRefresh && token.refreshToken) {
              try {
                const refreshed = await refreshAccessToken(
                  token.refreshToken as string,
                  resolvedConfig.clientId,
                  authDomain,
                );
                // Extract zkEvm claims from the refreshed idToken
                const zkEvm = extractZkEvmFromIdToken(refreshed.idToken);
                return {
                  ...token,
                  accessToken: refreshed.accessToken,
                  refreshToken: refreshed.refreshToken,
                  idToken: refreshed.idToken,
                  accessTokenExpires: refreshed.accessTokenExpires,
                  zkEvm: zkEvm ?? token.zkEvm, // Keep existing zkEvm if not in new token
                  error: undefined,
                };
              } catch (error) {
              // eslint-disable-next-line no-console
                console.error('[auth-next-server] Force refresh failed:', error);
                return {
                  ...token,
                  error: 'RefreshTokenError',
                };
              }
            }

            // Standard session update - merge provided values
            return {
              ...token,
              ...(update.accessToken ? { accessToken: update.accessToken } : {}),
              ...(update.refreshToken ? { refreshToken: update.refreshToken } : {}),
              ...(update.idToken ? { idToken: update.idToken } : {}),
              ...(update.accessTokenExpires ? { accessTokenExpires: update.accessTokenExpires } : {}),
              ...(update.zkEvm ? { zkEvm: update.zkEvm } : {}),
              // Clear any stale error when valid tokens are synced from client-side
              error: undefined,
            };
          }

          // Return token if not expired
          if (!isTokenExpired(token.accessTokenExpires as number)) {
            return token;
          }

          // Token expired - attempt server-side refresh
          // This ensures clients always get fresh tokens from session callbacks
          if (token.refreshToken) {
            try {
              const refreshed = await refreshAccessToken(
                token.refreshToken as string,
                resolvedConfig.clientId,
                authDomain,
              );
              // Extract zkEvm claims from the refreshed idToken
              const zkEvm = extractZkEvmFromIdToken(refreshed.idToken);
              return {
                ...token,
                accessToken: refreshed.accessToken,
                refreshToken: refreshed.refreshToken,
                idToken: refreshed.idToken,
                accessTokenExpires: refreshed.accessTokenExpires,
                zkEvm: zkEvm ?? token.zkEvm, // Keep existing zkEvm if not in new token
                error: undefined, // Clear any previous error
              };
            } catch (error) {
            // eslint-disable-next-line no-console
              console.error('[auth-next-server] Token refresh failed:', error);
              return {
                ...token,
                error: 'RefreshTokenError',
              };
            }
          }

          // No refresh token available
          return {
            ...token,
            error: 'TokenExpired',
          };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[auth-next-server] JWT callback error:', error);
          throw error;
        }
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async session({ session, token }: any) {
        try {
          // Expose token data to the session
          return {
            ...session,
            user: {
              ...session.user,
              sub: token.sub as string,
              email: token.email as string | undefined,
              nickname: token.nickname as string | undefined,
            },
            accessToken: token.accessToken as string,
            refreshToken: token.refreshToken as string | undefined,
            idToken: token.idToken as string | undefined,
            accessTokenExpires: token.accessTokenExpires as number,
            zkEvm: token.zkEvm,
            ...(token.error && { error: token.error as string }),
          };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[auth-next-server] Session callback error:', error);
          throw error;
        }
      },
    },

    session: {
      strategy: 'jwt',
      // Session max age in seconds (365 days default)
      maxAge: DEFAULT_SESSION_MAX_AGE_SECONDS,
    },
  };
}

// Keep backwards compatibility alias
export const createAuthOptions = createAuthConfig;
