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
  Auth, type User, type DeviceTokenResponse, type LoginOptions,
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
  DEFAULT_TOKEN_EXPIRY_SECONDS,
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
    ].join(':');

    // Only recreate if config actually changed
    if (prevConfigRef.current === configKey) {
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
    });

    setAuth(newAuth);
    setIsAuthReady(true);

    // Cleanup function: When config changes or component unmounts,
    // clear the Auth instance to prevent memory leaks.
    // The Auth class holds a UserManager from oidc-client-ts which may register
    // window event listeners (storage, message). By setting auth to null,
    // we allow garbage collection.
    // NOTE: We intentionally do NOT reset prevConfigRef here. React runs cleanup
    // before the new effect when dependencies change, so resetting the ref would
    // defeat the optimization that prevents Auth recreation when only the config
    // reference changes but values stay the same. The ref persists to enable this
    // comparison; it will be reset naturally when the component fully unmounts
    // and remounts (since refs are tied to component instances).
    return () => {
      setAuth(null);
      setIsAuthReady(false);
    };
  }, [config]);

  // Hydrate Auth instance from NextAuth session if localStorage is cleared
  // This handles the case where a valid session exists but Auth has no local state
  useEffect(() => {
    if (!auth || !isAuthReady) return;
    // Don't hydrate if session has an error (e.g., RefreshTokenError)
    // When server-side token refresh fails, the session contains both stale tokens
    // AND an error flag - we must not store these stale tokens in the Auth instance
    if (session?.error) return;
    if (!session?.accessToken || !session?.idToken) return;

    const hydrateAuth = async () => {
      try {
        // Re-check tokens inside async function for TypeScript narrowing
        const {
          accessToken, idToken, refreshToken, accessTokenExpires,
        } = session;
        if (!accessToken || !idToken) return;

        // Check if Auth already has user data
        const existingUser = await auth.getUser();
        if (existingUser) return; // Already hydrated

        // Calculate expires_in from accessTokenExpires
        const expiresIn = accessTokenExpires
          ? Math.max(0, Math.floor((accessTokenExpires - Date.now()) / 1000))
          : DEFAULT_TOKEN_EXPIRY_SECONDS;

        // Hydrate Auth with tokens from NextAuth session
        const tokenResponse: DeviceTokenResponse = {
          access_token: accessToken,
          refresh_token: refreshToken,
          id_token: idToken,
          token_type: 'Bearer',
          expires_in: expiresIn,
        };

        await auth.storeTokens(tokenResponse);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('[auth-nextjs] Failed to hydrate Auth instance:', error);
      }
    };

    hydrateAuth();
  }, [auth, isAuthReady, session]);

  // Listen for Auth events to sync tokens back to NextAuth
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

    auth.eventEmitter.on('loggedIn', handleLoggedIn);

    return () => {
      auth.eventEmitter.removeListener('loggedIn', handleLoggedIn);
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
 *   const { user, isLoading, signIn, signOut } = useImmutableAuth();
 *
 *   if (isLoading) return <div>Loading...</div>;
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
 *   return <button onClick={signIn}>Login</button>;
 * }
 * ```
 */
export function useImmutableAuth(): UseImmutableAuthReturn {
  const context = useContext(ImmutableAuthContext);
  const { data: sessionData, status } = useSession();

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
