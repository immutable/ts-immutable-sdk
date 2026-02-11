'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { handleLoginCallback as handleAuthCallback, type TokenResponse } from '@imtbl/auth';
import type { ImmutableUserClient } from './types';
import { IMMUTABLE_PROVIDER_ID } from './constants';
import { storeIdToken } from './idTokenStorage';

/**
 * Config for CallbackPage - matches LoginConfig from @imtbl/auth
 */
export interface CallbackConfig {
  /** Your Immutable application client ID */
  clientId: string;
  /** The OAuth redirect URI for your application */
  redirectUri: string;
  /** Optional separate redirect URI for popup flows */
  popupRedirectUri?: string;
  /** OAuth audience (default: "platform_api") */
  audience?: string;
  /** OAuth scopes (default: "openid profile email offline_access transact") */
  scope?: string;
  /** Authentication domain (default: "https://auth.immutable.com") */
  authenticationDomain?: string;
}

export interface CallbackPageProps {
  /**
   * Immutable auth configuration
   */
  config: CallbackConfig;
  /**
   * URL to redirect to after successful authentication (when not in popup).
   * Can be a string or a function that receives the authenticated user.
   * If a function returns void/undefined, defaults to "/".
   * @default "/"
   */
  redirectTo?: string | ((user: ImmutableUserClient) => string | void);
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
  onSuccess?: (user: ImmutableUserClient) => void | Promise<void>;
  /**
   * Callback fired when authentication fails.
   * Receives the error message as a parameter.
   * Called before the error UI is displayed.
   */
  onError?: (error: string) => void;
}

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

/**
 * Map TokenResponse to token data format expected by NextAuth signIn
 */
function mapTokensToSignInData(tokens: TokenResponse) {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    idToken: tokens.idToken,
    accessTokenExpires: tokens.accessTokenExpires,
    profile: tokens.profile,
    zkEvm: tokens.zkEvm,
  };
}

/**
 * Callback page component for handling OAuth redirects.
 *
 * This component handles the OAuth callback by:
 * 1. Using `handleLoginCallback` from @imtbl/auth to exchange the code for tokens
 * 2. Signing in to NextAuth with the tokens
 * 3. Redirecting to the specified URL
 *
 * @example
 * ```tsx
 * // app/callback/page.tsx
 * import { CallbackPage } from '@imtbl/auth-next-client';
 *
 * const config = {
 *   clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
 *   redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
 * };
 *
 * export default function Callback() {
 *   return <CallbackPage config={config} redirectTo="/" />;
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
    // with both App Router and Pages Router
    const searchParams = getSearchParams();

    const handleCallback = async () => {
      try {
        // Use standalone handleLoginCallback from @imtbl/auth
        // This handles PKCE code exchange and returns tokens without state management
        const tokens = await handleAuthCallback(config);

        // If no tokens, the callback failed
        if (!tokens) {
          throw new Error('Authentication failed: no tokens received from callback');
        }

        // Check if we're in a popup window
        if (window.opener) {
          // Create user object for callbacks
          const user: ImmutableUserClient = {
            sub: tokens.profile.sub,
            email: tokens.profile.email,
            nickname: tokens.profile.nickname,
          };
          // Call onSuccess callback before closing popup
          if (onSuccess) {
            await onSuccess(user);
          }
          // For popup flows, we need to communicate tokens back to the parent
          // The parent window is polling for the redirect and will handle the tokens
          // Close the popup - parent window's loginWithPopup handles the rest
          window.close();
        } else {
          // Not in a popup - sign in to NextAuth with the tokens
          const tokenData = mapTokensToSignInData(tokens);

          // Persist idToken to localStorage before signIn so it's available
          // immediately. The cookie won't contain idToken (stripped by jwt.encode).
          if (tokens.idToken) {
            storeIdToken(tokens.idToken);
          }

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
          const user: ImmutableUserClient = {
            sub: tokens.profile.sub,
            email: tokens.profile.email,
            nickname: tokens.profile.nickname,
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
