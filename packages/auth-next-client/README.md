# @imtbl/auth-next-client

Client-side React components and hooks for Immutable authentication with Auth.js v5 (NextAuth) in Next.js applications.

## Overview

This package provides minimal client-side utilities for Next.js applications using Immutable authentication. It's designed to work with Next.js's native `SessionProvider` and the standalone login functions from `@imtbl/auth`.

**Key features:**
- `CallbackPage` - OAuth callback handler component
- `useImmutableSession` - Hook that provides a `getUser` function for wallet integration
- Re-exports standalone login functions from `@imtbl/auth`

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

export const { handlers, auth, signIn, signOut } = NextAuth(createAuthConfig({
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
}));
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

Use the standalone login functions from `@imtbl/auth`:

```tsx
// components/LoginButton.tsx
"use client";

import { loginWithPopup } from "@imtbl/auth-next-client";
import { signIn } from "next-auth/react";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${window.location.origin}/callback`,
};

export function LoginButton() {
  const handleLogin = async () => {
    // Open popup login
    const tokens = await loginWithPopup(config);
    
    // Sign in to NextAuth with the tokens
    await signIn("immutable", {
      tokens: JSON.stringify(tokens),
      redirect: false,
    });
  };

  return <button onClick={handleLogin}>Sign In with Immutable</button>;
}
```

### 6. Connect Wallet with getUser

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

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `CallbackConfig` | Yes | Authentication configuration |
| `config.clientId` | `string` | Yes | Immutable application client ID |
| `config.redirectUri` | `string` | Yes | OAuth redirect URI |
| `redirectTo` | `string \| ((user) => string)` | No | Redirect destination after login (default: `"/"`) |
| `loadingComponent` | `ReactElement` | No | Custom loading component |
| `errorComponent` | `(error: string) => ReactElement` | No | Custom error component |
| `onSuccess` | `(user) => void \| Promise<void>` | No | Success callback (runs before redirect) |
| `onError` | `(error: string) => void` | No | Error callback |

## Hooks

### `useImmutableSession()`

A convenience hook that wraps `next-auth/react`'s `useSession` with a `getUser` function for wallet integration.

```tsx
"use client";

import { useImmutableSession } from "@imtbl/auth-next-client";

function MyComponent() {
  const {
    session,         // Session with tokens
    status,          // 'loading' | 'authenticated' | 'unauthenticated'
    isLoading,       // True during initial load
    isAuthenticated, // True when logged in
    getUser,         // Function for wallet integration
  } = useImmutableSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {session?.user?.email}</div>;
}
```

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `session` | `ImmutableSession \| null` | Session with access/refresh tokens |
| `status` | `string` | Auth status: `'loading'`, `'authenticated'`, `'unauthenticated'` |
| `isLoading` | `boolean` | Whether initial auth state is loading |
| `isAuthenticated` | `boolean` | Whether user is authenticated |
| `getUser` | `(forceRefresh?: boolean) => Promise<User \| null>` | Get user function for wallet integration |

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

## Login Functions

This package re-exports the standalone login functions from `@imtbl/auth`:

### `loginWithPopup(config)`

Opens a popup window for authentication and returns tokens.

```tsx
import { loginWithPopup } from "@imtbl/auth-next-client";
import { signIn } from "next-auth/react";

async function handlePopupLogin() {
  const tokens = await loginWithPopup({
    clientId: "your-client-id",
    redirectUri: `${window.location.origin}/callback`,
  });
  
  await signIn("immutable", {
    tokens: JSON.stringify(tokens),
    redirect: false,
  });
}
```

### `loginWithRedirect(config)`

Redirects the page to the authentication provider. Use `CallbackPage` on the callback page.

```tsx
import { loginWithRedirect } from "@imtbl/auth-next-client";

function handleRedirectLogin() {
  loginWithRedirect({
    clientId: "your-client-id",
    redirectUri: `${window.location.origin}/callback`,
  });
}
```

### `handleLoginCallback(config)`

Handles the OAuth callback (used internally by `CallbackPage`).

```tsx
import { handleLoginCallback } from "@imtbl/auth-next-client";

const tokens = await handleLoginCallback({
  clientId: "your-client-id",
  redirectUri: `${window.location.origin}/callback`,
});
```

## Types

### Session Type

```typescript
interface ImmutableSession {
  accessToken: string;
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

```typescript
interface LoginConfig {
  clientId: string;
  redirectUri: string;
  popupRedirectUri?: string;
  audience?: string;
  scope?: string;
  authenticationDomain?: string;
}
```

### TokenResponse

```typescript
interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpires: number;
  profile: { sub: string; email?: string; nickname?: string };
  zkEvm?: { ethAddress: string; userAdminAddress: string };
}
```

## Error Handling

The session may contain an `error` field indicating authentication issues:

| Error | Description | Handling |
|-------|-------------|----------|
| `"TokenExpired"` | Access token expired | Server-side refresh will happen automatically |
| `"RefreshTokenError"` | Refresh token invalid | Prompt user to sign in again |

```tsx
import { useImmutableSession } from "@imtbl/auth-next-client";
import { signIn, signOut } from "next-auth/react";

function ProtectedContent() {
  const { session, isAuthenticated } = useImmutableSession();

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
        <button onClick={() => signIn()}>Sign In</button>
      </div>
    );
  }

  return <div>Protected content here</div>;
}
```

## Related Packages

- [`@imtbl/auth-next-server`](../auth-next-server) - Server-side authentication utilities
- [`@imtbl/auth`](../auth) - Core authentication library with standalone login functions
- [`@imtbl/wallet`](../wallet) - Wallet connection with `getUser` support

## License

Apache-2.0
