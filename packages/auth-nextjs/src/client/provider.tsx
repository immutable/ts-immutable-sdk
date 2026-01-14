'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  SessionProvider, useSession, signIn, signOut,
} from 'next-auth/react';
import type { Session } from 'next-auth';
import {
  Auth, AuthEvents, type User, type LoginOptions,
} from '@imtbl/auth';
import type {
  ImmutableAuthConfig,
  ImmutableAuthProviderProps,
  UseImmutableAuthReturn,
  ImmutableUser,
  ImmutableTokenData,
} from '../types';
import { getTokenExpiry } from '../utils/token';
import {
  DEFAULT_AUTH_DOMAIN,
  DEFAULT_AUDIENCE,
  DEFAULT_SCOPE,
  DEFAULT_NEXTAUTH_BASE_PATH,
  IMMUTABLE_PROVIDER_ID,
} from '../constants';

/**
 * Internal context for Immutable auth state
 */
interface ImmutableAuthContextValue {
  auth: Auth | null;
  config: ImmutableAuthConfig;
  basePath: string;
}

const ImmutableAuthContext = createContext<ImmutableAuthContextValue | null>(null);

/**
 * Internal provider that manages Auth instance
 */
function ImmutableAuthInner({
  children,
  config,
  basePath,
}: {
  children: React.ReactNode;
  config: ImmutableAuthConfig;
  basePath: string;
}) {
  // Use state instead of ref so changes trigger re-renders and update context consumers
  const [auth, setAuth] = useState<Auth | null>(null);
  const prevConfigRef = useRef<string | null>(null);
  // Track auth instance in a ref to check if it's still valid synchronously
  // This is needed for React 18 Strict Mode compatibility
  const authInstanceRef = useRef<Auth | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const { data: session, update: updateSession } = useSession();

  // Initialize/reinitialize Auth instance when config changes (e.g., environment switch)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // Create a config key to detect changes - include all properties used in Auth constructor
    // to ensure the Auth instance is recreated when any config property changes
    const configKey = [
      config.clientId,
      config.redirectUri,
      config.popupRedirectUri || '',
      config.logoutRedirectUri || '',
      config.audience || DEFAULT_AUDIENCE,
      config.scope || DEFAULT_SCOPE,
      config.authenticationDomain || DEFAULT_AUTH_DOMAIN,
      config.passportDomain || '',
    ].join(':');

    // Only skip recreation if BOTH:
    // 1. Config hasn't changed (same configKey)
    // 2. Auth instance still exists (wasn't nullified by cleanup)
    // This handles React 18 Strict Mode where effects run twice:
    // setup → cleanup → setup. After cleanup, authInstanceRef is null,
    // so we correctly recreate Auth on the second setup.
    if (prevConfigRef.current === configKey && authInstanceRef.current !== null) {
      return undefined;
    }
    prevConfigRef.current = configKey;

    // Create new Auth instance with current config
    const newAuth = new Auth({
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      popupRedirectUri: config.popupRedirectUri,
      logoutRedirectUri: config.logoutRedirectUri,
      audience: config.audience || DEFAULT_AUDIENCE,
      scope: config.scope || DEFAULT_SCOPE,
      authenticationDomain: config.authenticationDomain || DEFAULT_AUTH_DOMAIN,
      passportDomain: config.passportDomain,
    });

    authInstanceRef.current = newAuth;
    setAuth(newAuth);
    setIsAuthReady(true);

    // Cleanup function: When config changes or component unmounts,
    // clear the Auth instance to prevent memory leaks.
    // The Auth class holds a UserManager from oidc-client-ts which may register
    // window event listeners (storage, message). By setting auth to null,
    // we allow garbage collection.
    return () => {
      authInstanceRef.current = null;
      setAuth(null);
      setIsAuthReady(false);
    };
  }, [config]);

  // Listen for Auth events to sync tokens to NextAuth
  useEffect(() => {
    if (!auth || !isAuthReady) return undefined;

    const handleLoggedIn = async (authUser: User) => {
      // When Auth refreshes tokens, sync to NextAuth session
      if (session?.accessToken && authUser.accessToken !== session.accessToken) {
        await updateSession({
          accessToken: authUser.accessToken,
          refreshToken: authUser.refreshToken,
          idToken: authUser.idToken,
          accessTokenExpires: getTokenExpiry(authUser.accessToken),
          zkEvm: authUser.zkEvm,
        });
      }
    };

    // Handle client-side token refresh - critical for refresh token rotation.
    // When Auth refreshes tokens via signinSilent(), we must sync the new tokens
    // (especially the new refresh token) to the NextAuth session. Without this,
    // the server-side JWT callback may use a stale refresh token that Auth0 has
    // already invalidated, causing "Unknown or invalid refresh token" errors.
    const handleTokenRefreshed = async (authUser: User) => {
      await updateSession({
        accessToken: authUser.accessToken,
        refreshToken: authUser.refreshToken,
        idToken: authUser.idToken,
        accessTokenExpires: getTokenExpiry(authUser.accessToken),
        zkEvm: authUser.zkEvm,
      });
    };

    auth.eventEmitter.on(AuthEvents.LOGGED_IN, handleLoggedIn);
    auth.eventEmitter.on(AuthEvents.TOKEN_REFRESHED, handleTokenRefreshed);

    return () => {
      auth.eventEmitter.removeListener(AuthEvents.LOGGED_IN, handleLoggedIn);
      auth.eventEmitter.removeListener(AuthEvents.TOKEN_REFRESHED, handleTokenRefreshed);
    };
  }, [auth, isAuthReady, session, updateSession]);

  const contextValue = useMemo(
    () => ({ auth, config, basePath }),
    [auth, config, basePath],
  );

  return (
    <ImmutableAuthContext.Provider value={contextValue}>
      {children}
    </ImmutableAuthContext.Provider>
  );
}

/**
 * Provider component for Immutable authentication with Auth.js v5
 *
 * Wraps your app to provide authentication state via useImmutableAuth hook.
 *
 * @example App Router (recommended)
 * ```tsx
 * // app/providers.tsx
 * "use client";
 * import { ImmutableAuthProvider } from "@imtbl/auth-nextjs/client";
 *
 * const config = {
 *   clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
 *   redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
 * };
 *
 * export function Providers({ children }: { children: React.ReactNode }) {
 *   return (
 *     <ImmutableAuthProvider config={config}>
 *       {children}
 *     </ImmutableAuthProvider>
 *   );
 * }
 *
 * // app/layout.tsx
 * import { Providers } from "./providers";
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <Providers>{children}</Providers>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function ImmutableAuthProvider({
  children,
  config,
  session,
  basePath = DEFAULT_NEXTAUTH_BASE_PATH,
}: ImmutableAuthProviderProps) {
  return (
    <SessionProvider session={session as Session | null | undefined} basePath={basePath}>
      <ImmutableAuthInner config={config} basePath={basePath}>{children}</ImmutableAuthInner>
    </SessionProvider>
  );
}

/**
 * Hook to access Immutable authentication state and methods
 *
 * Must be used within an ImmutableAuthProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isLoading, isLoggingIn, signIn, signOut } = useImmutableAuth();
 *
 *   if (isLoading) return <div>Loading session...</div>;
 *
 *   if (user) {
 *     return (
 *       <div>
 *         <p>Welcome, {user.email}</p>
 *         <button onClick={signOut}>Logout</button>
 *       </div>
 *     );
 *   }
 *
 *   return (
 *     <button onClick={signIn} disabled={isLoggingIn}>
 *       {isLoggingIn ? 'Logging in...' : 'Login'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useImmutableAuth(): UseImmutableAuthReturn {
  const context = useContext(ImmutableAuthContext);
  const { data: sessionData, status } = useSession();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!context) {
    throw new Error('useImmutableAuth must be used within ImmutableAuthProvider');
  }

  // Cast session to our augmented Session type
  const session = sessionData as Session | null;

  const { auth } = context;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session;

  // Extract user from session
  const user: ImmutableUser | null = session?.user
    ? {
      sub: session.user.sub,
      email: session.user.email,
      nickname: session.user.nickname,
    }
    : null;

  // Sign in with Immutable popup
  const handleSignIn = useCallback(async (options?: LoginOptions) => {
    if (!auth) {
      throw new Error('Auth not initialized');
    }

    setIsLoggingIn(true);
    try {
      // Open popup login with optional login options
      const authUser = await auth.login(options);
      if (!authUser) {
        throw new Error('Login failed');
      }

      // Build token data for NextAuth
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
    } finally {
      setIsLoggingIn(false);
    }
  }, [auth]);

  // Sign out from both NextAuth and Immutable
  const handleSignOut = useCallback(async () => {
    // Sign out from NextAuth first (clears session cookie)
    await signOut({ redirect: false });

    // Clear local Auth state without doing a full OIDC logout redirect
    // We use getLogoutUrl() which clears local storage but returns URL instead of redirecting
    if (auth) {
      try {
        // This removes the user from local storage without redirecting
        await auth.getLogoutUrl();
      } catch (error) {
        // Ignore errors (user may already be logged out)
        // eslint-disable-next-line no-console
        console.warn('[auth-nextjs] Logout cleanup error:', error);
      }
    }
  }, [auth]);

  // Get access token (refreshes if needed)
  const getAccessToken = useCallback(async (): Promise<string> => {
    // First try to get from Auth instance (most up-to-date)
    if (auth) {
      try {
        const token = await auth.getAccessToken();
        if (token) {
          return token;
        }
      } catch {
        // Fall through to session
      }
    }

    // Fall back to session token, but check for errors first
    // When server-side token refresh fails, the session contains both an error flag
    // and the original stale token. We must not return the stale token in this case.
    if (session?.error) {
      throw new Error(`Token refresh failed: ${session.error}`);
    }

    if (session?.accessToken) {
      return session.accessToken;
    }

    throw new Error('No access token available');
  }, [auth, session]);

  return {
    user,
    session,
    isLoading,
    isLoggingIn,
    isAuthenticated,
    signIn: handleSignIn,
    signOut: handleSignOut,
    getAccessToken,
    auth,
  };
}

/**
 * Hook to get a function that returns a valid access token
 *
 * @example
 * ```tsx
 * function ApiComponent() {
 *   const getAccessToken = useAccessToken();
 *
 *   const fetchData = async () => {
 *     const token = await getAccessToken();
 *     const response = await fetch("/api/data", {
 *       headers: { Authorization: `Bearer ${token}` },
 *     });
 *   };
 * }
 * ```
 */
export function useAccessToken(): () => Promise<string> {
  const { getAccessToken } = useImmutableAuth();
  return getAccessToken;
}

/**
 * Result from useHydratedData hook
 */
export interface UseHydratedDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Props for useHydratedData hook - matches AuthPropsWithData from server
 */
export interface HydratedDataProps<T> {
  session: Session | null;
  ssr: boolean;
  data: T | null;
  fetchError?: string;
  authError?: string;
}

/**
 * Hook for hydrating server-fetched data with automatic client-side fallback.
 *
 * This is the recommended pattern for components that receive data from `getAuthenticatedData`:
 * - When `ssr: true` and `data` exists: Uses pre-fetched server data immediately (no loading state)
 * - When `ssr: false`: Refreshes token client-side and fetches data
 * - When `fetchError` exists: Retries fetch client-side
 *
 * @param props - Props from getAuthenticatedData (session, ssr, data, fetchError)
 * @param fetcher - Async function that receives access token and returns data (for client-side fallback)
 * @returns Object with data, isLoading, error, and refetch function
 *
 * @example
 * ```tsx
 * // app/dashboard/page.tsx (Server Component)
 * import { getAuthenticatedData } from "@imtbl/auth-nextjs/server";
 *
 * export default async function DashboardPage() {
 *   const props = await getAuthenticatedData(auth, fetchDashboardData);
 *   if (props.authError) redirect("/login");
 *   return <Dashboard {...props} />;
 * }
 *
 * // app/dashboard/Dashboard.tsx (Client Component)
 * "use client";
 * import { useHydratedData } from "@imtbl/auth-nextjs/client";
 *
 * export default function Dashboard(props: AuthPropsWithData<DashboardData>) {
 *   const { data, isLoading, error } = useHydratedData(props, fetchDashboardData);
 *
 *   if (isLoading) return <Skeleton />;
 *   if (error) return <Error message={error.message} />;
 *   return <DashboardContent data={data} />;
 * }
 * ```
 */
export function useHydratedData<T>(
  props: HydratedDataProps<T>,
  fetcher: (accessToken: string) => Promise<T>,
): UseHydratedDataResult<T> {
  const { getAccessToken } = useImmutableAuth();
  const {
    session,
    ssr,
    data: serverData,
    fetchError,
  } = props;

  // Determine if we need to fetch client-side:
  // 1. SSR was skipped (token expired) - need to refresh token and fetch
  // 2. Server fetch failed - retry on client
  // 3. No server data - need to fetch
  const needsClientFetch = !ssr || Boolean(fetchError) || serverData === null;

  // Initialize state with server data if available
  const [data, setData] = useState<T | null>(serverData);
  const [isLoading, setIsLoading] = useState(needsClientFetch);
  const [error, setError] = useState<Error | null>(
    fetchError ? new Error(fetchError) : null,
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let token: string;

      if (ssr && session?.accessToken) {
        // SSR mode with valid session: use session token
        token = session.accessToken;
      } else {
        // CSR mode: get/refresh token client-side
        token = await getAccessToken();
      }

      const result = await fetcher(token);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [session, ssr, fetcher, getAccessToken]);

  // Only fetch on mount if we need client-side data
  // Using empty deps intentionally - we only want to run once on mount.
  // The needsClientFetch check inside handles the condition.
  useEffect(() => {
    if (needsClientFetch) {
      fetchData();
    }
    // eslint-disable-next-line
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
