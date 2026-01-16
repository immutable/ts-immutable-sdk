# @imtbl/auth-next-client

Client-side React components and hooks for Immutable authentication with Auth.js v5 (NextAuth) in Next.js applications.

## Overview

This package provides React components and hooks for client-side authentication in Next.js applications using the App Router. It works in conjunction with `@imtbl/auth-next-server` to provide a complete authentication solution.

**Key features:**
- `ImmutableAuthProvider` - Authentication context provider
- `useImmutableAuth` - Hook for auth state and methods
- `CallbackPage` - OAuth callback handler component
- `useHydratedData` - SSR data hydration with client-side fallback
- Automatic token refresh and session synchronization

For server-side utilities, use [`@imtbl/auth-next-server`](../auth-next-server).

## Installation

```bash
npm install @imtbl/auth-next-client @imtbl/auth-next-server next-auth@5
# or
pnpm add @imtbl/auth-next-client @imtbl/auth-next-server next-auth@5
# or
yarn add @imtbl/auth-next-client @imtbl/auth-next-server next-auth@5
```

### Peer Dependencies

- `react` >= 18.0.0
- `next` >= 14.0.0
- `next-auth` >= 5.0.0-beta.25

## Quick Start

### 1. Set Up Server-Side Auth

First, set up the server-side authentication following the [`@imtbl/auth-next-server` documentation](../auth-next-server).

### 2. Create Providers Component

```tsx
// app/providers.tsx
"use client";

import { ImmutableAuthProvider } from "@imtbl/auth-next-client";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ImmutableAuthProvider config={config}>
      {children}
    </ImmutableAuthProvider>
  );
}
```

### 3. Wrap Your App

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 4. Create Callback Page

```tsx
// app/callback/page.tsx
"use client";

import { CallbackPage } from "@imtbl/auth-next-client";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};

export default function Callback() {
  return <CallbackPage config={config} redirectTo="/dashboard" />;
}
```

### 5. Use Authentication in Components

```tsx
// components/AuthButton.tsx
"use client";

import { useImmutableAuth } from "@imtbl/auth-next-client";

export function AuthButton() {
  const { user, isLoading, isLoggingIn, isAuthenticated, signIn, signOut } = useImmutableAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        <span>Welcome, {user?.email || user?.sub}</span>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  return (
    <button onClick={() => signIn()} disabled={isLoggingIn}>
      {isLoggingIn ? "Signing in..." : "Sign In"}
    </button>
  );
}
```

## Components

### `ImmutableAuthProvider`

**Use case:** Wraps your application to provide authentication context. Required for all `useImmutableAuth` and related hooks to work.

**When to use:**
- Required: Must wrap your app at the root level (typically in `app/layout.tsx` or a providers file)
- Provides auth state to all child components via React Context

```tsx
// app/providers.tsx
// Use case: Basic provider setup
"use client";

import { ImmutableAuthProvider } from "@imtbl/auth-next-client";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ImmutableAuthProvider config={config}>
      {children}
    </ImmutableAuthProvider>
  );
}
```

#### With SSR Session Hydration

Pass the server-side session to avoid a flash of unauthenticated state on page load:

```tsx
// app/providers.tsx
// Use case: SSR hydration to prevent auth state flash
"use client";

import { ImmutableAuthProvider } from "@imtbl/auth-next-client";
import type { Session } from "next-auth";

export function Providers({ 
  children, 
  session  // Passed from Server Component
}: { 
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <ImmutableAuthProvider config={config} session={session}>
      {children}
    </ImmutableAuthProvider>
  );
}
```

```tsx
// app/layout.tsx
// Use case: Get session server-side and pass to providers
import { auth } from "@/lib/auth";
import { Providers } from "./providers";

export default async function RootLayout({ children }) {
  const session = await auth();
  return (
    <html>
      <body>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
```

#### With Custom Base Path

Use when you have a non-standard Auth.js API route path:

```tsx
// Use case: Custom API route path (e.g., per-environment routes)
<ImmutableAuthProvider 
  config={config} 
  basePath="/api/auth/sandbox"  // Instead of default "/api/auth"
>
  {children}
</ImmutableAuthProvider>
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `object` | Yes | Authentication configuration |
| `config.clientId` | `string` | Yes | Immutable application client ID |
| `config.redirectUri` | `string` | Yes | OAuth redirect URI (must match Immutable Hub config) |
| `config.popupRedirectUri` | `string` | No | Separate redirect URI for popup login flows |
| `config.logoutRedirectUri` | `string` | No | Where to redirect after logout |
| `config.audience` | `string` | No | OAuth audience (default: `"platform_api"`) |
| `config.scope` | `string` | No | OAuth scopes (default includes `transact` for blockchain) |
| `config.authenticationDomain` | `string` | No | Immutable auth domain URL |
| `config.passportDomain` | `string` | No | Immutable Passport domain URL |
| `session` | `Session` | No | Server-side session for SSR hydration (prevents auth flash) |
| `basePath` | `string` | No | Auth.js API base path (default: `"/api/auth"`) |

### `CallbackPage`

**Use case:** Handles the OAuth callback after Immutable authentication. This component processes the authorization code from the URL and establishes the session.

**When to use:**
- Required for redirect-based login flows (when user is redirected to Immutable login page)
- Create a page at your `redirectUri` path (e.g., `/callback`)

**How it works:**
1. User clicks "Sign In" → redirected to Immutable login
2. After login, Immutable redirects to your callback URL with auth code
3. `CallbackPage` exchanges the code for tokens and creates the session
4. User is redirected to your app (e.g., `/dashboard`)

```tsx
// app/callback/page.tsx
// Use case: Basic callback page that redirects to dashboard after login
"use client";

import { CallbackPage } from "@imtbl/auth-next-client";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};

export default function Callback() {
  return <CallbackPage config={config} redirectTo="/dashboard" />;
}
```

#### Dynamic Redirect Based on User

```tsx
// app/callback/page.tsx
// Use case: Redirect new users to onboarding, existing users to dashboard
"use client";

import { CallbackPage } from "@imtbl/auth-next-client";

export default function Callback() {
  return (
    <CallbackPage
      config={config}
      redirectTo={(user) => {
        // Redirect based on user properties
        return user.email ? "/dashboard" : "/onboarding";
      }}
      onSuccess={async (user) => {
        // Track successful login
        await analytics.track("user_logged_in", { userId: user.sub });
      }}
      onError={(error) => {
        // Log authentication failures
        console.error("Login failed:", error);
      }}
    />
  );
}
```

#### Custom Loading and Error UI

```tsx
// app/callback/page.tsx
// Use case: Branded callback page with custom loading and error states
"use client";

import { CallbackPage } from "@imtbl/auth-next-client";
import { Spinner, ErrorCard } from "@/components/ui";

export default function Callback() {
  return (
    <CallbackPage
      config={config}
      redirectTo="/dashboard"
      loadingComponent={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Completing sign in...</p>
        </div>
      }
      errorComponent={(error) => (
        <div className="flex items-center justify-center min-h-screen">
          <ErrorCard
            title="Authentication Failed"
            message={error}
            action={{ label: "Try Again", href: "/login" }}
          />
        </div>
      )}
    />
  );
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `object` | Yes | Authentication configuration (same as provider) |
| `redirectTo` | `string \| ((user) => string)` | No | Redirect destination after login (default: `"/"`) |
| `loadingComponent` | `ReactElement` | No | Custom loading component |
| `errorComponent` | `(error: string) => ReactElement` | No | Custom error component |
| `onSuccess` | `(user) => void \| Promise<void>` | No | Success callback (runs before redirect) |
| `onError` | `(error: string) => void` | No | Error callback (runs before error UI shows) |

## Hooks

This package provides hooks for different authentication needs:

| Hook | Use Case |
|------|----------|
| `useImmutableAuth` | Full auth state and methods (sign in, sign out, get tokens) |
| `useAccessToken` | Just need to make authenticated API calls |
| `useHydratedData` | Display SSR-fetched data with client-side fallback |

### `useImmutableAuth()`

**Use case:** The main hook for authentication. Use this when you need to check auth state, trigger sign in/out, or make authenticated API calls.

**When to use:**
- Login/logout buttons
- Displaying user information
- Conditionally rendering content based on auth state
- Making authenticated API calls from client components

```tsx
// components/Header.tsx
// Use case: Navigation header with login/logout and user info
"use client";

import { useImmutableAuth } from "@imtbl/auth-next-client";

export function Header() {
  const {
    user,           // User profile (sub, email, nickname)
    isLoading,      // True during initial session fetch
    isLoggingIn,    // True while popup is open
    isAuthenticated,// True when user is logged in
    signIn,         // Opens login popup
    signOut,        // Signs out from both Auth.js and Immutable
    getAccessToken, // Returns valid token (refreshes if needed)
  } = useImmutableAuth();

  if (isLoading) {
    return <HeaderSkeleton />;
  }

  if (isAuthenticated) {
    return (
      <header>
        <span>Welcome, {user?.email || user?.sub}</span>
        <button onClick={() => signOut()}>Sign Out</button>
      </header>
    );
  }

  return (
    <header>
      <button onClick={() => signIn()} disabled={isLoggingIn}>
        {isLoggingIn ? "Signing in..." : "Sign In with Immutable"}
      </button>
    </header>
  );
}
```

#### Making Authenticated API Calls

```tsx
// components/InventoryButton.tsx
// Use case: Fetch user data from your API using the access token
"use client";

import { useImmutableAuth } from "@imtbl/auth-next-client";
import { useState } from "react";

export function InventoryButton() {
  const { getAccessToken, isAuthenticated } = useImmutableAuth();
  const [inventory, setInventory] = useState(null);

  const fetchInventory = async () => {
    // getAccessToken() automatically refreshes expired tokens
    const token = await getAccessToken();
    const response = await fetch("/api/user/inventory", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setInventory(await response.json());
  };

  if (!isAuthenticated) return null;

  return (
    <button onClick={fetchInventory}>
      Load My Inventory
    </button>
  );
}
```

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `user` | `ImmutableUserClient \| null` | Current user profile |
| `session` | `Session \| null` | Full Auth.js session with tokens |
| `isLoading` | `boolean` | Whether initial auth state is loading |
| `isLoggingIn` | `boolean` | Whether a login flow is in progress |
| `isAuthenticated` | `boolean` | Whether user is authenticated |
| `signIn` | `(options?) => Promise<void>` | Start sign-in flow (opens popup) |
| `signOut` | `() => Promise<void>` | Sign out from both Auth.js and Immutable |
| `getAccessToken` | `() => Promise<string>` | Get valid access token (refreshes if needed) |
| `auth` | `Auth \| null` | Underlying `@imtbl/auth` instance for advanced use |

#### Sign-In Options

```tsx
signIn({
  useCachedSession: true,    // Try to use cached session first
  // Additional options from @imtbl/auth LoginOptions
});
```

### `useAccessToken()`

**Use case:** A simpler hook when you only need to make authenticated API calls and don't need the full auth state.

**When to use:**
- Components that only make API calls (no login UI)
- When you want to keep the component focused on its domain logic
- Utility hooks or functions that need to fetch authenticated data

```tsx
// hooks/useUserAssets.ts
// Use case: Custom hook that fetches user's NFT assets
"use client";

import { useAccessToken } from "@imtbl/auth-next-client";
import { useState, useEffect } from "react";

export function useUserAssets() {
  const getAccessToken = useAccessToken();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const token = await getAccessToken();
        const response = await fetch("/api/assets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssets(await response.json());
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, [getAccessToken]);

  return { assets, loading };
}
```

### `useHydratedData(props, fetcher)`

**Use case:** Display data that was fetched server-side (SSR), with automatic client-side fallback when SSR was skipped (e.g., token was expired).

**When to use:**
- Client Components that receive data from `getAuthenticatedData` (server-side)
- Pages that benefit from SSR but need client fallback for token refresh
- When you want seamless SSR → CSR transitions without flash of loading states

**When NOT to use:**
- Components that only fetch client-side (use `useImmutableAuth().getAccessToken()` instead)
- Components that don't receive server-fetched props

**How it works:**
1. Server uses `getAuthenticatedData` to fetch data (if token valid) or skip (if expired)
2. Server passes result (`{ data, ssr, session }`) to Client Component
3. Client uses `useHydratedData` to either use SSR data immediately OR fetch client-side

```tsx
// app/profile/page.tsx (Server Component)
// Use case: Profile page with SSR data fetching
import { auth } from "@/lib/auth";
import { getAuthenticatedData } from "@imtbl/auth-next-server";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  // Server fetches data if token is valid, skips if expired
  const result = await getAuthenticatedData(auth, async (token) => {
    return fetchProfile(token);
  });
  
  // Pass the result to the Client Component
  return <ProfileClient {...result} />;
}
```

```tsx
// app/profile/ProfileClient.tsx (Client Component)
// Use case: Display profile with SSR data or client-side fallback
"use client";

import { useHydratedData, type AuthPropsWithData } from "@imtbl/auth-next-client";

interface Profile {
  name: string;
  email: string;
  avatarUrl: string;
}

export function ProfileClient(props: AuthPropsWithData<Profile>) {
  // useHydratedData handles both cases:
  // - If ssr=true: uses data immediately (no loading state)
  // - If ssr=false: refreshes token and fetches client-side
  const { data, isLoading, error, refetch } = useHydratedData(
    props,
    async (token) => fetchProfile(token)  // Same fetcher as server
  );

  // Only shows loading state when client-side fetch is happening
  if (isLoading) return <ProfileSkeleton />;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No profile found</div>;

  return (
    <div>
      <img src={data.avatarUrl} alt={data.name} />
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

#### The SSR/CSR Flow Explained

| Scenario | Server | Client | User Experience |
|----------|--------|--------|-----------------|
| Token valid | Fetches data, `ssr: true` | Uses data immediately | Instant content (SSR) |
| Token expired | Skips fetch, `ssr: false` | Refreshes token, fetches | Brief loading, then content |
| Server fetch fails | Returns `fetchError` | Retries automatically | Brief loading, then content |

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `data` | `T \| null` | The fetched data |
| `isLoading` | `boolean` | Whether data is being fetched |
| `error` | `Error \| null` | Fetch error if any |
| `refetch` | `() => Promise<void>` | Function to refetch data |

## Choosing the Right Data Fetching Pattern

| Pattern | Server Fetches | When to Use |
|---------|---------------|-------------|
| `getAuthProps` + `getAccessToken()` | No | Client-only fetching (infinite scroll, real-time, full control) |
| `getAuthenticatedData` + `useHydratedData` | Yes | SSR with client fallback (best performance + reliability) |
| Client-only with `getAccessToken()` | No | Simple components, non-critical data |

### Decision Guide

**Use SSR pattern (`getAuthenticatedData` + `useHydratedData`) when:**
- Page benefits from fast initial load (user profile, settings, inventory)
- SEO matters (public profile pages with auth-dependent content)
- You want the best user experience (no loading flash for authenticated users)

**Use client-only pattern (`getAccessToken()`) when:**
- Data changes frequently (real-time updates, notifications)
- Infinite scroll or pagination
- Non-critical secondary data (recommendations, suggestions)
- Simple components where SSR complexity isn't worth it

## Types

### User Types

```typescript
interface ImmutableUserClient {
  sub: string;        // Immutable user ID
  email?: string;
  nickname?: string;
}

interface ZkEvmInfo {
  ethAddress: string;
  userAdminAddress: string;
}
```

### Props Types

```typescript
// From server for passing to client components
interface AuthProps {
  session: Session | null;
  ssr: boolean;
  authError?: string;
}

interface AuthPropsWithData<T> extends AuthProps {
  data: T | null;
  fetchError?: string;
}
```

### Re-exported Types

For convenience, common types are re-exported from `@imtbl/auth-next-server`:

```typescript
import type {
  ImmutableAuthConfig,
  ImmutableTokenData,
  ImmutableUser,
  AuthProps,
  AuthPropsWithData,
  ProtectedAuthProps,
  ProtectedAuthPropsWithData,
} from "@imtbl/auth-next-client";
```

## Advanced Usage

### Multiple Environments

Support multiple Immutable environments (dev, sandbox, production):

```tsx
// lib/auth-config.ts
export function getAuthConfig(env: "dev" | "sandbox" | "production") {
  const configs = {
    dev: {
      clientId: "dev-client-id",
      authenticationDomain: "https://auth.dev.immutable.com",
    },
    sandbox: {
      clientId: "sandbox-client-id",
      authenticationDomain: "https://auth.immutable.com",
    },
    production: {
      clientId: "prod-client-id",
      authenticationDomain: "https://auth.immutable.com",
    },
  };
  
  return {
    ...configs[env],
    redirectUri: `${window.location.origin}/callback`,
  };
}
```

```tsx
// app/providers.tsx
"use client";

import { ImmutableAuthProvider } from "@imtbl/auth-next-client";
import { getAuthConfig } from "@/lib/auth-config";

export function Providers({ children, environment }: { 
  children: React.ReactNode;
  environment: "dev" | "sandbox" | "production";
}) {
  const config = getAuthConfig(environment);
  const basePath = `/api/auth/${environment}`;
  
  return (
    <ImmutableAuthProvider config={config} basePath={basePath}>
      {children}
    </ImmutableAuthProvider>
  );
}
```

### Accessing the Auth Instance

For advanced use cases, you can access the underlying `@imtbl/auth` instance:

```tsx
import { useImmutableAuth } from "@imtbl/auth-next-client";

function AdvancedComponent() {
  const { auth } = useImmutableAuth();

  const handleAdvanced = async () => {
    if (auth) {
      // Direct access to @imtbl/auth methods
      const user = await auth.getUser();
      const idToken = await auth.getIdToken();
    }
  };
}
```

### Token Refresh Events

The provider automatically handles token refresh events and syncs them to the Auth.js session. You can observe these by watching the session:

```tsx
import { useImmutableAuth } from "@imtbl/auth-next-client";

function TokenMonitor() {
  const { session } = useImmutableAuth();

  useEffect(() => {
    if (session?.accessToken) {
      console.log("Token updated:", session.accessTokenExpires);
    }
  }, [session?.accessToken]);
}
```

## Error Handling

The `session.error` field indicates authentication issues:

| Error | Description | Handling |
|-------|-------------|----------|
| `"TokenExpired"` | Access token expired | `getAccessToken()` will auto-refresh |
| `"RefreshTokenError"` | Refresh token invalid | Prompt user to sign in again |

```tsx
import { useImmutableAuth } from "@imtbl/auth-next-client";

function ProtectedContent() {
  const { session, signIn, isAuthenticated } = useImmutableAuth();

  if (session?.error === "RefreshTokenError") {
    return (
      <div>
        <p>Your session has expired. Please sign in again.</p>
        <button onClick={() => signIn()}>Sign In</button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div>Please sign in to continue.</div>;
  }

  return <div>Protected content here</div>;
}
```

## Related Packages

- [`@imtbl/auth-next-server`](../auth-next-server) - Server-side authentication utilities
- [`@imtbl/auth`](../auth) - Core authentication library

## License

Apache-2.0
