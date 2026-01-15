// Server-side exports for App Router

import { type NextRequest, NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { matchPathPrefix } from '../utils/pathMatch';

// Re-export createImmutableAuth from main module
export { createImmutableAuth } from '..';

// Re-export createAuthConfig
export { createAuthConfig, createAuthOptions } from '../config';

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
 *
 * @example
 * ```typescript
 * // app/dashboard/page.tsx (Server Component)
 * import { getAuthenticatedData } from "@imtbl/auth-nextjs/server";
 * import { auth } from "@/lib/auth";
 * import { redirect } from "next/navigation";
 * import Dashboard from "./Dashboard";
 *
 * async function fetchDashboardData(token: string) {
 *   const res = await fetch("https://api.example.com/dashboard", {
 *     headers: { Authorization: `Bearer ${token}` },
 *   });
 *   return res.json();
 * }
 *
 * export default async function DashboardPage() {
 *   const props = await getAuthenticatedData(auth, fetchDashboardData);
 *
 *   // Only redirect on auth errors (e.g., refresh token invalid)
 *   if (props.authError) redirect(`/login?error=${props.authError}`);
 *
 *   // Pass everything to client component - it handles both SSR and CSR cases
 *   return <Dashboard {...props} />;
 * }
 *
 * // app/dashboard/Dashboard.tsx (Client Component)
 * "use client";
 * import { useHydratedData } from "@imtbl/auth-nextjs/client";
 * import type { AuthPropsWithData } from "@imtbl/auth-nextjs/server";
 *
 * async function fetchDashboardData(token: string) {
 *   const res = await fetch("/api/dashboard", {
 *     headers: { Authorization: `Bearer ${token}` },
 *   });
 *   return res.json();
 * }
 *
 * export default function Dashboard(props: AuthPropsWithData<DashboardData>) {
 *   // When ssr=true: uses server-fetched data immediately (no loading)
 *   // When ssr=false: refreshes token client-side and fetches data
 *   const { data, isLoading, error } = useHydratedData(props, fetchDashboardData);
 *
 *   if (isLoading) return <DashboardSkeleton />;
 *   if (error) return <ErrorDisplay error={error} />;
 *   return <DashboardContent data={data} />;
 * }
 * ```
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
 *
 * @example
 * ```typescript
 * const result = await getValidSession(auth);
 *
 * switch (result.status) {
 *   case 'authenticated':
 *     return <ServerDashboard session={result.session} />;
 *   case 'token_expired':
 *     return <ClientDashboard />; // Client will refresh tokens
 *   case 'unauthenticated':
 *     redirect('/login');
 *   case 'error':
 *     redirect(`/login?error=${result.error}`);
 * }
 * ```
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
 *
 * @example
 * ```typescript
 * // lib/auth-server.ts
 * import { createProtectedDataFetcher } from "@imtbl/auth-nextjs/server";
 * import { auth } from "./auth";
 * import { redirect } from "next/navigation";
 *
 * export const getProtectedData = createProtectedDataFetcher(auth, (error) => {
 *   redirect(`/login?error=${encodeURIComponent(error)}`);
 * });
 *
 * // app/dashboard/page.tsx - No authError check needed!
 * export default async function DashboardPage() {
 *   const props = await getProtectedData(fetchDashboardData);
 *   return <Dashboard {...props} />; // authError is handled automatically
 * }
 * ```
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
 *
 * @example
 * ```typescript
 * // lib/auth-server.ts
 * export const getProtectedAuthProps = createProtectedAuthProps(auth, (error) => {
 *   redirect(`/login?error=${encodeURIComponent(error)}`);
 * });
 *
 * // app/profile/page.tsx
 * export default async function ProfilePage() {
 *   const props = await getProtectedAuthProps();
 *   return <Profile {...props} />;
 * }
 * ```
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
 *
 * @example
 * ```typescript
 * // lib/auth-server.ts
 * import { createProtectedFetchers } from "@imtbl/auth-nextjs/server";
 * import { auth } from "./auth";
 * import { redirect } from "next/navigation";
 *
 * // Define auth error handling ONCE
 * export const { getAuthProps, getData } = createProtectedFetchers(auth, (error) => {
 *   redirect(`/login?error=${encodeURIComponent(error)}`);
 * });
 *
 * // app/dashboard/page.tsx - Clean, no boilerplate!
 * import { getData } from "@/lib/auth-server";
 *
 * export default async function DashboardPage() {
 *   const props = await getData(fetchDashboardData);
 *   return <Dashboard {...props} />;
 * }
 *
 * // app/profile/page.tsx - Works for auth-only pages too
 * import { getAuthProps } from "@/lib/auth-server";
 *
 * export default async function ProfilePage() {
 *   const props = await getAuthProps();
 *   return <Profile {...props} />;
 * }
 * ```
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
 * This eliminates the need for manual conditional checks in your Server Components:
 *
 * @param auth - The auth function from createImmutableAuth
 * @param serverRender - Async function that receives valid session and returns JSX
 * @param options - Fallback options for different auth states
 * @returns The rendered content based on auth state
 *
 * @example Basic usage with client fallback:
 * ```typescript
 * // app/dashboard/page.tsx
 * import { withServerAuth } from "@imtbl/auth-nextjs/server";
 * import { auth } from "@/lib/auth";
 * import { ClientDashboard } from "./ClientDashboard";
 *
 * export default function DashboardPage() {
 *   return withServerAuth(
 *     auth,
 *     async (session) => {
 *       // This only runs when token is valid
 *       const data = await fetchDashboardData(session.accessToken);
 *       return <ServerDashboard data={data} user={session.user} />;
 *     },
 *     {
 *       // Render client component when token expired - it will refresh & fetch
 *       onTokenExpired: <ClientDashboard />,
 *       onUnauthenticated: <LoginPrompt />,
 *     }
 *   );
 * }
 * ```
 *
 * @example With redirect on unauthenticated:
 * ```typescript
 * import { redirect } from "next/navigation";
 *
 * export default function ProtectedPage() {
 *   return withServerAuth(
 *     auth,
 *     async (session) => {
 *       const data = await fetchProtectedData(session.accessToken);
 *       return <ProtectedContent data={data} />;
 *     },
 *     {
 *       onTokenExpired: <ClientProtectedContent />,
 *       onUnauthenticated: () => redirect("/login"),
 *       onError: (error) => redirect(`/login?error=${error}`),
 *     }
 *   );
 * }
 * ```
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
 * Type for the auth function returned by createImmutableAuth
 */
export type AuthFunction = () => Promise<Session | null>;

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
 * import { createAuthMiddleware } from "@imtbl/auth-nextjs/server";
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
 *
 * @example With path configuration:
 * ```typescript
 * export default createAuthMiddleware(auth, {
 *   loginUrl: "/login",
 *   protectedPaths: [/^\/dashboard/, /^\/profile/],
 *   publicPaths: [/^\/api\/public/],
 * });
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
 *
 * @example Protecting a Route Handler with request access:
 * ```typescript
 * // app/api/protected/route.ts
 * import { withAuth } from "@imtbl/auth-nextjs/server";
 * import { auth } from "@/lib/auth";
 *
 * export const POST = withAuth(auth, async (session, request: Request) => {
 *   const body = await request.json();
 *   return Response.json({ user: session.user, data: body });
 * });
 *
 * export const GET = withAuth(auth, async (session, request: Request, context) => {
 *   const { params } = context;
 *   return Response.json({ user: session.user, params: await params });
 * });
 * ```
 *
 * @example Protecting a Server Action:
 * ```typescript
 * // app/actions.ts
 * "use server";
 * import { withAuth } from "@imtbl/auth-nextjs/server";
 * import { auth } from "@/lib/auth";
 *
 * export const protectedAction = withAuth(auth, async (session, formData: FormData) => {
 *   const userId = session.user.sub;
 *   const name = formData.get("name");
 *   // ... your action logic
 * });
 * ```
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
