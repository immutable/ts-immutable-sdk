'use client';

import { useCallback, useRef, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import type { Session } from 'next-auth';
import type {
  User,
  LoginConfig,
  StandaloneLoginOptions,
} from '@imtbl/auth';
import {
  loginWithPopup as rawLoginWithPopup,
  loginWithEmbedded as rawLoginWithEmbedded,
  loginWithRedirect as rawLoginWithRedirect,
} from '@imtbl/auth';
import { IMMUTABLE_PROVIDER_ID } from './constants';

/**
 * Extended session type with Immutable token data
 */
export interface ImmutableSession extends Session {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpires: number;
  zkEvm?: {
    ethAddress: string;
    userAdminAddress: string;
  };
  error?: string;
}

/**
 * Return type for useImmutableSession hook
 */
export interface UseImmutableSessionReturn {
  /** The session data with tokens, or null if not authenticated */
  session: ImmutableSession | null;
  /** Authentication status: 'loading' | 'authenticated' | 'unauthenticated' */
  status: 'loading' | 'authenticated' | 'unauthenticated';
  /** Whether the session is currently loading */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /**
   * Get user function for wallet integration.
   * Returns a User object compatible with @imtbl/wallet's getUser option.
   *
   * @param forceRefresh - When true, triggers a server-side token refresh to get
   *   updated claims from the identity provider (e.g., after zkEVM registration).
   *   The refreshed session will include updated zkEvm data if available.
   */
  getUser: (forceRefresh?: boolean) => Promise<User | null>;
}

/**
 * Hook to access Immutable session with a getUser function for wallet integration.
 *
 * This is a convenience wrapper around next-auth/react's useSession that:
 * 1. Provides typed access to Immutable token data in the session
 * 2. Provides a `getUser` function compatible with @imtbl/wallet's getUser option
 *
 * Must be used within a SessionProvider from next-auth/react.
 *
 * @example
 * ```tsx
 * import { useImmutableSession } from '@imtbl/auth-next-client';
 * import { connectWallet } from '@imtbl/wallet';
 *
 * function WalletComponent() {
 *   const { session, isAuthenticated, getUser } = useImmutableSession();
 *
 *   const connect = async () => {
 *     const provider = await connectWallet({
 *       getUser,  // Pass directly to wallet
 *     });
 *   };
 *
 *   if (!isAuthenticated) {
 *     return <p>Please log in</p>;
 *   }
 *
 *   return <button onClick={connect}>Connect Wallet</button>;
 * }
 * ```
 */
export function useImmutableSession(): UseImmutableSessionReturn {
  const { data: sessionData, status, update } = useSession();

  // Cast session to our extended type
  const session = sessionData as ImmutableSession | null;

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session;

  // Use a ref to always have access to the latest session.
  // This avoids stale closure issues when the wallet stores the getUser function
  // and calls it later - the ref always points to the current session.
  const sessionRef = useRef<ImmutableSession | null>(session);
  sessionRef.current = session;

  // Also store update in a ref so the callback is stable
  const updateRef = useRef(update);
  updateRef.current = update;

  /**
   * Get user function for wallet integration.
   * Returns a User object compatible with @imtbl/wallet's getUser option.
   *
   * Uses a ref to access the latest session instantly without network calls.
   * When forceRefresh is true, triggers a server-side token refresh.
   *
   * @param forceRefresh - When true, triggers a server-side token refresh
   */
  const getUser = useCallback(async (forceRefresh?: boolean): Promise<User | null> => {
    let currentSession: ImmutableSession | null;

    // If forceRefresh is requested, trigger server-side refresh via NextAuth
    // This calls the jwt callback with trigger='update' and sessionUpdate.forceRefresh=true
    if (forceRefresh) {
      try {
        // update() returns the refreshed session
        const updatedSession = await updateRef.current({ forceRefresh: true });
        currentSession = updatedSession as ImmutableSession | null;
        // Also update the ref so subsequent calls get the fresh data
        if (currentSession) {
          sessionRef.current = currentSession;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[auth-next-client] Force refresh failed:', error);
        // Fall back to current session from ref
        currentSession = sessionRef.current;
      }
    } else {
      // Read from ref - instant, no network call
      // The ref is always updated on each render with the latest session
      currentSession = sessionRef.current;
    }

    if (!currentSession?.accessToken) {
      return null;
    }

    // Check for session errors
    if (currentSession.error) {
      // eslint-disable-next-line no-console
      console.warn('[auth-next-client] Session has error:', currentSession.error);
      return null;
    }

    return {
      accessToken: currentSession.accessToken,
      refreshToken: currentSession.refreshToken,
      idToken: currentSession.idToken,
      profile: {
        sub: currentSession.user?.sub ?? '',
        email: currentSession.user?.email ?? undefined,
        nickname: currentSession.user?.nickname ?? undefined,
      },
      zkEvm: currentSession.zkEvm,
    };
  }, []); // Empty deps - uses refs for latest values

  return {
    session,
    status,
    isLoading,
    isAuthenticated,
    getUser,
  };
}

/**
 * Return type for useLogin hook
 */
export interface UseLoginReturn {
  /** Start login with popup flow */
  loginWithPopup: (config: LoginConfig, options?: StandaloneLoginOptions) => Promise<void>;
  /** Start login with embedded modal flow */
  loginWithEmbedded: (config: LoginConfig) => Promise<void>;
  /** Start login with redirect flow (navigates away from page) */
  loginWithRedirect: (config: LoginConfig, options?: StandaloneLoginOptions) => Promise<void>;
  /** Whether login is currently in progress */
  isLoggingIn: boolean;
  /** Error message from the last login attempt, or null if none */
  error: string | null;
}

/**
 * Hook to handle Immutable authentication login flows.
 *
 * Provides login functions that:
 * 1. Handle OAuth authentication via popup, embedded modal, or redirect
 * 2. Automatically sign in to NextAuth after successful authentication
 * 3. Track loading and error states
 *
 * Config is passed at call time to allow different configurations for different
 * login methods (e.g., different redirectUri vs popupRedirectUri).
 *
 * Must be used within a SessionProvider from next-auth/react.
 *
 * @example
 * ```tsx
 * import { useLogin, useImmutableSession } from '@imtbl/auth-next-client';
 *
 * const config = {
 *   clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
 *   redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
 *   popupRedirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback/popup`,
 * };
 *
 * function LoginButton() {
 *   const { isAuthenticated } = useImmutableSession();
 *   const { loginWithPopup, isLoggingIn, error } = useLogin();
 *
 *   if (isAuthenticated) {
 *     return <p>You are logged in!</p>;
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={() => loginWithPopup(config)} disabled={isLoggingIn}>
 *         {isLoggingIn ? 'Signing in...' : 'Sign In'}
 *       </button>
 *       {error && <p style={{ color: 'red' }}>{error}</p>}
 *     </>
 *   );
 * }
 * ```
 */
export function useLogin(): UseLoginReturn {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sign in to NextAuth with tokens from OAuth flow
   */
  const signInWithTokens = useCallback(async (tokens: {
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpires: number;
    profile: { sub: string; email?: string; nickname?: string };
    zkEvm?: { ethAddress: string; userAdminAddress: string };
  }) => {
    const result = await signIn(IMMUTABLE_PROVIDER_ID, {
      tokens: JSON.stringify(tokens),
      redirect: false,
    });

    if (result?.error) {
      throw new Error(`NextAuth sign-in failed: ${result.error}`);
    }
    if (!result?.ok) {
      throw new Error('NextAuth sign-in failed: unknown error');
    }
  }, []);

  /**
   * Login with a popup window.
   * Opens a popup for OAuth authentication, then signs in to NextAuth.
   */
  const loginWithPopup = useCallback(async (
    config: LoginConfig,
    options?: StandaloneLoginOptions,
  ): Promise<void> => {
    setIsLoggingIn(true);
    setError(null);

    try {
      const tokens = await rawLoginWithPopup(config, options);
      await signInWithTokens(tokens);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  }, [signInWithTokens]);

  /**
   * Login with an embedded modal.
   * Shows a modal for login method selection, then opens a popup for OAuth.
   */
  const loginWithEmbedded = useCallback(async (config: LoginConfig): Promise<void> => {
    setIsLoggingIn(true);
    setError(null);

    try {
      const tokens = await rawLoginWithEmbedded(config);
      await signInWithTokens(tokens);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  }, [signInWithTokens]);

  /**
   * Login with redirect.
   * Redirects the page to OAuth authentication.
   * After authentication, the user will be redirected to your callback page.
   * Use the CallbackPage component to complete the flow.
   */
  const loginWithRedirect = useCallback(async (
    config: LoginConfig,
    options?: StandaloneLoginOptions,
  ): Promise<void> => {
    setIsLoggingIn(true);
    setError(null);

    try {
      await rawLoginWithRedirect(config, options);
      // Note: The page will redirect, so this code may not run
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      setIsLoggingIn(false);
      throw err;
    }
    // Don't set isLoggingIn to false here - page is redirecting
  }, []);

  return {
    loginWithPopup,
    loginWithEmbedded,
    loginWithRedirect,
    isLoggingIn,
    error,
  };
}
