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
  DEFAULT_PRODUCTION_CLIENT_ID,
  DEFAULT_SANDBOX_CLIENT_ID,
  DEFAULT_REDIRECT_URI_PATH,
} from './constants';

// Handle ESM/CJS interop - in some bundler configurations, the default export
// may be nested under a 'default' property
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Credentials = ((CredentialsImport as any).default || CredentialsImport) as typeof CredentialsImport;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultJwtEncode = ((encodeImport as any).default || encodeImport) as typeof encodeImport;

/**
 * Detect if we're in a sandbox/test environment based on the current URL.
 * Checks if the hostname includes 'sandbox' or 'localhost'.
 * Server-side safe: returns false if window is not available.
 *
 * @returns true if in sandbox environment, false otherwise
 * @internal
 */
function isSandboxEnvironment(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: cannot detect, default to production for safety
    return false;
  }

  const hostname = window.location.hostname.toLowerCase();
  return hostname.includes('sandbox') || hostname.includes('localhost');
}

/**
 * Derive the default clientId based on the environment.
 * Uses public Immutable client IDs for sandbox and production.
 *
 * @returns Default client ID for the current environment
 * @internal
 */
function deriveDefaultClientId(): string {
  return isSandboxEnvironment() ? DEFAULT_SANDBOX_CLIENT_ID : DEFAULT_PRODUCTION_CLIENT_ID;
}

/**
 * Derive the default redirectUri based on the current URL.
 * Server-side safe: returns a placeholder that will be replaced client-side.
 *
 * @returns Default redirect URI
 * @internal
 */
function deriveDefaultRedirectUri(): string {
  if (typeof window === 'undefined') {
    // Server-side: return path only, will be combined with window.location.origin client-side
    return DEFAULT_REDIRECT_URI_PATH;
  }

  return `${window.location.origin}${DEFAULT_REDIRECT_URI_PATH}`;
}

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
 * Create Auth.js v5 configuration for Immutable authentication
 *
 * @example
 * ```typescript
 * // lib/auth.ts
 * import NextAuth from "next-auth";
 * import { createAuthConfig } from "@imtbl/auth-next-server";
 *
 * const config = {
 *   clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
 *   redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
 * };
 *
 * export const { handlers, auth, signIn, signOut } = NextAuth(createAuthConfig(config));
 * ```
 */
export function createAuthConfig(config: ImmutableAuthConfig): NextAuthConfig {
  const authDomain = config.authenticationDomain || DEFAULT_AUTH_DOMAIN;

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
                  config.clientId,
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
                config.clientId,
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

/**
 * Create Auth.js v5 configuration for Immutable authentication with all parameters optional.
 *
 * This is a convenience wrapper around `createAuthConfig` that provides sensible defaults:
 * - Auto-detects `clientId` based on environment (sandbox vs production)
 * - Auto-derives `redirectUri` from `window.location.origin + '/callback'`
 * - Uses default values for `audience`, `scope`, and `authenticationDomain`
 *
 * **Important**: This uses public Immutable client IDs for development convenience.
 * For production applications, you should use your own client ID from Immutable Hub.
 *
 * @param config - Optional partial configuration. All fields can be overridden.
 * @returns Auth.js v5 configuration object
 *
 * @example
 * ```typescript
 * // Minimal setup - all defaults
 * import NextAuth from "next-auth";
 * import { createDefaultAuthConfig } from "@imtbl/auth-next-server";
 *
 * export const { handlers, auth, signIn, signOut } = NextAuth(createDefaultAuthConfig());
 * ```
 *
 * @example
 * ```typescript
 * // Override specific fields
 * import NextAuth from "next-auth";
 * import { createDefaultAuthConfig } from "@imtbl/auth-next-server";
 *
 * export const { handlers, auth, signIn, signOut } = NextAuth(createDefaultAuthConfig({
 *   clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID, // Use your own client ID
 * }));
 * ```
 */
export function createDefaultAuthConfig(config?: Partial<ImmutableAuthConfig>): NextAuthConfig {
  const clientId = config?.clientId || deriveDefaultClientId();
  const redirectUri = config?.redirectUri || deriveDefaultRedirectUri();

  return createAuthConfig({
    clientId,
    redirectUri,
    audience: config?.audience,
    scope: config?.scope,
    authenticationDomain: config?.authenticationDomain,
  });
}
