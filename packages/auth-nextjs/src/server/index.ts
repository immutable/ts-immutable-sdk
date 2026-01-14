// Server-side exports for App Router

import { type NextRequest, NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { matchPathPrefix } from '../utils/pathMatch';

// Re-export createImmutableAuth for convenience
export { createImmutableAuth, createAuthConfig } from '../index';

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
