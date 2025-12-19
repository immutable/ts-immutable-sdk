import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import type { IncomingMessage, ServerResponse } from 'http';
import { getServerSession as nextAuthGetServerSession, type Session } from 'next-auth';
import type { ImmutableAuthConfig, WithPageAuthRequiredOptions } from '../types';
import { createAuthOptions } from '../config';

/**
 * Extended options for withPageAuthRequired
 */
export interface WithPageAuthRequiredFullOptions<
  P extends Record<string, unknown> = Record<string, unknown>,
> extends WithPageAuthRequiredOptions {
  /**
   * Custom getServerSideProps that runs after auth check.
   * Session is guaranteed to exist when this runs.
   */
  getServerSideProps?: (
    ctx: GetServerSidePropsContext,
    session: Session
  ) => Promise<GetServerSidePropsResult<P>>;
}

/**
 * Props added by withPageAuthRequired
 */
export interface WithPageAuthRequiredProps {
  session: Session;
}

/**
 * Get the Immutable session on the server side.
 *
 * @example
 * ```typescript
 * // pages/api/user.ts
 * import { getImmutableSession } from "@imtbl/auth-nextjs/server";
 *
 * const config = { clientId: "...", redirectUri: "..." };
 *
 * export default async function handler(req, res) {
 *   const session = await getImmutableSession(req, res, config);
 *   if (!session) {
 *     return res.status(401).json({ error: "Not authenticated" });
 *   }
 *   res.json({ user: session.user });
 * }
 * ```
 *
 * @example In getServerSideProps
 * ```typescript
 * export const getServerSideProps = async (ctx) => {
 *   const session = await getImmutableSession(ctx.req, ctx.res, config);
 *   return { props: { user: session?.user ?? null } };
 * };
 * ```
 */
export async function getImmutableSession(
  req: IncomingMessage & { cookies: Partial<Record<string, string>> },
  res: ServerResponse,
  config: ImmutableAuthConfig,
): Promise<Session | null> {
  const authOptions = createAuthOptions(config);
  return nextAuthGetServerSession(req, res, authOptions);
}

/**
 * Higher-order function that protects a page with authentication.
 *
 * When a signed-out user visits the page:
 * 1. Server checks session via getServerSession() → returns null
 * 2. Returns HTTP redirect to login page with returnTo parameter
 * 3. After login, user is redirected back to original page
 *
 * @example Basic usage:
 * ```typescript
 * // pages/dashboard.tsx
 * import { withPageAuthRequired } from "@imtbl/auth-nextjs/server";
 *
 * const config = { clientId: "...", redirectUri: "..." };
 *
 * function DashboardPage() {
 *   // Page only renders if user is authenticated
 *   return <h1>Dashboard</h1>;
 * }
 *
 * export default DashboardPage;
 * export const getServerSideProps = withPageAuthRequired(config);
 * ```
 *
 * @example With additional data fetching:
 * ```typescript
 * export const getServerSideProps = withPageAuthRequired(config, {
 *   async getServerSideProps(ctx, session) {
 *     // session is guaranteed to exist here
 *     const data = await fetchData(session.accessToken);
 *     return { props: { data } };
 *   },
 * });
 * ```
 *
 * @example With custom options:
 * ```typescript
 * export const getServerSideProps = withPageAuthRequired(config, {
 *   loginUrl: "/auth/signin",
 *   returnTo: "/dashboard",
 * });
 * ```
 */
export function withPageAuthRequired<
  P extends Record<string, unknown> = Record<string, unknown>,
>(
  config: ImmutableAuthConfig,
  options: WithPageAuthRequiredFullOptions<P> = {},
): GetServerSideProps<WithPageAuthRequiredProps & P> {
  const {
    loginUrl = '/login',
    returnTo,
    getServerSideProps: customGetServerSideProps,
  } = options;

  const authOptions = createAuthOptions(config);

  return async (ctx: GetServerSidePropsContext) => {
    const session = await nextAuthGetServerSession(ctx.req, ctx.res, authOptions);

    if (!session) {
      // Build redirect URL
      let destination = loginUrl;

      if (returnTo !== false) {
        const returnPath = returnTo || ctx.resolvedUrl;
        // Use '&' if loginUrl already has a query string, otherwise use '?'
        const separator = loginUrl.includes('?') ? '&' : '?';
        destination = `${loginUrl}${separator}returnTo=${encodeURIComponent(returnPath)}`;
      }

      return {
        redirect: {
          destination,
          permanent: false,
        },
      };
    }

    // Run custom getServerSideProps if provided
    if (customGetServerSideProps) {
      const result = await customGetServerSideProps(ctx, session);

      // Handle redirect or notFound
      if ('redirect' in result || 'notFound' in result) {
        return result;
      }

      // Merge props with session
      // Note: result.props can be P | Promise<P>, so we must await it
      const userProps = await result.props;
      return {
        props: {
          ...userProps,
          session,
        } as WithPageAuthRequiredProps & P,
      };
    }

    // Default: just return session
    return {
      props: {
        session,
      } as WithPageAuthRequiredProps & P,
    };
  };
}
