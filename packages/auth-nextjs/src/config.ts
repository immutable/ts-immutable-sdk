import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { ImmutableAuthConfig, ImmutableTokenData } from './types';
import { refreshAccessToken, isTokenExpired } from './refresh';

// Handle ESM/CJS interop - CredentialsProvider may be default export or the module itself
const CredentialsProvider = (Credentials as unknown as { default?: typeof Credentials }).default || Credentials;

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
  return {
    providers: [
      CredentialsProvider({
        id: 'immutable',
        name: 'Immutable',
        credentials: {
          tokens: { label: 'Tokens', type: 'text' },
        },
        async authorize(credentials) {
          if (!credentials?.tokens) {
            return null;
          }

          try {
            const tokenData: ImmutableTokenData = JSON.parse(credentials.tokens);

            // Return user object with all token data
            return {
              id: tokenData.profile.sub,
              sub: tokenData.profile.sub,
              email: tokenData.profile.email,
              nickname: tokenData.profile.nickname,
              accessToken: tokenData.accessToken,
              refreshToken: tokenData.refreshToken,
              idToken: tokenData.idToken,
              accessTokenExpires: tokenData.accessTokenExpires,
              zkEvm: tokenData.zkEvm,
            };
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[auth-nextjs] Failed to parse token data:', error);
            return null;
          }
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
      maxAge: 30 * 24 * 60 * 60,
    },

    // Use NEXTAUTH_SECRET from environment
    secret: process.env.NEXTAUTH_SECRET,
  };
}
