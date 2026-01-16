/**
 * @imtbl/auth-next-server
 *
 * Server-side utilities for Immutable Auth.js v5 integration with Next.js.
 * This package has NO dependency on @imtbl/auth and is safe to use in
 * Next.js middleware and Edge Runtime environments.
 *
 * For client-side components (provider, hooks, callback), use @imtbl/auth-next-client.
 */

import NextAuthImport from 'next-auth';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Type exists in next-auth v5 but TS resolver may use stale types
import type { NextAuthConfig, Session } from 'next-auth';
import { type NextRequest, NextResponse } from 'next/server';
import { createAuthConfig } from './config';
import type { ImmutableAuthConfig } from './types';
import { matchPathPrefix } from './utils/pathMatch';

// Handle ESM/CJS interop - in some bundler configurations, the default export
// may be nested under a 'default' property
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NextAuth = ((NextAuthImport as any).default || NextAuthImport) as typeof NextAuthImport;

// ============================================================================
// createImmutableAuth
// ============================================================================

/**
 * Auth.js v5 config options that can be overridden.
 * Excludes 'providers' as that's managed internally.
 */
export type ImmutableAuthOverrides = Omit<NextAuthConfig, 'providers'>;

/**
 * Return type of createImmutableAuth - the NextAuth instance with handlers
 */
export type ImmutableAuthResult = ReturnType<typeof NextAuth>;

/**
 * Create an Auth.js v5 instance with Immutable authentication
 *
 * @param config - Immutable auth configuration
 * @param overrides - Optional Auth.js options to override defaults
 * @returns NextAuth instance with { handlers, auth, signIn, signOut }
 *
 * @remarks
 * Callback composition: The `jwt` and `session` callbacks are composed rather than
 * replaced. Internal callbacks run first (handling token storage and refresh), then
 * your custom callbacks receive the result. Other callbacks (`signIn`, `redirect`)
 * are replaced entirely if provided.
 *
 * @example Basic usage (App Router)
 * ```typescript
 * // lib/auth.ts
 * import { createImmutableAuth } from "@imtbl/auth-next-server";
 *
 * export const { handlers, auth, signIn, signOut } = createImmutableAuth({
 *   clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
 *   redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
 * });
 *
 * // app/api/auth/[...nextauth]/route.ts
 * import { handlers } from "@/lib/auth";
 * export const { GET, POST } = handlers;
 * ```
 */
export function createImmutableAuth(
  config: ImmutableAuthConfig,
  overrides?: ImmutableAuthOverrides,
): ImmutableAuthResult {
  const baseConfig = createAuthConfig(config);

  // If no overrides, use base config directly
  if (!overrides) {
    return NextAuth(baseConfig);
  }

  // Merge configs with callback composition
  const { callbacks: overrideCallbacks, ...otherOverrides } = overrides;

  // Compose callbacks - our callbacks run first, then user's callbacks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const composedCallbacks: any = { ...baseConfig.callbacks };

  if (overrideCallbacks) {
    // For jwt and session callbacks, compose them (ours first, then user's)
    if (overrideCallbacks.jwt) {
      const baseJwt = baseConfig.callbacks?.jwt;
      const userJwt = overrideCallbacks.jwt;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      composedCallbacks.jwt = async (params: any) => {
        const result = baseJwt ? await baseJwt(params) : params.token;
        return userJwt({ ...params, token: result });
      };
    }

    if (overrideCallbacks.session) {
      const baseSession = baseConfig.callbacks?.session;
      const userSession = overrideCallbacks.session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      composedCallbacks.session = async (params: any) => {
        const result = baseSession ? await baseSession(params) : params.session;
        return userSession({ ...params, session: result });
      };
    }

    // For other callbacks, user's callbacks replace ours entirely
    if (overrideCallbacks.signIn) {
      composedCallbacks.signIn = overrideCallbacks.signIn;
    }
    if (overrideCallbacks.redirect) {
      composedCallbacks.redirect = overrideCallbacks.redirect;
    }
    if (overrideCallbacks.authorized) {
      composedCallbacks.authorized = overrideCallbacks.authorized;
    }
  }

  const mergedConfig: NextAuthConfig = {
    ...baseConfig,
    ...otherOverrides,
    callbacks: composedCallbacks,
  };

  return NextAuth(mergedConfig);
}

// ============================================================================
// Re-export config utilities
// ============================================================================

export { createAuthConfig, createAuthOptions } from './config';

// ============================================================================
// Type exports
// ============================================================================

export type {
  ImmutableAuthConfig,
  ImmutableTokenData,
  UserInfoResponse,
  ZkEvmUser,
  ImmutableUser,
} from './types';

// ============================================================================
// Server utilities
// ============================================================================

/**
 * Result from getValidSession indicating auth state
 */
export type ValidSessionResult =
  | { status: 'authenticated'; session: Session }
  | { status: 'token_expired'; session: Session }
  | { status: 'unauthenticated'; session: null }
  | { status: 'error'; session: Session; error: string };

/**
 * Auth props to pass to components - enables automatic SSR/CSR switching.
 * When token is valid, session contains accessToken for immediate use.
 * When token is expired, ssr is false and component should fetch client-side.
 */
export interface AuthProps {
  /** Session with valid tokens, or null if token expired/unauthenticated */
  session: Session | null;
  /** If true, SSR data fetching occurred with valid token */
  ssr: boolean;
  /** Auth error that requires user action (not TokenExpired) */
  authError?: string;
}

/**
 * Auth props with pre-fetched data for SSR hydration.
 * Extends AuthProps with optional data that was fetched server-side.
 */
export interface AuthPropsWithData<T> extends AuthProps {
  /** Pre-fetched data from server (null if SSR was skipped or fetch failed) */
  data: T | null;
  /** Error message if server-side fetch failed */
  fetchError?: string;
}

/**
 * Auth props without the authError field.
 * Used when auth error handling is automatic via onAuthError callback.
 */
export interface ProtectedAuthProps {
  /** Session with valid tokens, or null if token expired/unauthenticated */
  session: Session | null;
  /** If true, SSR data fetching occurred with valid token */
  ssr: boolean;
}

/**
 * Protected auth props with pre-fetched data.
 * Used when auth error handling is automatic via onAuthError callback.
 */
export interface ProtectedAuthPropsWithData<T> extends ProtectedAuthProps {
  /** Pre-fetched data from server (null if SSR was skipped or fetch failed) */
  data: T | null;
  /** Error message if server-side fetch failed */
  fetchError?: string;
}

/**
 * Type for the auth function returned by createImmutableAuth
 */
export type AuthFunction = () => Promise<Session | null>;

/**
 * Get auth props for passing to Client Components (without data fetching).
 * Use this when you want to handle data fetching separately or client-side only.
 *
 * For SSR data fetching, use `getAuthenticatedData` instead.
 *
 * @param auth - The auth function from createImmutableAuth
 * @returns AuthProps with session and ssr flag
 *
 * @example
 * ```typescript
 * const authProps = await getAuthProps(auth);
 * if (authProps.authError) redirect("/login");
 * return <MyComponent {...authProps} />;
 * ```
 */
export async function getAuthProps(auth: AuthFunction): Promise<AuthProps> {
  const session = await auth();

  // No session - unauthenticated
  if (!session) {
    return { session: null, ssr: false };
  }

  // Token expired - skip SSR, let client refresh
  if (session.error === 'TokenExpired') {
    return { session: null, ssr: false };
  }

  // Other error (e.g., RefreshTokenError) - needs user action
  if (session.error) {
    return { session: null, ssr: false, authError: session.error };
  }

  // Valid session - enable SSR
  return { session, ssr: true };
}

/**
 * Fetch authenticated data on the server with automatic SSR/CSR switching.
 *
 * This is the recommended pattern for Server Components that need authenticated data:
 * - When token is valid: Fetches data server-side, returns with `ssr: true`
 * - When token is expired: Skips fetch, returns `ssr: false` for client-side handling
 *
 * @param auth - The auth function from createImmutableAuth
 * @param fetcher - Async function that receives access token and returns data
 * @returns AuthPropsWithData containing session, ssr flag, and pre-fetched data
 */
export async function getAuthenticatedData<T>(
  auth: AuthFunction,
  fetcher: (accessToken: string) => Promise<T>,
): Promise<AuthPropsWithData<T>> {
  const session = await auth();

  // No session - unauthenticated
  if (!session) {
    return { session: null, ssr: false, data: null };
  }

  // Token expired - skip SSR, let client refresh and fetch
  if (session.error === 'TokenExpired') {
    return { session: null, ssr: false, data: null };
  }

  // Other error (e.g., RefreshTokenError) - needs user action
  if (session.error) {
    return {
      session: null,
      ssr: false,
      data: null,
      authError: session.error,
    };
  }

  // Valid session - fetch data server-side
  try {
    const data = await fetcher(session.accessToken!);
    return { session, ssr: true, data };
  } catch (err) {
    // Fetch failed but auth is valid - return error for client to handle
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      session,
      ssr: true,
      data: null,
      fetchError: errorMessage,
    };
  }
}

/**
 * Get session with detailed status for Server Components.
 * Use this when you need fine-grained control over different auth states.
 *
 * @param auth - The auth function from createImmutableAuth
 * @returns Object with status and session
 */
export async function getValidSession(auth: AuthFunction): Promise<ValidSessionResult> {
  const session = await auth();

  if (!session) {
    return { status: 'unauthenticated', session: null };
  }

  if (!session.error) {
    return { status: 'authenticated', session };
  }

  if (session.error === 'TokenExpired') {
    return { status: 'token_expired', session };
  }

  return { status: 'error', session, error: session.error };
}

/**
 * Auth error handler signature.
 * The handler should either redirect (using Next.js redirect()) or throw an error.
 * It must never return normally - hence the `never` return type.
 *
 * @param error - The auth error (e.g., "RefreshTokenError")
 */
export type AuthErrorHandler = (error: string) => never;

/**
 * Create a protected data fetcher with automatic auth error handling.
 *
 * This eliminates the need to check `authError` on every page. Define the error
 * handling once, and all pages using this fetcher will automatically redirect
 * on auth errors.
 *
 * @param auth - The auth function from createImmutableAuth
 * @param onAuthError - Handler called when there's an auth error (should redirect or throw)
 * @returns A function to fetch protected data without needing authError checks
 */
export function createProtectedDataFetcher(
  auth: AuthFunction,
  onAuthError: AuthErrorHandler,
): <T>(fetcher: (accessToken: string) => Promise<T>) => Promise<ProtectedAuthPropsWithData<T>> {
  return async function getProtectedData<T>(
    fetcher: (accessToken: string) => Promise<T>,
  ): Promise<ProtectedAuthPropsWithData<T>> {
    const result = await getAuthenticatedData(auth, fetcher);

    // If there's an auth error, call the handler (which should redirect/throw)
    if (result.authError) {
      onAuthError(result.authError);
      // TypeScript knows this is unreachable due to `never` return type
    }

    // Remove authError from the result since it's handled
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authError: handledAuthError, ...props } = result;
    return props;
  };
}

/**
 * Create auth props getter with automatic auth error handling.
 *
 * Similar to createProtectedDataFetcher but for cases where you don't need
 * server-side data fetching.
 *
 * @param auth - The auth function from createImmutableAuth
 * @param onAuthError - Handler called when there's an auth error (should redirect or throw)
 * @returns A function to get auth props without needing authError checks
 */
export function createProtectedAuthProps(
  auth: AuthFunction,
  onAuthError: AuthErrorHandler,
): () => Promise<ProtectedAuthProps> {
  return async function getProtectedAuth(): Promise<ProtectedAuthProps> {
    const result = await getAuthProps(auth);

    if (result.authError) {
      onAuthError(result.authError);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authError: handledAuthError, ...props } = result;
    return props;
  };
}

/**
 * Result of createProtectedFetchers
 */
export interface ProtectedFetchers {
  /**
   * Get auth props with automatic auth error handling.
   * No data fetching - use when you only need session/auth state.
   */
  getAuthProps: () => Promise<ProtectedAuthProps>;
  /**
   * Fetch authenticated data with automatic auth error handling.
   * Use for SSR data fetching with automatic fallback.
   */
  getData: <T>(fetcher: (accessToken: string) => Promise<T>) => Promise<ProtectedAuthPropsWithData<T>>;
}

/**
 * Create protected fetchers with centralized auth error handling.
 *
 * This is the recommended way to set up auth error handling once and use it
 * across all protected pages. Define your error handler once, then use the
 * returned functions without needing to check authError on each page.
 *
 * @param auth - The auth function from createImmutableAuth
 * @param onAuthError - Handler called when there's an auth error (should redirect or throw)
 * @returns Object with getAuthProps and getData functions
 */
export function createProtectedFetchers(
  auth: AuthFunction,
  onAuthError: AuthErrorHandler,
): ProtectedFetchers {
  return {
    getAuthProps: createProtectedAuthProps(auth, onAuthError),
    getData: createProtectedDataFetcher(auth, onAuthError),
  };
}

/**
 * Options for withServerAuth
 */
export interface WithServerAuthOptions<TFallback> {
  /**
   * Content to render when token is expired.
   * This should typically be a Client Component that will refresh tokens and fetch data.
   * If not provided, the serverRender function will still be called with the expired session.
   */
  onTokenExpired?: TFallback | (() => TFallback);

  /**
   * Content to render when user is not authenticated at all.
   * If not provided, throws an error.
   */
  onUnauthenticated?: TFallback | (() => TFallback);

  /**
   * Content to render when there's an auth error (e.g., refresh token invalid).
   * If not provided, throws an error.
   */
  onError?: TFallback | ((error: string) => TFallback);
}

/**
 * Helper for Server Components that need authenticated data.
 * Automatically handles token expiration by rendering a client fallback.
 *
 * @param auth - The auth function from createImmutableAuth
 * @param serverRender - Async function that receives valid session and returns JSX
 * @param options - Fallback options for different auth states
 * @returns The rendered content based on auth state
 */
export async function withServerAuth<TResult, TFallback = TResult>(
  auth: AuthFunction,
  serverRender: (session: Session) => Promise<TResult>,
  options: WithServerAuthOptions<TFallback> = {},
): Promise<TResult | TFallback> {
  const result = await getValidSession(auth);

  switch (result.status) {
    case 'authenticated':
      return serverRender(result.session);

    case 'token_expired':
      if (options.onTokenExpired !== undefined) {
        return typeof options.onTokenExpired === 'function'
          ? (options.onTokenExpired as () => TFallback)()
          : options.onTokenExpired;
      }
      // If no fallback provided, still call serverRender - handler can check session.error
      return serverRender(result.session);

    case 'unauthenticated':
      if (options.onUnauthenticated !== undefined) {
        return typeof options.onUnauthenticated === 'function'
          ? (options.onUnauthenticated as () => TFallback)()
          : options.onUnauthenticated;
      }
      throw new Error('Unauthorized: No active session');

    case 'error':
      if (options.onError !== undefined) {
        return typeof options.onError === 'function'
          ? (options.onError as (error: string) => TFallback)(result.error)
          : options.onError;
      }
      throw new Error(`Unauthorized: ${result.error}`);

    default:
      throw new Error('Unknown auth state');
  }
}

// ============================================================================
// Middleware
// ============================================================================

/**
 * Options for createAuthMiddleware
 */
export interface AuthMiddlewareOptions {
  /**
   * URL to redirect to when not authenticated
   * @default "/login"
   */
  loginUrl?: string;
  /**
   * Paths that should be protected (regex patterns)
   * If not provided, middleware should be configured via Next.js matcher
   */
  protectedPaths?: (string | RegExp)[];
  /**
   * Paths that should be excluded from protection (regex patterns)
   * Takes precedence over protectedPaths
   */
  publicPaths?: (string | RegExp)[];
}

/**
 * Create a Next.js middleware for protecting routes with Immutable authentication.
 *
 * This is the App Router replacement for `withPageAuthRequired`.
 *
 * @param auth - The auth function from createImmutableAuth
 * @param options - Middleware options
 * @returns A Next.js middleware function
 *
 * @example Basic usage with Next.js middleware:
 * ```typescript
 * // middleware.ts
 * import { createAuthMiddleware } from "@imtbl/auth-next-server";
 * import { auth } from "@/lib/auth";
 *
 * export default createAuthMiddleware(auth, {
 *   loginUrl: "/login",
 * });
 *
 * export const config = {
 *   matcher: ["/dashboard/:path*", "/profile/:path*"],
 * };
 * ```
 */
export function createAuthMiddleware(
  auth: AuthFunction,
  options: AuthMiddlewareOptions = {},
) {
  const { loginUrl = '/login', protectedPaths, publicPaths } = options;

  return async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if path is public (skip auth)
    if (publicPaths) {
      const isPublic = publicPaths.some((pattern) => {
        if (typeof pattern === 'string') {
          return matchPathPrefix(pathname, pattern);
        }
        return pattern.test(pathname);
      });
      if (isPublic) {
        return NextResponse.next();
      }
    }

    // Check if path is protected
    if (protectedPaths) {
      const isProtected = protectedPaths.some((pattern) => {
        if (typeof pattern === 'string') {
          return matchPathPrefix(pathname, pattern);
        }
        return pattern.test(pathname);
      });
      if (!isProtected) {
        return NextResponse.next();
      }
    }

    // Check authentication
    const session = await auth();

    // No session at all - user is not authenticated, redirect to login
    if (!session) {
      const url = new URL(loginUrl, request.url);
      const returnTo = request.nextUrl.search
        ? `${pathname}${request.nextUrl.search}`
        : pathname;
      url.searchParams.set('returnTo', returnTo);
      return NextResponse.redirect(url);
    }

    // Session exists but has error - distinguish between error types:
    // - "TokenExpired": Access token expired but user may have valid refresh token.
    //   Let the page load - client-side Auth will refresh tokens silently.
    // - Other errors (e.g., "RefreshTokenError"): Refresh token is invalid/expired.
    //   User must re-authenticate, redirect to login.
    if (session.error && session.error !== 'TokenExpired') {
      const url = new URL(loginUrl, request.url);
      const returnTo = request.nextUrl.search
        ? `${pathname}${request.nextUrl.search}`
        : pathname;
      url.searchParams.set('returnTo', returnTo);
      url.searchParams.set('error', session.error);
      return NextResponse.redirect(url);
    }

    // Session valid OR TokenExpired (client will refresh) - allow access

    return NextResponse.next();
  };
}

/**
 * Higher-order function to protect a Server Action or Route Handler.
 *
 * The returned function forwards all arguments from Next.js to your handler,
 * allowing access to the request, context, form data, or any other arguments.
 *
 * @param auth - The auth function from createImmutableAuth
 * @param handler - The handler function to protect. Receives session as first arg,
 *                  followed by any arguments passed by Next.js (request, context, etc.)
 * @returns A protected handler that checks authentication before executing
 */
export function withAuth<TArgs extends unknown[], TReturn>(
  auth: AuthFunction,
  handler: (session: Session, ...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    const session = await auth();

    if (!session) {
      throw new Error('Unauthorized: No active session');
    }

    // Check for session error - distinguish between error types:
    // - "TokenExpired": Access token expired. Server can't make authenticated API calls,
    //   but handler may not need to. If handler needs tokens, it should check session.error.
    //   Throwing here would break SSR for pages that could work with stale data + client refresh.
    // - Other errors (e.g., "RefreshTokenError"): Refresh token is invalid/expired.
    //   User must re-authenticate, throw to signal unauthorized.
    if (session.error && session.error !== 'TokenExpired') {
      throw new Error(`Unauthorized: ${session.error}`);
    }

    // Pass session to handler - handler can check session.error === 'TokenExpired'
    // if it needs to make authenticated API calls and handle accordingly
    return handler(session, ...args);
  };
}
