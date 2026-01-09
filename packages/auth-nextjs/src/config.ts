// NextAuthConfig type from next-auth v5
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Type exists in next-auth v5 but TS resolver may use stale types
import type { NextAuthConfig } from 'next-auth';
import CredentialsImport from 'next-auth/providers/credentials';
import type { ImmutableAuthConfig, ImmutableTokenData, UserInfoResponse } from './types';
import { refreshAccessToken, isTokenExpired } from './refresh';
import {
  DEFAULT_AUTH_DOMAIN,
  IMMUTABLE_PROVIDER_ID,
  DEFAULT_SESSION_MAX_AGE_SECONDS,
} from './constants';

// Handle ESM/CJS interop - in some bundler configurations, the default export
// may be nested under a 'default' property
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Credentials = ((CredentialsImport as any).default || CredentialsImport) as typeof CredentialsImport;

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
      console.error('[auth-nextjs] Token validation failed:', response.status, response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[auth-nextjs] Token validation error:', error);
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
 * import { createAuthConfig } from "@imtbl/auth-nextjs";
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
            console.error('[auth-nextjs] Failed to parse token data:', error);
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
            console.error('[auth-nextjs] Invalid token data structure - missing required fields');
            return null;
          }

          // Validate tokens server-side via userinfo endpoint.
          // This is the standard OAuth 2.0 way - the auth server validates the token.
          const userInfo = await validateTokens(tokenData.accessToken, authDomain);
          if (!userInfo) {
            // eslint-disable-next-line no-console
            console.error('[auth-nextjs] Token validation failed - rejecting authentication');
            return null;
          }

          // Verify the user ID (sub) from userinfo matches the client-provided profile.
          // This prevents spoofing a different user ID with a valid token.
          if (userInfo.sub !== tokenData.profile.sub) {
            // eslint-disable-next-line no-console
            console.error(
              '[auth-nextjs] User ID mismatch - userinfo sub:',
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

        // Handle session update (for client-side token sync)
        // When client-side Auth refreshes tokens via TOKEN_REFRESHED event and syncs them here,
        // we must clear any stale error (e.g., from a previous server-side refresh failure).
        // This matches refreshAccessToken's behavior of setting error: undefined on success.
        if (trigger === 'update' && sessionUpdate) {
          const update = sessionUpdate as Record<string, unknown>;
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

        // Token expired - refresh it
        return refreshAccessToken(token, config);
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async session({ session, token }: any) {
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
      },
    },

    session: {
      strategy: 'jwt',
      // Session max age in seconds (30 days default)
      maxAge: DEFAULT_SESSION_MAX_AGE_SECONDS,
    },
  };
}

// Keep backwards compatibility alias
export const createAuthOptions = createAuthConfig;
