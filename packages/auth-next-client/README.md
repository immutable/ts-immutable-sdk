# @imtbl/auth-next-client

Client-side React components and hooks for Immutable authentication with Auth.js v5 (NextAuth) in Next.js applications.

## Overview

This package provides minimal client-side utilities for Next.js applications using Immutable authentication. It's designed to work with Next.js's native `SessionProvider` and integrates seamlessly with NextAuth.

**Key features:**

- `useLogin` - Hook for login flows with state management (loading, error)
- `useLogout` - Hook for logout with federated logout support (clears both local and upstream sessions)
- `useImmutableSession` - Hook that provides session state, `getAccessToken()` for guaranteed-fresh tokens, and `getUser` for wallet integration
- `CallbackPage` - OAuth callback handler component

For server-side utilities, use [`@imtbl/auth-next-server`](../auth-next-server).

## Installation

```bash
npm install @imtbl/auth-next-client @imtbl/auth-next-server next-auth@5
```

### Peer Dependencies

- `react` >= 18.0.0
- `next` >= 14.0.0
- `next-auth` >= 5.0.0-beta.25

## Quick Start

### 1. Set Up Server-Side Auth

First, set up the server-side authentication following the [`@imtbl/auth-next-server` documentation](../auth-next-server).

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

### 2. Create Providers Component

Use `SessionProvider` from `next-auth/react` directly:

```tsx
// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
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

### 5. Add Login Button

Use the `useLogin` hook for login flows with built-in state management:

```tsx
// components/LoginButton.tsx
"use client";

import { useLogin, useImmutableSession } from "@imtbl/auth-next-client";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};

export function LoginButton() {
  const { isAuthenticated } = useImmutableSession();
  const { loginWithPopup, isLoggingIn, error } = useLogin();

  if (isAuthenticated) {
    return <p>You are logged in!</p>;
  }

  return (
    <div>
      <button onClick={() => loginWithPopup(config)} disabled={isLoggingIn}>
        {isLoggingIn ? "Signing in..." : "Sign In with Immutable"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
```

### 6. Add Logout Button

Use the `useLogout` hook for logout with federated logout support. This ensures that when users log in again, they'll be prompted to select an account instead of automatically logging in with the previous account:

```tsx
// components/LogoutButton.tsx
"use client";

import { useLogout, useImmutableSession } from "@imtbl/auth-next-client";

const logoutConfig = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  logoutRedirectUri: process.env.NEXT_PUBLIC_BASE_URL!, // Where to redirect after logout
};

export function LogoutButton() {
  const { isAuthenticated } = useImmutableSession();
  const { logout, isLoggingOut, error } = useLogout();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <button onClick={() => logout(logoutConfig)} disabled={isLoggingOut}>
        {isLoggingOut ? "Signing out..." : "Sign Out"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
```

### 7. Connect Wallet with getUser

Use `useImmutableSession` for wallet integration:

```tsx
// components/WalletConnect.tsx
"use client";

import { useImmutableSession } from "@imtbl/auth-next-client";
import { connectWallet } from "@imtbl/wallet";

export function WalletConnect() {
  const { isAuthenticated, getUser } = useImmutableSession();

  const handleConnect = async () => {
    // Pass getUser directly to wallet - it returns fresh tokens from session
    const provider = await connectWallet({ getUser });

    // Use the provider for blockchain interactions
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    console.log("Connected:", accounts);
  };

  if (!isAuthenticated) {
    return <p>Please log in first</p>;
  }

  return <button onClick={handleConnect}>Connect Wallet</button>;
}
```

## Components

### `CallbackPage`

Handles the OAuth callback after Immutable authentication. This component processes the authorization code from the URL and establishes the session.

```tsx
// app/callback/page.tsx
"use client";

import { CallbackPage } from "@imtbl/auth-next-client";

export default function Callback() {
  return (
    <CallbackPage
      config={{
        clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
        redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
      }}
      redirectTo="/dashboard"
      onSuccess={(user) => {
        console.log("User logged in:", user.sub);
      }}
      onError={(error) => {
        console.error("Login failed:", error);
      }}
    />
  );
}
```

#### Props

| Prop                 | Type                              | Required | Description                                       |
| -------------------- | --------------------------------- | -------- | ------------------------------------------------- |
| `config`             | `CallbackConfig`                  | Yes      | Authentication configuration                      |
| `config.clientId`    | `string`                          | Yes      | Immutable application client ID                   |
| `config.redirectUri` | `string`                          | Yes      | OAuth redirect URI                                |
| `redirectTo`         | `string \| ((user) => string)`    | No       | Redirect destination after login (default: `"/"`) |
| `loadingComponent`   | `ReactElement`                    | No       | Custom loading component                          |
| `errorComponent`     | `(error: string) => ReactElement` | No       | Custom error component                            |
| `onSuccess`          | `(user) => void \| Promise<void>` | No       | Success callback (runs before redirect)           |
| `onError`            | `(error: string) => void`         | No       | Error callback                                    |

## Hooks

### `useLogin()`

A hook for handling login flows with built-in state management. Provides login functions that automatically sign in to NextAuth after successful OAuth authentication.

```tsx
"use client";

import { useLogin, useImmutableSession } from "@imtbl/auth-next-client";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
  popupRedirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`, // Optional: separate URI for popups
};

function LoginComponent() {
  const { isAuthenticated } = useImmutableSession();
  const {
    loginWithPopup,
    loginWithEmbedded,
    loginWithRedirect,
    isLoggingIn,
    error,
  } = useLogin();

  if (isAuthenticated) {
    return <p>You are logged in!</p>;
  }

  return (
    <div>
      <button onClick={() => loginWithPopup(config)} disabled={isLoggingIn}>
        Sign In with Popup
      </button>
      <button onClick={() => loginWithEmbedded(config)} disabled={isLoggingIn}>
        Sign In with Embedded
      </button>
      <button onClick={() => loginWithRedirect(config)} disabled={isLoggingIn}>
        Sign In with Redirect
      </button>
      {isLoggingIn && <p>Signing in...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
```

#### Return Value

| Property            | Type                                  | Description                                      |
| ------------------- | ------------------------------------- | ------------------------------------------------ |
| `loginWithPopup`    | `(config, options?) => Promise<void>` | Opens popup for OAuth, then signs in to NextAuth |
| `loginWithEmbedded` | `(config) => Promise<void>`           | Shows embedded modal, then popup for OAuth       |
| `loginWithRedirect` | `(config, options?) => Promise<void>` | Redirects to OAuth provider                      |
| `isLoggingIn`       | `boolean`                             | Whether a login is in progress                   |
| `error`             | `string \| null`                      | Error message from last login attempt            |

#### Login Methods

- **`loginWithPopup(config, options?)`** - Opens a popup window for authentication. Best for single-page apps where you don't want to navigate away.

- **`loginWithEmbedded(config)`** - Shows an embedded modal for login method selection (email, Google, etc.), then opens a popup. Provides a smoother UX.

- **`loginWithRedirect(config, options?)`** - Redirects the entire page to the OAuth provider. Use `CallbackPage` to handle the callback. Best for traditional web apps.

#### Direct Login Options

You can pass `options` to specify a direct login method:

```tsx
import { MarketingConsentStatus } from "@imtbl/auth-next-client";

// Direct to Google login
await loginWithPopup(config, {
  directLoginOptions: {
    directLoginMethod: "google",
  },
});

// Direct to email login with marketing consent
await loginWithPopup(config, {
  directLoginOptions: {
    directLoginMethod: "email",
    email: "user@example.com",
    marketingConsentStatus: MarketingConsentStatus.OPTED_IN,
  },
});
```

### `useLogout()`

A hook for handling logout with federated logout support. This ensures that when users log out:

1. The local NextAuth session (JWT cookie) is cleared
2. The upstream Immutable/Auth0 session is cleared by redirecting to the logout endpoint

This is important for social logins (like Google) - without federated logout, users would be automatically logged in with the same account on their next login attempt.

```tsx
"use client";

import { useLogout, useImmutableSession } from "@imtbl/auth-next-client";

const logoutConfig = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  logoutRedirectUri: process.env.NEXT_PUBLIC_BASE_URL!,
  // Optional: specify auth domain for non-production environments
  // authenticationDomain: "https://auth.dev.immutable.com",
};

function LogoutComponent() {
  const { isAuthenticated } = useImmutableSession();
  const { logout, isLoggingOut, error } = useLogout();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <button onClick={() => logout(logoutConfig)} disabled={isLoggingOut}>
        {isLoggingOut ? "Signing out..." : "Sign Out"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
```

#### Return Value

| Property       | Type                                      | Description                             |
| -------------- | ----------------------------------------- | --------------------------------------- |
| `logout`       | `(config: LogoutConfig) => Promise<void>` | Performs federated logout and redirects |
| `isLoggingOut` | `boolean`                                 | Whether logout is in progress           |
| `error`        | `string \| null`                          | Error message from last logout attempt  |

#### Why Federated Logout?

When using social login providers like Google, the auth server (Auth0/Immutable) maintains its own session. If you only clear the local NextAuth session:

1. User logs in with Google Account A
2. User logs out (only local session cleared)
3. User clicks "Login with Google" again
4. Auth server still has the Google session cached → auto-logs in with Account A

With federated logout, the auth server's session is also cleared, so users can select a different account on their next login.

### `useImmutableSession()`

A convenience hook that wraps `next-auth/react`'s `useSession` with:

- `getAccessToken()` -- async function that returns a **guaranteed-fresh** access token
- `getUser()` -- function for wallet integration
- Automatic token refresh -- detects expired tokens and refreshes on demand

```tsx
"use client";

import { useImmutableSession } from "@imtbl/auth-next-client";

function MyComponent() {
  const {
    session, // Session metadata (user info, zkEvm, error) -- does NOT include accessToken
    status, // 'loading' | 'authenticated' | 'unauthenticated'
    isLoading, // True during initial load
    isAuthenticated, // True when logged in
    isRefreshing, // True during token refresh
    getAccessToken, // Async function: returns a guaranteed-fresh access token
    getUser, // Function for wallet integration
  } = useImmutableSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {session?.user?.email}</div>;
}
```

#### Return Value

| Property          | Type                                                | Description                                                                             |
| ----------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `session`         | `ImmutableSession \| null`                          | Session metadata (user, zkEvm, error). Does **not** include `accessToken` -- see below. |
| `status`          | `string`                                            | Auth status: `'loading'`, `'authenticated'`, `'unauthenticated'`                        |
| `isLoading`       | `boolean`                                           | Whether initial auth state is loading                                                   |
| `isAuthenticated` | `boolean`                                           | Whether user is authenticated                                                           |
| `isRefreshing`    | `boolean`                                           | Whether a token refresh is in progress                                                  |
| `getAccessToken`  | `() => Promise<string>`                             | Get a guaranteed-fresh access token. Throws if not authenticated or refresh fails.      |
| `getUser`         | `(forceRefresh?: boolean) => Promise<User \| null>` | Get user function for wallet integration                                                |

#### Why no `accessToken` on `session`?

The `session` object intentionally does **not** expose `accessToken`. This is a deliberate design choice to prevent consumers from accidentally using a stale/expired token.

**Always use `getAccessToken()`** to obtain a token for authenticated requests:

```tsx
// ✅ Correct - always fresh
const token = await getAccessToken();
await authenticatedGet("/api/data", token);

// ❌ Incorrect - session.accessToken does not exist on the type
const token = session?.accessToken; // TypeScript error
```

`getAccessToken()` guarantees freshness:

- **Fast path**: If the current token is valid, returns immediately (no network call).
- **Slow path**: If the token is expired, triggers a server-side refresh and **blocks** (awaits) until the fresh token is available.
- **Deduplication**: Multiple concurrent calls share a single refresh request.

#### Checking Authentication Status

**Always use `isAuthenticated` to determine if a user is logged in.** Do not use the `session` object or `status` field directly for this purpose.

**Why not `!!session`?**

A `session` object can exist but be **unusable**. For example, the session may be present but the access token is missing, or a token refresh may have failed (indicated by `session.error === "RefreshTokenError"`). Checking `!!session` would incorrectly treat these broken sessions as authenticated.

**Why not `status === 'authenticated'`?**

The `status` field comes directly from NextAuth's `useSession` and only reflects whether NextAuth considers the session valid at the cookie/JWT level. It does **not** account for whether the access token is actually present or whether a token refresh has failed. A session can have `status === 'authenticated'` while `session.error` is set to `"RefreshTokenError"`, meaning the tokens are no longer usable.

**What `isAuthenticated` checks:**

The `isAuthenticated` boolean validates all of the following:

1. NextAuth reports `'authenticated'` status
2. The session object exists
3. A valid access token is present in the session
4. No session-level error exists (e.g., `RefreshTokenError`)

It also handles transient states gracefully — during session refetches (e.g., window focus) or manual refreshes (e.g., after wallet registration via `getUser(true)`), `isAuthenticated` remains `true` if the user was previously authenticated, preventing UI flicker.

```tsx
// ✅ Correct - uses isAuthenticated
const { isAuthenticated } = useImmutableSession();
if (!isAuthenticated) return <div>Please log in</div>;

// ❌ Incorrect - session can exist with expired/invalid tokens
const { session } = useImmutableSession();
if (!session) return <div>Please log in</div>;

// ❌ Incorrect - status doesn't account for token errors
const { status } = useImmutableSession();
if (status !== "authenticated") return <div>Please log in</div>;
```

#### Using `getAccessToken()` in Practice

**SWR fetcher:**

```tsx
import useSWR from "swr";
import { useImmutableSession } from "@imtbl/auth-next-client";

function useProfile() {
  const { getAccessToken, isAuthenticated } = useImmutableSession();

  return useSWR(
    isAuthenticated ? "/passport-profile/v1/profile" : null,
    async (path) => {
      const token = await getAccessToken(); // blocks until fresh
      return authenticatedGet(path, token);
    },
  );
}
```

**Event handler:**

```tsx
import { useImmutableSession } from "@imtbl/auth-next-client";

function ClaimRewardButton({ questId }: { questId: string }) {
  const { getAccessToken } = useImmutableSession();

  const handleClaim = async () => {
    const token = await getAccessToken(); // blocks until fresh
    await authenticatedPost("/v1/quests/claim", token, { questId });
  };

  return <button onClick={handleClaim}>Claim</button>;
}
```

**Periodic polling:**

```tsx
import useSWR from "swr";
import { useImmutableSession } from "@imtbl/auth-next-client";

function ActivityFeed() {
  const { getAccessToken, isAuthenticated } = useImmutableSession();

  return useSWR(
    isAuthenticated ? "/v1/activities" : null,
    async (path) => {
      const token = await getAccessToken();
      return authenticatedGet(path, token);
    },
    { refreshInterval: 10000 }, // polls every 10s, always gets a fresh token
  );
}
```

#### The `getUser` Function

The `getUser` function returns fresh tokens from the session. It accepts an optional `forceRefresh` parameter:

```tsx
// Normal usage - returns current session data
const user = await getUser();

// Force refresh - triggers server-side token refresh to get updated claims
// Use this after operations that update user data (e.g., zkEVM registration)
const freshUser = await getUser(true);
```

When `forceRefresh` is `true`:

1. Triggers the NextAuth `jwt` callback with `trigger='update'`
2. Server performs a token refresh with the identity provider
3. Updated claims (like `zkEvm` data after registration) are extracted from the new ID token
4. Returns the refreshed user data

## Types

### ImmutableSession

The session type returned by `useImmutableSession`. Note that `accessToken` is intentionally **not** included -- use `getAccessToken()` instead to obtain a guaranteed-fresh token.

```typescript
interface ImmutableSession {
  // accessToken is NOT exposed -- use getAccessToken() instead
  refreshToken?: string;
  idToken?: string;
  accessTokenExpires: number;
  zkEvm?: {
    ethAddress: string;
    userAdminAddress: string;
  };
  error?: string;
  user: {
    sub: string;
    email?: string;
    nickname?: string;
  };
}
```

### LoginConfig

Configuration for the `useLogin` hook's login functions:

```typescript
interface LoginConfig {
  /** Your Immutable application client ID */
  clientId: string;
  /** The OAuth redirect URI for your application */
  redirectUri: string;
  /** Optional separate redirect URI for popup flows */
  popupRedirectUri?: string;
  /** OAuth audience (default: "platform_api") */
  audience?: string;
  /** OAuth scopes (default: "openid profile email offline_access transact") */
  scope?: string;
  /** Authentication domain (default: "https://auth.immutable.com") */
  authenticationDomain?: string;
}
```

### StandaloneLoginOptions

Options for `loginWithPopup` and `loginWithRedirect`:

```typescript
interface StandaloneLoginOptions {
  directLoginOptions?: DirectLoginOptions;
}

interface DirectLoginOptions {
  directLoginMethod: "google" | "apple" | "email";
  email?: string; // Required when directLoginMethod is "email"
  marketingConsentStatus?: MarketingConsentStatus;
}
```

### LogoutConfig

Configuration for the `useLogout` hook:

```typescript
interface LogoutConfig {
  /** Your Immutable application client ID */
  clientId: string;
  /** URL to redirect to after logout completes (must be registered in your app settings) */
  logoutRedirectUri?: string;
  /** Authentication domain (default: "https://auth.immutable.com") */
  authenticationDomain?: string;
}
```

**Note:** The `logoutRedirectUri` must be registered as an allowed logout URL in your Immutable Hub application settings.

## Error Handling

The session may contain an `error` field indicating authentication issues:

| Error                 | Description           | Handling                                     |
| --------------------- | --------------------- | -------------------------------------------- |
| `"TokenExpired"`      | Access token expired  | Proactive refresh handles this automatically |
| `"RefreshTokenError"` | Refresh token invalid | Prompt user to sign in again                 |

`getAccessToken()` throws an error if the token cannot be obtained (e.g., refresh failure). Handle it with try/catch:

```tsx
import { useImmutableSession } from "@imtbl/auth-next-client";
import { signOut } from "next-auth/react";

function ProtectedContent() {
  const { session, isAuthenticated, getAccessToken } = useImmutableSession();

  if (session?.error === "RefreshTokenError") {
    return (
      <div>
        <p>Your session has expired. Please sign in again.</p>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <p>Please sign in to continue.</p>
      </div>
    );
  }

  const handleFetch = async () => {
    try {
      const token = await getAccessToken();
      // Use token for authenticated requests
    } catch (error) {
      // Token refresh failed -- session may be expired
      console.error("Failed to get access token:", error);
    }
  };

  return <div>Protected content here</div>;
}
```

## Related Packages

- [`@imtbl/auth-next-server`](../auth-next-server) - Server-side authentication utilities
- [`@imtbl/auth`](../auth) - Core authentication library with standalone login functions
- [`@imtbl/wallet`](../wallet) - Wallet connection with `getUser` support

## License

Apache-2.0
