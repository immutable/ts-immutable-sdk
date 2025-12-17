'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Auth } from '@imtbl/auth';
import type { ImmutableAuthConfig } from '../types';

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
  errorComponent = null,
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

        // Process the callback - this extracts tokens from the URL
        await auth.loginCallback();

        // Check if we're in a popup window
        if (window.opener) {
          // Close the popup - the parent window will receive the tokens
          window.close();
        } else {
          // Not in a popup - redirect to specified page
          router.replace(redirectTo);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    // Only run when we have the code parameter
    if (router.isReady && router.query.code) {
      handleCallback();
    }
  }, [router.isReady, router.query.code, router, config, redirectTo]);

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
