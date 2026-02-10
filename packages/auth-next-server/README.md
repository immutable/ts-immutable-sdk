# @imtbl/auth-next-server

Server-side utilities for Immutable authentication with Auth.js v5 (NextAuth) in Next.js applications.

## Overview

This package provides server-side authentication utilities for Next.js applications using the App Router. It integrates with Auth.js v5 to handle OAuth authentication with Immutable's identity provider.

**Key features:**

- Auth.js v5 configuration for Immutable authentication
- Route protection via middleware
- Server utilities for authenticated data fetching
- Edge Runtime compatible (no dependency on `@imtbl/auth`)

For client-side components (provider, hooks, callback page), use [`@imtbl/auth-next-client`](../auth-next-client).

## Installation

```bash
npm install @imtbl/auth-next-server next-auth@5
# or
pnpm add @imtbl/auth-next-server next-auth@5
# or
yarn add @imtbl/auth-next-server next-auth@5
```

### Peer Dependencies

- `next` >= 14.0.0
- `next-auth` >= 5.0.0-beta.25

## Quick Start

### 1. Create Auth Configuration

Create a file to configure Immutable authentication:

```typescript
// lib/auth.ts
import NextAuth from "next-auth";
import { createAuthConfig } from "@imtbl/auth-next-server";

export const { handlers, auth, signIn, signOut } = NextAuth(
  createAuthConfig({
    clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
  }),
);
```

### 2. Set Up API Route

Create the Auth.js API route handler:

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

### 3. Add Environment Variables

```bash
# .env.local
NEXT_PUBLIC_IMMUTABLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_BASE_URL=http://localhost:3000
AUTH_SECRET=your-secret-key-min-32-characters
```

## Configuration

### `createAuthConfig(config)`

Creates an Auth.js v5 configuration object for Immutable authentication. You pass this to `NextAuth()` to create your auth instance.

```typescript
import NextAuth from "next-auth";
import { createAuthConfig } from "@imtbl/auth-next-server";

const { handlers, auth, signIn, signOut } = NextAuth(
  createAuthConfig({
    // Required
    clientId: "your-client-id",
    redirectUri: "https://your-app.com/callback",

    // Optional
    audience: "platform_api", // Default: "platform_api"
    scope: "openid profile email offline_access transact", // Default scope
    authenticationDomain: "https://auth.immutable.com", // Default domain
  }),
);
```

#### Configuration Options

| Option                 | Type     | Required | Description                                                              |
| ---------------------- | -------- | -------- | ------------------------------------------------------------------------ |
| `clientId`             | `string` | Yes      | Your Immutable application client ID                                     |
| `redirectUri`          | `string` | Yes      | OAuth redirect URI configured in Immutable Hub                           |
| `audience`             | `string` | No       | OAuth audience (default: `"platform_api"`)                               |
| `scope`                | `string` | No       | OAuth scopes (default: `"openid profile email offline_access transact"`) |
| `authenticationDomain` | `string` | No       | Auth domain (default: `"https://auth.immutable.com"`)                    |

#### Extending the Configuration

You can spread the config and add your own Auth.js options:

```typescript
import NextAuth from "next-auth";
import { createAuthConfig } from "@imtbl/auth-next-server";

const baseConfig = createAuthConfig({
  clientId: "your-client-id",
  redirectUri: "https://your-app.com/callback",
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...baseConfig,
  // Auth.js options
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  basePath: "/api/auth/custom",

  // Extend callbacks (be sure to call the base callbacks first)
  callbacks: {
    ...baseConfig.callbacks,
    async jwt(params) {
      // Call base jwt callback first
      const token = (await baseConfig.callbacks?.jwt?.(params)) ?? params.token;
      // Add your custom logic
      return token;
    },
    async session(params) {
      // Call base session callback first
      const session =
        (await baseConfig.callbacks?.session?.(params)) ?? params.session;
      // Add your custom logic
      return session;
    },
  },
});
```

## Server Utilities

This package provides several utilities for handling authentication in Server Components. Choose the right one based on your needs:

| Utility                   | Use Case                                          | Data Fetching | Error Handling    |
| ------------------------- | ------------------------------------------------- | ------------- | ----------------- |
| `getAuthProps`            | Pass auth state to client, fetch data client-side | No            | Manual            |
| `getAuthenticatedData`    | SSR data fetching with client fallback            | Yes           | Manual            |
| `createProtectedFetchers` | Multiple pages with same error handling           | Optional      | Centralized       |
| `getValidSession`         | Custom logic for each auth state                  | No            | Manual (detailed) |

### `getAuthProps(auth)`

**Use case:** You want to pass authentication state to a Client Component but handle data fetching entirely on the client side. This is the simplest approach when your page doesn't need SSR data fetching.

**When to use:**

- Pages where data is fetched client-side (e.g., infinite scroll, real-time updates)
- Pages that show a loading skeleton while fetching
- When you want full control over loading states in the client

```typescript
// app/dashboard/page.tsx
// Use case: Dashboard that fetches data client-side with loading states
import { auth } from "@/lib/auth";
import { getAuthProps } from "@imtbl/auth-next-server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const authProps = await getAuthProps(auth);

  if (authProps.authError) {
    redirect("/login");
  }

  // DashboardClient will fetch its own data using useImmutableSession().getUser()
  return <DashboardClient {...authProps} />;
}
```

### `getAuthenticatedData(auth, fetcher)`

**Use case:** You want to fetch data server-side for faster initial page loads (SSR), but gracefully fall back to client-side fetching when the token is expired.

**When to use:**

- Pages that benefit from SSR (SEO, faster first paint)
- Profile pages, settings pages, or any page showing user-specific data
- When you want the best of both worlds: SSR when possible, CSR as fallback

**How it works:**

1. If token is valid → fetches data server-side, returns `ssr: true`
2. If token is expired → skips fetch, returns `ssr: false`, client refreshes and fetches
3. Pair with `useHydratedData` hook on the client for seamless handling

```typescript
// app/profile/page.tsx
// Use case: Profile page with SSR for fast initial load
import { auth } from "@/lib/auth";
import { getAuthenticatedData } from "@imtbl/auth-next-server";
import { redirect } from "next/navigation";
import { ProfileClient } from "./ProfileClient";

async function fetchUserProfile(accessToken: string) {
  const response = await fetch("https://api.immutable.com/v1/user/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.json();
}

export default async function ProfilePage() {
  const result = await getAuthenticatedData(auth, fetchUserProfile);

  if (result.authError) {
    redirect("/login");
  }

  // ProfileClient uses useHydratedData() to handle both SSR data and client fallback
  return <ProfileClient {...result} />;
}
```

### `createProtectedFetchers(auth, onAuthError)`

**Use case:** You have multiple protected pages and want to define auth error handling once, rather than repeating `if (authError) redirect(...)` on every page.

**When to use:**

- Apps with many protected pages sharing the same error handling logic
- When you want DRY (Don't Repeat Yourself) error handling
- Teams that want consistent auth error behavior across the app

**How it works:**

- Define error handling once in a shared file
- Use the returned `getAuthProps` and `getData` functions in your pages
- Auth errors automatically trigger your handler (no manual checking needed)

```typescript
// lib/protected.ts
// Use case: Centralized auth error handling for all protected pages
import { auth } from "@/lib/auth";
import { createProtectedFetchers } from "@imtbl/auth-next-server";
import { redirect } from "next/navigation";

// Define once: what happens on auth errors across all protected pages
export const { getAuthProps, getData } = createProtectedFetchers(
  auth,
  (error) => {
    // This runs automatically when there's an auth error (e.g., RefreshTokenError)
    redirect(`/login?error=${error}`);
  },
);
```

```typescript
// app/dashboard/page.tsx
// Use case: Protected page without manual error checking
import { getData } from "@/lib/protected";

export default async function DashboardPage() {
  // No need to check authError - it's handled by createProtectedFetchers
  const result = await getData(async (token) => {
    return fetchDashboardData(token);
  });

  return <DashboardClient {...result} />;
}
```

```typescript
// app/settings/page.tsx
// Use case: Another protected page - same clean pattern
import { getAuthProps } from "@/lib/protected";

export default async function SettingsPage() {
  // No need to check authError here either
  const authProps = await getAuthProps();
  return <SettingsClient {...authProps} />;
}
```

### `getValidSession(auth)`

**Use case:** You need fine-grained control over different authentication states and want to handle each case with custom logic.

**When to use:**

- Complex pages that render completely different UI based on auth state
- When you need to distinguish between "token expired" vs "not authenticated"
- Analytics or logging that needs to track specific auth states
- Custom error pages or special handling for each state

```typescript
// app/account/page.tsx
// Use case: Page that shows completely different content based on auth state
import { auth } from "@/lib/auth";
import { getValidSession } from "@imtbl/auth-next-server";

export default async function AccountPage() {
  const result = await getValidSession(auth);

  switch (result.status) {
    case "authenticated":
      // Full access - render the complete account page with SSR data
      const userData = await fetchUserData(result.session.accessToken);
      return <FullAccountPage user={userData} />;

    case "token_expired":
      // Token expired but user has session - show skeleton, let client refresh
      // This avoids a flash of "please login" for users who are actually logged in
      return <AccountPageSkeleton session={result.session} />;

    case "unauthenticated":
      // No session at all - show login prompt or redirect
      return <LoginPrompt message="Sign in to view your account" />;

    case "error":
      // Auth system error (e.g., refresh token revoked) - needs re-login
      return <AuthErrorPage error={result.error} />;
  }
}
```

## Middleware

### `createAuthMiddleware(auth, options)`

**Use case:** Protect entire sections of your app at the routing level, before pages even render. This is the most efficient way to block unauthenticated access.

**When to use:**

- You have groups of pages that all require authentication (e.g., `/dashboard/*`, `/settings/*`)
- You want to redirect unauthenticated users before any page code runs
- You need consistent protection across many routes without adding checks to each page

**When NOT to use:**

- Pages that show different content for authenticated vs unauthenticated users (use page-level checks instead)
- Public pages with optional authenticated features

```typescript
// middleware.ts
// Use case: Protect all dashboard and settings routes at the edge
import { createAuthMiddleware } from "@imtbl/auth-next-server";
import { auth } from "@/lib/auth";

export default createAuthMiddleware(auth, {
  loginUrl: "/login",
  // These paths skip authentication entirely
  publicPaths: ["/", "/about", "/api/public", "/pricing"],
});

// Only run middleware on these paths (Next.js config)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

#### Middleware Options

| Option           | Type                   | Description                                                 |
| ---------------- | ---------------------- | ----------------------------------------------------------- |
| `loginUrl`       | `string`               | URL to redirect unauthenticated users (default: `"/login"`) |
| `protectedPaths` | `(string \| RegExp)[]` | Paths that require authentication                           |
| `publicPaths`    | `(string \| RegExp)[]` | Paths that skip authentication (takes precedence)           |

### `withAuth(auth, handler)`

**Use case:** Protect individual API Route Handlers or Server Actions. Ensures the handler only runs for authenticated users.

**When to use:**

- API routes that should only be accessible to authenticated users
- Server Actions (form submissions, mutations) that require authentication
- When you need the session/user info inside the handler

#### Example: Protected API Route

```typescript
// app/api/user/inventory/route.ts
// Use case: API endpoint that returns user's inventory - must be authenticated
import { auth } from "@/lib/auth";
import { withAuth } from "@imtbl/auth-next-server";
import { NextResponse } from "next/server";

export const GET = withAuth(auth, async (session, request) => {
  // session is guaranteed to exist - handler won't run if unauthenticated
  const inventory = await fetchUserInventory(session.accessToken);
  return NextResponse.json(inventory);
});
```

#### Example: Protected Server Action

```typescript
// app/actions/transfer.ts
// Use case: Server Action for transferring assets - requires authentication
"use server";

import { auth } from "@/lib/auth";
import { withAuth } from "@imtbl/auth-next-server";

export const transferAsset = withAuth(
  auth,
  async (session, formData: FormData) => {
    const assetId = formData.get("assetId") as string;
    const toAddress = formData.get("toAddress") as string;

    // Use session.user.sub to identify the sender
    // Use session.accessToken to call Immutable APIs
    const result = await executeTransfer({
      from: session.user.sub,
      to: toAddress,
      assetId,
      accessToken: session.accessToken,
    });

    return result;
  },
);
```

## Session Types

The package augments the Auth.js `Session` type with Immutable-specific fields:

```typescript
interface Session {
  user: {
    sub: string; // Immutable user ID
    email?: string;
    nickname?: string;
  };
  accessToken: string;
  refreshToken?: string;
  idToken?: string; // Only present transiently after sign-in or token refresh (not stored in cookie)
  accessTokenExpires: number;
  zkEvm?: {
    ethAddress: string;
    userAdminAddress: string;
  };
  error?: string; // "TokenExpired" or "RefreshTokenError"
}
```

> **Note:** The `idToken` is **not** stored in the session cookie. It is stripped by a custom `jwt.encode` to keep cookie size under CDN header limits. The `idToken` is only present in the session response transiently after sign-in or token refresh. On the client, `@imtbl/auth-next-client` automatically persists it in `localStorage` so that wallet operations (via `getUser()`) can always access it. All data extracted from the idToken (`email`, `nickname`, `zkEvm`) remains in the cookie as separate fields.

## Token Refresh

### Automatic Refresh on Token Expiry

The `jwt` callback automatically refreshes tokens when the access token expires. This happens transparently during any session access (page load, API call, etc.).

### Force Refresh (for Updated Claims)

After operations that update the user's profile on the identity provider (e.g., zkEVM registration), you may need to force a token refresh to get the updated claims.

The `getUser` function from `@imtbl/auth-next-client` supports this:

```tsx
import { useImmutableSession } from "@imtbl/auth-next-client";

function MyComponent() {
  const { getUser } = useImmutableSession();

  const handleRegistration = async () => {
    // After zkEVM registration completes...

    // Force refresh to get updated zkEvm claims from IDP
    const freshUser = await getUser(true);
    console.log("Updated zkEvm:", freshUser?.zkEvm);
  };
}
```

When `forceRefresh` is triggered:

1. Client calls `update({ forceRefresh: true })` via NextAuth
2. The `jwt` callback detects `trigger === 'update'` with `forceRefresh: true`
3. Server performs a token refresh using the refresh token
4. Updated claims (like `zkEvm`) are extracted from the new ID token
5. Session is updated with fresh data

### Exported Utilities

The package also exports utilities for manual token handling:

```typescript
import {
  isTokenExpired, // Check if access token is expired
  refreshAccessToken, // Manually refresh tokens
  extractZkEvmFromIdToken, // Extract zkEvm claims from ID token
} from "@imtbl/auth-next-server";
```

## Error Handling

The session may contain an `error` field indicating authentication issues:

| Error                 | Description                                      | Recommended Action                               |
| --------------------- | ------------------------------------------------ | ------------------------------------------------ |
| `"TokenExpired"`      | Access token expired, refresh token may be valid | Let client refresh via `@imtbl/auth-next-client` |
| `"RefreshTokenError"` | Refresh token invalid/expired                    | Redirect to login                                |

## TypeScript

All types are exported for use in your application:

```typescript
import type {
  ImmutableAuthConfig,
  ImmutableTokenData,
  ImmutableUser,
  ZkEvmUser,
  AuthProps,
  AuthPropsWithData,
  ProtectedAuthProps,
  ProtectedAuthPropsWithData,
  ValidSessionResult,
} from "@imtbl/auth-next-server";
```

## Related Packages

- [`@imtbl/auth-next-client`](../auth-next-client) - Client-side components and hooks
- [`@imtbl/auth`](../auth) - Core authentication library

## License

Apache-2.0
