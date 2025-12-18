'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { Auth } from '@imtbl/auth';
import type { ImmutableAuthConfig, ImmutableTokenData } from '../types';
import { getTokenExpiry } from '../utils/token';

export interface CallbackPageProps {
  /**
   * Immutable auth configuration
   */
  config: ImmutableAuthConfig;
  /**
   * URL to redirect to after successful authentication (when not in popup)
   */
  redirectTo?: string;
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactElement | null;
  /**
   * Custom error component
   */
  errorComponent?: (error: string) => React.ReactElement | null;
}

const DEFAULT_AUTH_DOMAIN = 'https://auth.immutable.com';

/**
 * Callback page component for handling OAuth redirects.
 *
 * Use this in your callback page to process authentication responses.
 *
 * @example
 * ```tsx
 * // pages/callback.tsx
 * import { CallbackPage } from "@imtbl/auth-nextjs/client";
 * import { immutableConfig } from "@/lib/auth-nextjs";
 *
 * export default function Callback() {
 *   return <CallbackPage config={immutableConfig} />;
 * }
 * ```
 */
export function CallbackPage({
  config,
  redirectTo = '/',
  loadingComponent = null,
  errorComponent,
}: CallbackPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Create Auth instance to handle the callback
        const auth = new Auth({
          clientId: config.clientId,
          redirectUri: config.redirectUri,
          logoutRedirectUri: config.logoutRedirectUri,
          audience: config.audience || 'platform_api',
          scope: config.scope || 'openid profile email offline_access transact',
          authenticationDomain: config.authenticationDomain || DEFAULT_AUTH_DOMAIN,
        });

        // Process the callback - this extracts tokens from the URL and returns the user
        const authUser = await auth.loginCallback();

        // Check if we're in a popup window
        if (window.opener) {
          // Close the popup - the parent window will receive the tokens via Auth events
          window.close();
        } else {
          // Not in a popup - create NextAuth session before redirecting
          // This ensures SSR/session-based auth is authenticated
          if (authUser) {
            const tokenData: ImmutableTokenData = {
              accessToken: authUser.accessToken,
              refreshToken: authUser.refreshToken,
              idToken: authUser.idToken,
              accessTokenExpires: getTokenExpiry(authUser.accessToken),
              profile: {
                sub: authUser.profile.sub,
                email: authUser.profile.email,
                nickname: authUser.profile.nickname,
              },
              zkEvm: authUser.zkEvm,
            };

            // Sign in to NextAuth with the tokens
            // Note: signIn uses the basePath from SessionProvider context,
            // so ensure CallbackPage is rendered within ImmutableAuthProvider
            await signIn('immutable', {
              tokens: JSON.stringify(tokenData),
              redirect: false,
            });
          }

          // Redirect to specified page
          router.replace(redirectTo);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    const handleOAuthError = () => {
      // OAuth providers return error and error_description when authentication fails
      // (e.g., user cancels, consent denied, invalid request)
      const errorCode = router.query.error as string;
      const errorDescription = router.query.error_description as string;

      const errorMessage = errorDescription || errorCode || 'Authentication failed';
      setError(errorMessage);
    };

    if (!router.isReady) {
      return;
    }

    // Handle OAuth error responses (user cancelled, consent denied, etc.)
    if (router.query.error) {
      handleOAuthError();
      return;
    }

    // Handle successful OAuth callback with authorization code
    if (router.query.code) {
      handleCallback();
    }
  }, [
    router.isReady, router.query.code, router.query.error, router.query.error_description, router, config, redirectTo,
  ]);

  if (error) {
    if (errorComponent) {
      return errorComponent(error);
    }

    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#dc3545' }}>Authentication Error</h2>
        <p>{error}</p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '0.5rem 1rem',
            marginTop: '1rem',
            cursor: 'pointer',
          }}
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (loadingComponent) {
    return loadingComponent;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Completing authentication...</p>
    </div>
  );
}
