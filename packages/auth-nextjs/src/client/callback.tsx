'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { Auth } from '@imtbl/auth';
import type { ImmutableAuthConfig, ImmutableTokenData } from '../types';
import { getTokenExpiry } from '../utils/token';
import {
  DEFAULT_AUTH_DOMAIN,
  DEFAULT_AUDIENCE,
  DEFAULT_SCOPE,
  IMMUTABLE_PROVIDER_ID,
} from '../constants';

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
  // Track whether callback has been processed to prevent double invocation
  // (React 18 StrictMode runs effects twice, and OAuth codes are single-use)
  const callbackProcessedRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Create Auth instance to handle the callback
        const auth = new Auth({
          clientId: config.clientId,
          redirectUri: config.redirectUri,
          logoutRedirectUri: config.logoutRedirectUri,
          audience: config.audience || DEFAULT_AUDIENCE,
          scope: config.scope || DEFAULT_SCOPE,
          authenticationDomain: config.authenticationDomain || DEFAULT_AUTH_DOMAIN,
        });

        // Process the callback - this extracts tokens from the URL and returns the user
        const authUser = await auth.loginCallback();

        // Check if we're in a popup window
        if (window.opener) {
          // Validate authUser before closing - if loginCallback failed silently,
          // we need to show an error instead of closing the popup
          if (!authUser) {
            throw new Error('Authentication failed: no user data received from login callback');
          }
          // Close the popup - the parent window will receive the tokens via Auth events
          window.close();
        } else if (authUser) {
          // Not in a popup - create NextAuth session before redirecting
          // This ensures SSR/session-based auth is authenticated
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
          const result = await signIn(IMMUTABLE_PROVIDER_ID, {
            tokens: JSON.stringify(tokenData),
            redirect: false,
          });

          // signIn with redirect: false returns a result object instead of throwing
          if (result?.error) {
            throw new Error(`NextAuth sign-in failed: ${result.error}`);
          }
          if (!result?.ok) {
            throw new Error('NextAuth sign-in failed: unknown error');
          }

          // Only redirect after successful session creation
          router.replace(redirectTo);
        } else {
          // authUser is undefined - loginCallback failed silently
          // This can happen if the OIDC signinCallback returns null
          throw new Error('Authentication failed: no user data received from login callback');
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
    // Guard against double invocation (React 18 StrictMode runs effects twice)
    if (router.query.code && !callbackProcessedRef.current) {
      callbackProcessedRef.current = true;
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
