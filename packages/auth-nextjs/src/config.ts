import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { ImmutableAuthConfig, ImmutableTokenData, UserInfoResponse } from './types';
import { refreshAccessToken, isTokenExpired } from './refresh';
import {
  DEFAULT_AUTH_DOMAIN,
  IMMUTABLE_PROVIDER_ID,
  DEFAULT_SESSION_MAX_AGE_SECONDS,
} from './constants';

// Handle ESM/CJS interop - CredentialsProvider may be default export or the module itself
const CredentialsProvider = (Credentials as unknown as { default?: typeof Credentials }).default || Credentials;

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
 * Create NextAuth options configured for Immutable authentication
 *
 * @example
 * ```typescript
 * // lib/auth.ts
 * import { createAuthOptions } from "@imtbl/auth-nextjs";
 *
 * export const authOptions = createAuthOptions({
 *   clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
 *   redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
 * });
 *
 * // pages/api/auth/[...nextauth].ts
 * import NextAuth from "next-auth";
 * import { authOptions } from "@/lib/auth";
 *
 * export default NextAuth(authOptions);
 * ```
 */
export function createAuthOptions(config: ImmutableAuthConfig): NextAuthOptions {
  const authDomain = config.authenticationDomain || DEFAULT_AUTH_DOMAIN;

  return {
    providers: [
      CredentialsProvider({
        id: IMMUTABLE_PROVIDER_ID,
        name: 'Immutable',
        credentials: {
          tokens: { label: 'Tokens', type: 'text' },
        },
        async authorize(credentials) {
          if (!credentials?.tokens) {
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
      async jwt({
        token, user, trigger, session: sessionUpdate,
      }) {
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
        if (trigger === 'update' && sessionUpdate) {
          return {
            ...token,
            ...(sessionUpdate.accessToken && { accessToken: sessionUpdate.accessToken }),
            ...(sessionUpdate.refreshToken && { refreshToken: sessionUpdate.refreshToken }),
            ...(sessionUpdate.idToken && { idToken: sessionUpdate.idToken }),
            ...(sessionUpdate.accessTokenExpires && { accessTokenExpires: sessionUpdate.accessTokenExpires }),
            ...(sessionUpdate.zkEvm && { zkEvm: sessionUpdate.zkEvm }),
          };
        }

        // Return token if not expired
        if (!isTokenExpired(token.accessTokenExpires)) {
          return token;
        }

        // Token expired - refresh it
        return refreshAccessToken(token, config);
      },

      async session({ session, token }) {
        // Expose token data to the session
        return {
          ...session,
          user: {
            sub: token.sub,
            email: token.email,
            nickname: token.nickname,
          },
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          idToken: token.idToken,
          accessTokenExpires: token.accessTokenExpires,
          zkEvm: token.zkEvm,
          ...(token.error && { error: token.error }),
        };
      },
    },

    session: {
      strategy: 'jwt',
      // Session max age in seconds (30 days default)
      maxAge: DEFAULT_SESSION_MAX_AGE_SECONDS,
    },

    // Use NEXTAUTH_SECRET from environment
    secret: process.env.NEXTAUTH_SECRET,
  };
}
