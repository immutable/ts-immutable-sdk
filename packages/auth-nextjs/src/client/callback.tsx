'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Auth } from '@imtbl/auth';
import type { ImmutableAuthConfig, ImmutableTokenData, ImmutableUser } from '../types';
import { getTokenExpiry } from '../utils/token';
import {
  DEFAULT_AUTH_DOMAIN,
  DEFAULT_AUDIENCE,
  DEFAULT_SCOPE,
  IMMUTABLE_PROVIDER_ID,
} from '../constants';

/**
 * Get search params from the current URL.
 * Uses window.location.search directly to avoid issues with useSearchParams()
 * in Pages Router, where the hook may not be hydrated during initial render.
 */
function getSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
}

export interface CallbackPageProps {
  /**
   * Immutable auth configuration
   */
  config: ImmutableAuthConfig;
  /**
   * URL to redirect to after successful authentication (when not in popup).
   * Can be a string or a function that receives the authenticated user.
   * If a function returns void/undefined, defaults to "/".
   * @default "/"
   *
   * @example Static redirect
   * ```tsx
   * <CallbackPage config={config} redirectTo="/dashboard" />
   * ```
   *
   * @example Dynamic redirect based on user
   * ```tsx
   * <CallbackPage
   *   config={config}
   *   redirectTo={(user) => user.email?.endsWith('@admin.com') ? '/admin' : '/dashboard'}
   * />
   * ```
   */
  redirectTo?: string | ((user: ImmutableUser) => string | void);
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactElement | null;
  /**
   * Custom error component
   */
  errorComponent?: (error: string) => React.ReactElement | null;
  /**
   * Callback fired after successful authentication.
   * Receives the authenticated user as a parameter.
   * Called before redirect (non-popup) or before window.close (popup).
   * If this callback returns a Promise, it will be awaited before proceeding.
   */
  onSuccess?: (user: ImmutableUser) => void | Promise<void>;
  /**
   * Callback fired when authentication fails.
   * Receives the error message as a parameter.
   * Called before the error UI is displayed.
   */
  onError?: (error: string) => void;
}

/**
 * Callback page component for handling OAuth redirects (App Router version).
 *
 * Use this in your callback page to process authentication responses.
 *
 * @example
 * ```tsx
 * // app/callback/page.tsx
 * "use client";
 * import { CallbackPage } from "@imtbl/auth-nextjs/client";
 *
 * const config = {
 *   clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
 *   redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
 * };
 *
 * export default function Callback() {
 *   return <CallbackPage config={config} />;
 * }
 * ```
 */
export function CallbackPage({
  config,
  redirectTo = '/',
  loadingComponent = null,
  errorComponent,
  onSuccess,
  onError,
}: CallbackPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  // Track whether callback has been processed to prevent double invocation
  // (React 18 StrictMode runs effects twice, and OAuth codes are single-use)
  const callbackProcessedRef = useRef(false);

  useEffect(() => {
    // Get search params directly from window.location to ensure compatibility
    // with both App Router and Pages Router. useSearchParams() from next/navigation
    // has hydration issues in Pages Router where params may be empty initially.
    const searchParams = getSearchParams();

    const handleCallback = async () => {
      try {
        // Create Auth instance to handle the callback
        const auth = new Auth({
          clientId: config.clientId,
          redirectUri: config.redirectUri,
          popupRedirectUri: config.popupRedirectUri,
          logoutRedirectUri: config.logoutRedirectUri,
          audience: config.audience || DEFAULT_AUDIENCE,
          scope: config.scope || DEFAULT_SCOPE,
          authenticationDomain: config.authenticationDomain || DEFAULT_AUTH_DOMAIN,
          passportDomain: config.passportDomain,
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
          // Create user object for callbacks
          const user: ImmutableUser = {
            sub: authUser.profile.sub,
            email: authUser.profile.email,
            nickname: authUser.profile.nickname,
          };
          // Call onSuccess callback before closing popup
          if (onSuccess) {
            await onSuccess(user);
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

          // Create user object for callbacks and dynamic redirect
          const user: ImmutableUser = {
            sub: authUser.profile.sub,
            email: authUser.profile.email,
            nickname: authUser.profile.nickname,
          };

          // Call onSuccess callback before redirect
          if (onSuccess) {
            await onSuccess(user);
          }

          // Resolve redirect path (can be string or function)
          const resolvedRedirectTo = typeof redirectTo === 'function'
            ? redirectTo(user) || '/'
            : redirectTo;

          // Only redirect after successful session creation
          router.replace(resolvedRedirectTo);
        } else {
          // authUser is undefined - loginCallback failed silently
          // This can happen if the OIDC signinCallback returns null
          throw new Error('Authentication failed: no user data received from login callback');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        if (onError) {
          onError(errorMessage);
        }
        setError(errorMessage);
      }
    };

    const handleOAuthError = () => {
      // OAuth providers return error and error_description when authentication fails
      // (e.g., user cancels, consent denied, invalid request)
      const errorCode = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      const errorMessage = errorDescription || errorCode || 'Authentication failed';
      if (onError) {
        onError(errorMessage);
      }
      setError(errorMessage);
    };

    // Guard against double invocation (React 18 StrictMode runs effects twice)
    if (callbackProcessedRef.current) {
      return;
    }

    const hasError = searchParams.get('error');
    const hasCode = searchParams.get('code');

    // Handle OAuth error responses (user cancelled, consent denied, etc.)
    if (hasError) {
      callbackProcessedRef.current = true;
      handleOAuthError();
      return;
    }

    // Handle successful OAuth callback with authorization code
    if (hasCode) {
      callbackProcessedRef.current = true;
      handleCallback();
      return;
    }

    // No OAuth parameters present - user navigated directly to callback page,
    // bookmarked it, or OAuth redirect lost its parameters
    callbackProcessedRef.current = true;
    const errorMessage = 'Invalid callback: missing OAuth parameters. Please try logging in again.';
    if (onError) {
      onError(errorMessage);
    }
    setError(errorMessage);
  }, [router, config, redirectTo, onSuccess, onError]);

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
          type="button"
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
