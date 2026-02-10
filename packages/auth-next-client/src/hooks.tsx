'use client';

import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import type {
  User,
  LoginConfig,
  StandaloneLoginOptions,
  LogoutConfig,
} from '@imtbl/auth';
import type { ZkEvmInfo } from './types';
import {
  loginWithPopup as rawLoginWithPopup,
  loginWithEmbedded as rawLoginWithEmbedded,
  loginWithRedirect as rawLoginWithRedirect,
  logoutWithRedirect as rawLogoutWithRedirect,
} from '@imtbl/auth';
import {
  IMMUTABLE_PROVIDER_ID,
  TOKEN_EXPIRY_BUFFER_MS,
  DEFAULT_PRODUCTION_CLIENT_ID,
  DEFAULT_SANDBOX_CLIENT_ID,
  DEFAULT_REDIRECT_URI_PATH,
  DEFAULT_POPUP_REDIRECT_URI_PATH,
  DEFAULT_LOGOUT_REDIRECT_URI_PATH,
  DEFAULT_AUTH_DOMAIN,
  DEFAULT_SCOPE,
  DEFAULT_AUDIENCE,
} from './constants';

// ---------------------------------------------------------------------------
// Module-level deduplication for session refresh
// ---------------------------------------------------------------------------

/**
 * Deduplicates concurrent session refresh calls.
 * Multiple components may mount useImmutableSession simultaneously; without
 * deduplication each would trigger its own update() call, which could fail
 * if the auth server rotates refresh tokens.
 */
let pendingRefresh: Promise<Session | null | undefined> | null = null;

function deduplicatedUpdate(
  update: () => Promise<Session | null | undefined>,
): Promise<Session | null | undefined> {
  if (!pendingRefresh) {
    pendingRefresh = update().finally(() => { pendingRefresh = null; });
  }
  return pendingRefresh;
}

// ---------------------------------------------------------------------------
// Default configuration helpers
// ---------------------------------------------------------------------------

/**
 * Detect if we're in a sandbox/test environment based on the current URL.
 * Checks if the hostname includes 'sandbox' or 'localhost'.
 *
 * @returns true if in sandbox environment, false otherwise
 * @internal
 */
function isSandboxEnvironment(): boolean {
  if (typeof window === 'undefined') {
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
 *
 * @returns Default redirect URI
 * @internal
 */
function deriveDefaultRedirectUri(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_REDIRECT_URI_PATH;
  }

  return `${window.location.origin}${DEFAULT_REDIRECT_URI_PATH}`;
}

/**
 * Derive the default popupRedirectUri based on the current URL.
 *
 * @returns Default popup redirect URI
 * @internal
 */
function deriveDefaultPopupRedirectUri(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_POPUP_REDIRECT_URI_PATH;
  }

  return `${window.location.origin}${DEFAULT_POPUP_REDIRECT_URI_PATH}`;
}

/**
 * Derive the default logoutRedirectUri based on the current URL.
 *
 * @returns Default logout redirect URI
 * @internal
 */
function deriveDefaultLogoutRedirectUri(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_LOGOUT_REDIRECT_URI_PATH;
  }

  return window.location.origin + DEFAULT_LOGOUT_REDIRECT_URI_PATH;
}

/**
 * Create a complete LoginConfig with default values.
 * All fields are optional and will be auto-derived if not provided.
 *
 * @param config - Optional partial login configuration
 * @returns Complete LoginConfig with defaults applied
 * @internal
 */
function createDefaultLoginConfig(config?: Partial<LoginConfig>): LoginConfig {
  return {
    clientId: config?.clientId || deriveDefaultClientId(),
    redirectUri: config?.redirectUri || deriveDefaultRedirectUri(),
    popupRedirectUri: config?.popupRedirectUri || deriveDefaultPopupRedirectUri(),
    scope: config?.scope || DEFAULT_SCOPE,
    audience: config?.audience || DEFAULT_AUDIENCE,
    authenticationDomain: config?.authenticationDomain || DEFAULT_AUTH_DOMAIN,
  };
}

/**
 * Create a complete LogoutConfig with default values.
 * All fields are optional and will be auto-derived if not provided.
 *
 * @param config - Optional partial logout configuration
 * @returns Complete LogoutConfig with defaults applied
 * @internal
 */
function createDefaultLogoutConfig(config?: Partial<LogoutConfig>): LogoutConfig {
  return {
    clientId: config?.clientId || deriveDefaultClientId(),
    logoutRedirectUri: config?.logoutRedirectUri || deriveDefaultLogoutRedirectUri(),
  };
}

/**
 * Internal session type with full token data (not exported).
 * Used internally by the hook for token validation, refresh logic, and getUser/getAccessToken.
 */
interface ImmutableSessionInternal extends Session {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpires: number;
  zkEvm?: ZkEvmInfo;
  error?: string;
}

/**
 * Public session type exposed to consumers.
 *
 * Does **not** include `accessToken` -- consumers must use the `getAccessToken()`
 * function returned by `useImmutableSession()` to obtain a guaranteed-fresh token.
 * This prevents accidental use of stale/expired tokens.
 */
export type ImmutableSession = Omit<ImmutableSessionInternal, 'accessToken'>;

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
  /** Whether a session refresh is in progress (e.g., after wallet registration) */
  isRefreshing: boolean;
  /**
   * Get user function for wallet integration.
   * Returns a User object compatible with @imtbl/wallet's getUser option.
   *
   * @param forceRefresh - When true, triggers a server-side token refresh to get
   *   updated claims from the identity provider (e.g., after zkEVM registration).
   *   The refreshed session will include updated zkEvm data if available.
   */
  getUser: (forceRefresh?: boolean) => Promise<User | null>;
  /**
   * Get a guaranteed-fresh access token.
   * Returns immediately if the current token is valid.
   * If expired, triggers a refresh and blocks (awaits) until the fresh token is available.
   * Throws if the user is not authenticated or if refresh fails.
   */
  getAccessToken: () => Promise<string>;
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

  // Track when a manual refresh is in progress (via getUser(true))
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cast session to our internal type (includes accessToken for internal logic)
  const session = sessionData as ImmutableSessionInternal | null;

  const isLoading = status === 'loading';

  // Core authentication check - user has a valid session with usable access token.
  // A session can exist but be unusable if the access token is missing or refresh failed.
  const hasValidSession = status === 'authenticated'
    && !!session
    && !!session.accessToken
    && !session.error;

  // During loading/refreshing, keep showing authenticated if we had a valid session (avoids UI flicker
  // when NextAuth refetches on window focus or after getUser(forceRefresh)).
  const hadSessionRef = useRef(false);
  if (hasValidSession) hadSessionRef.current = true;
  if (!hasValidSession && !isLoading && !isRefreshing) hadSessionRef.current = false;
  const isAuthenticated = hasValidSession || ((isLoading || isRefreshing) && hadSessionRef.current);

  // Use a ref to always have access to the latest session.
  // This avoids stale closure issues when the wallet stores the getUser function
  // and calls it later - the ref always points to the current session.
  const sessionRef = useRef<ImmutableSessionInternal | null>(session);
  sessionRef.current = session;

  // Also store update in a ref so the callback is stable
  const updateRef = useRef(update);
  updateRef.current = update;

  // Store setIsRefreshing in a ref for stable callback
  const setIsRefreshingRef = useRef(setIsRefreshing);
  setIsRefreshingRef.current = setIsRefreshing;

  // ---------------------------------------------------------------------------
  // Proactive token refresh
  // ---------------------------------------------------------------------------

  // Reactive refresh: when the effect runs and the token is already expired
  // (e.g., after tab regains focus), trigger an immediate silent refresh.
  // For tokens that are still valid, getAccessToken() handles refresh on demand.
  //
  // NOTE: This intentionally does NOT set isRefreshing. isRefreshing is reserved
  // for explicit user-triggered refreshes (e.g., getUser(true) after wallet
  // registration). Background token refreshes must be invisible to consumers --
  // setting isRefreshing would cause downstream hooks that gate SWR keys on
  // `!isRefreshing` to briefly lose their cached data, resulting in UI flicker.
  useEffect(() => {
    if (!session?.accessTokenExpires) return;

    const timeUntilExpiry = session.accessTokenExpires - Date.now() - TOKEN_EXPIRY_BUFFER_MS;

    if (timeUntilExpiry <= 0) {
      // Already expired -- refresh silently
      deduplicatedUpdate(() => updateRef.current());
    }
  }, [session?.accessTokenExpires]);

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
    let currentSession: ImmutableSessionInternal | null;

    // If forceRefresh is requested, trigger server-side refresh via NextAuth
    // This calls the jwt callback with trigger='update' and sessionUpdate.forceRefresh=true
    if (forceRefresh) {
      // Set refreshing state to prevent isAuthenticated from going false
      setIsRefreshingRef.current(true);
      try {
        // update() returns the refreshed session
        const updatedSession = await updateRef.current({ forceRefresh: true });
        currentSession = updatedSession as ImmutableSessionInternal | null;
        // Also update the ref so subsequent calls get the fresh data
        if (currentSession) {
          sessionRef.current = currentSession;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[auth-next-client] Force refresh failed:', error);
        // Fall back to current session from ref
        currentSession = sessionRef.current;
      } finally {
        setIsRefreshingRef.current(false);
      }
    } else if (pendingRefresh) {
      // If a refresh is in-flight (proactive timer or another getAccessToken call),
      // wait for it and use the refreshed session rather than returning a stale token.
      const refreshed = await pendingRefresh;
      if (refreshed) {
        currentSession = refreshed as ImmutableSessionInternal;
        sessionRef.current = currentSession;
      } else {
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

  /**
   * Get a guaranteed-fresh access token.
   * Returns immediately if the current token is valid (fast path, no network call).
   * If expired, triggers a server-side refresh and blocks (awaits) until the fresh
   * token is available. Piggybacks on any in-flight refresh to avoid duplicate calls.
   *
   * @throws Error if the user is not authenticated or if the refresh fails.
   */
  const getAccessToken = useCallback(async (): Promise<string> => {
    const currentSession = sessionRef.current;

    // Fast path: token is valid -- return immediately
    if (
      currentSession?.accessToken
      && currentSession.accessTokenExpires
      && Date.now() < currentSession.accessTokenExpires - TOKEN_EXPIRY_BUFFER_MS
      && !currentSession.error
    ) {
      return currentSession.accessToken;
    }

    // Token is expired or missing -- wait for in-flight refresh or trigger one
    const refreshed = await deduplicatedUpdate(
      () => updateRef.current(),
    ) as ImmutableSessionInternal | null;

    if (!refreshed?.accessToken || refreshed.error) {
      throw new Error(
        `[auth-next-client] Failed to get access token: ${refreshed?.error || 'no session'}`,
      );
    }

    // Update ref so subsequent sync reads get the fresh data
    sessionRef.current = refreshed;
    return refreshed.accessToken;
  }, []); // Empty deps -- uses refs for latest values

  // Cast to public type (omits accessToken) to prevent consumers from
  // accidentally using a potentially stale token. Use getAccessToken() instead.
  const publicSession = session as ImmutableSession | null;

  return {
    session: publicSession,
    status,
    isLoading,
    isAuthenticated,
    isRefreshing,
    getUser,
    getAccessToken,
  };
}

/**
 * Return type for useLogin hook
 */
export interface UseLoginReturn {
  /** Start login with popup flow */
  loginWithPopup: (config?: Partial<LoginConfig>, options?: StandaloneLoginOptions) => Promise<void>;
  /** Start login with embedded modal flow */
  loginWithEmbedded: (config?: Partial<LoginConfig>) => Promise<void>;
  /** Start login with redirect flow (navigates away from page) */
  loginWithRedirect: (config?: Partial<LoginConfig>, options?: StandaloneLoginOptions) => Promise<void>;
  /** Whether login is currently in progress */
  isLoggingIn: boolean;
  /** Error message from the last login attempt, or null if none */
  error: string | null;
}

/**
 * Hook to handle Immutable authentication login flows with automatic defaults.
 *
 * Provides login functions that:
 * 1. Handle OAuth authentication via popup, embedded modal, or redirect
 * 2. Automatically sign in to NextAuth after successful authentication
 * 3. Track loading and error states
 * 4. Auto-detect clientId and redirectUri if not provided (uses defaults)
 *
 * Config can be passed at call time or omitted to use sensible defaults:
 * - `clientId`: Auto-detected based on environment (sandbox vs production)
 * - `redirectUri`: Auto-derived from `window.location.origin + '/callback'`
 * - `popupRedirectUri`: Auto-derived from `window.location.origin + '/callback'` (same as redirectUri)
 * - `logoutRedirectUri`: Auto-derived from `window.location.origin`
 * - `scope`: `'openid profile email offline_access transact'`
 * - `audience`: `'platform_api'`
 * - `authenticationDomain`: `'https://auth.immutable.com'`
 *
 * Must be used within a SessionProvider from next-auth/react.
 *
 * @example Minimal usage (uses all defaults)
 * ```tsx
 * import { useLogin, useImmutableSession } from '@imtbl/auth-next-client';
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
 *       <button onClick={() => loginWithPopup()} disabled={isLoggingIn}>
 *         {isLoggingIn ? 'Signing in...' : 'Sign In'}
 *       </button>
 *       {error && <p style={{ color: 'red' }}>{error}</p>}
 *     </>
 *   );
 * }
 * ```
 *
 * @example With custom configuration
 * ```tsx
 * import { useLogin, useImmutableSession } from '@imtbl/auth-next-client';
 *
 * function LoginButton() {
 *   const { isAuthenticated } = useImmutableSession();
 *   const { loginWithPopup, isLoggingIn, error } = useLogin();
 *
 *   const handleLogin = () => {
 *     loginWithPopup({
 *       clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID, // Use your own client ID
 *     });
 *   };
 *
 *   if (isAuthenticated) {
 *     return <p>You are logged in!</p>;
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={handleLogin} disabled={isLoggingIn}>
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
    zkEvm?: ZkEvmInfo;
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
   * Config is optional - defaults will be auto-derived if not provided.
   */
  const loginWithPopup = useCallback(async (
    config?: Partial<LoginConfig>,
    options?: StandaloneLoginOptions,
  ): Promise<void> => {
    setIsLoggingIn(true);
    setError(null);

    try {
      const fullConfig = createDefaultLoginConfig(config);
      const tokens = await rawLoginWithPopup(fullConfig, options);
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
   * Config is optional - defaults will be auto-derived if not provided.
   */
  const loginWithEmbedded = useCallback(async (config?: Partial<LoginConfig>): Promise<void> => {
    setIsLoggingIn(true);
    setError(null);

    try {
      const fullConfig = createDefaultLoginConfig(config);
      const tokens = await rawLoginWithEmbedded(fullConfig);
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
   * Config is optional - defaults will be auto-derived if not provided.
   */
  const loginWithRedirect = useCallback(async (
    config?: Partial<LoginConfig>,
    options?: StandaloneLoginOptions,
  ): Promise<void> => {
    setIsLoggingIn(true);
    setError(null);

    try {
      const fullConfig = createDefaultLoginConfig(config);
      await rawLoginWithRedirect(fullConfig, options);
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

/**
 * Return type for useLogout hook
 */
export interface UseLogoutReturn {
  /**
   * Logout with federated logout support.
   * Clears both the local NextAuth session AND the upstream Immutable/Auth0 session.
   * This ensures that when the user logs in again, they will be prompted to select
   * an account instead of being automatically logged in with the previous account.
   *
   * Config is optional - defaults will be auto-derived if not provided.
   *
   * @param config - Optional logout configuration with clientId and optional redirectUri
   */
  logout: (config?: Partial<LogoutConfig>) => Promise<void>;
  /** Whether logout is currently in progress */
  isLoggingOut: boolean;
  /** Error message from the last logout attempt, or null if none */
  error: string | null;
}

/**
 * Hook to handle Immutable authentication logout with federated logout support.
 *
 * This hook provides a `logout` function that performs federated logout:
 * 1. Clears the local NextAuth session (JWT cookie)
 * 2. Redirects to the Immutable auth domain's logout endpoint to clear the upstream session
 *
 * This ensures that when the user logs in again, they will be prompted to select
 * an account (for social logins like Google) instead of being automatically logged
 * in with the previous account.
 *
 * Config is optional - defaults will be auto-derived if not provided:
 * - `clientId`: Auto-detected based on environment (sandbox vs production)
 * - `logoutRedirectUri`: Auto-derived from `window.location.origin`
 *
 * Must be used within a SessionProvider from next-auth/react.
 *
 * @example Minimal usage (uses all defaults)
 * ```tsx
 * import { useLogout, useImmutableSession } from '@imtbl/auth-next-client';
 *
 * function LogoutButton() {
 *   const { isAuthenticated } = useImmutableSession();
 *   const { logout, isLoggingOut, error } = useLogout();
 *
 *   if (!isAuthenticated) {
 *     return null;
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={() => logout()} disabled={isLoggingOut}>
 *         {isLoggingOut ? 'Signing out...' : 'Sign Out'}
 *       </button>
 *       {error && <p style={{ color: 'red' }}>{error}</p>}
 *     </>
 *   );
 * }
 * ```
 *
 * @example With custom configuration
 * ```tsx
 * import { useLogout, useImmutableSession } from '@imtbl/auth-next-client';
 *
 * function LogoutButton() {
 *   const { isAuthenticated } = useImmutableSession();
 *   const { logout, isLoggingOut, error } = useLogout();
 *
 *   if (!isAuthenticated) {
 *     return null;
 *   }
 *
 *   return (
 *     <>
 *       <button
 *         onClick={() => logout({
 *           clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID, // Use your own client ID
 *           logoutRedirectUri: '/custom-logout', // Custom redirect
 *         })}
 *         disabled={isLoggingOut}
 *       >
 *         {isLoggingOut ? 'Signing out...' : 'Sign Out'}
 *       </button>
 *       {error && <p style={{ color: 'red' }}>{error}</p>}
 *     </>
 *   );
 * }
 * ```
 */
export function useLogout(): UseLogoutReturn {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Logout with federated logout.
   * First clears the NextAuth session, then redirects to the auth domain's logout endpoint.
   * Config is optional - defaults will be auto-derived if not provided.
   */
  const logout = useCallback(async (config?: Partial<LogoutConfig>): Promise<void> => {
    setIsLoggingOut(true);
    setError(null);

    try {
      // First, clear the NextAuth session (this clears the JWT cookie)
      // We use redirect: false to handle the redirect ourselves for federated logout
      await signOut({ redirect: false });

      // Create full config with defaults
      const fullConfig = createDefaultLogoutConfig(config);

      // Redirect to the auth domain's logout endpoint using the standalone function
      // This clears the upstream session (Auth0/Immutable) so that on next login,
      // the user will be prompted to select an account instead of auto-logging in
      rawLogoutWithRedirect(fullConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      setIsLoggingOut(false);
      throw err;
    }
    // Don't set isLoggingOut to false here - page is redirecting
  }, []);

  return {
    logout,
    isLoggingOut,
    error,
  };
}
