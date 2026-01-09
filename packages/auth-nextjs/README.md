# @imtbl/auth-nextjs

Next.js App Router authentication integration for Immutable SDK using Auth.js v5.

This package bridges `@imtbl/auth` popup-based authentication with Auth.js session management, providing:

- Server-side session storage in encrypted JWT cookies
- Automatic token refresh on both server and client
- Full SSR support with `auth()` function
- React hooks for easy client-side authentication
- Middleware support for protecting routes

## Requirements

- Next.js 14+ with App Router
- Auth.js v5 (next-auth@5.x)
- React 18+

## Installation

```bash
pnpm add @imtbl/auth-nextjs next-auth@beta
```

## Quick Start

### 1. Create Auth Configuration

```typescript
// lib/auth.ts
import { createImmutableAuth } from "@imtbl/auth-nextjs";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};

export const { handlers, auth, signIn, signOut } = createImmutableAuth(config);
```

### 2. Set Up Auth API Route

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

### 3. Create Callback Page

```typescript
// app/callback/page.tsx
"use client";

import { CallbackPage } from "@imtbl/auth-nextjs/client";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};

export default function Callback() {
  return <CallbackPage config={config} redirectTo="/dashboard" />;
}
```

See [CallbackPage Props](#callbackpage-props) for all available options.

### 4. Add Provider to Layout

```typescript
// app/providers.tsx
"use client";

import { ImmutableAuthProvider } from "@imtbl/auth-nextjs/client";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ImmutableAuthProvider config={config}>{children}</ImmutableAuthProvider>
  );
}

// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 5. Use in Components

```typescript
// app/components/LoginButton.tsx
"use client";

import { useImmutableAuth } from "@imtbl/auth-nextjs/client";

export function LoginButton() {
  const { user, isLoading, signIn, signOut } = useImmutableAuth();

  if (isLoading) return <div>Loading...</div>;

  if (user) {
    return (
      <div>
        <span>Welcome, {user.email}</span>
        <button onClick={signOut}>Logout</button>
      </div>
    );
  }

  return <button onClick={() => signIn()}>Login with Immutable</button>;
}
```

### 6. Access Session in Server Components

```typescript
// app/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <h1>Welcome, {session.user.email}</h1>;
}
```

### 7. Protect Routes with Middleware (Optional)

```typescript
// middleware.ts
import { createAuthMiddleware } from "@imtbl/auth-nextjs/server";
import { auth } from "@/lib/auth";

export default createAuthMiddleware(auth, {
  loginUrl: "/login",
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
```

## Configuration Options

The `ImmutableAuthConfig` object accepts the following properties:

| Property               | Type     | Required | Default                                          | Description                                                    |
| ---------------------- | -------- | -------- | ------------------------------------------------ | -------------------------------------------------------------- |
| `clientId`             | `string` | Yes      | -                                                | Immutable OAuth client ID                                      |
| `redirectUri`          | `string` | Yes      | -                                                | OAuth callback redirect URI (for redirect flow)                |
| `popupRedirectUri`     | `string` | No       | `redirectUri`                                    | OAuth callback redirect URI for popup flow                     |
| `logoutRedirectUri`    | `string` | No       | -                                                | Where to redirect after logout                                 |
| `audience`             | `string` | No       | `"platform_api"`                                 | OAuth audience                                                 |
| `scope`                | `string` | No       | `"openid profile email offline_access transact"` | OAuth scopes                                                   |
| `authenticationDomain` | `string` | No       | `"https://auth.immutable.com"`                   | Authentication domain                                          |
| `passportDomain`       | `string` | No       | `"https://passport.immutable.com"`               | Passport domain for transaction confirmations (see note below) |

> **Important:** The `passportDomain` must match your target environment for transaction signing to work correctly:
>
> - **Production:** `https://passport.immutable.com` (default)
> - **Sandbox:** `https://passport.sandbox.immutable.com`
>
> If you're using the sandbox environment, you must explicitly set `passportDomain` to the sandbox URL.

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_IMMUTABLE_CLIENT_ID=your-client-id
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Required by Auth.js for cookie encryption
AUTH_SECRET=generate-with-openssl-rand-base64-32
```

Generate a secret:

```bash
openssl rand -base64 32
```

## Sandbox vs Production Configuration

When developing or testing, you'll typically use the **Sandbox** environment. Make sure to configure `passportDomain` correctly:

```typescript
// lib/auth.ts

// For SANDBOX environment
const sandboxConfig = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
  passportDomain: "https://passport.sandbox.immutable.com", // Required for sandbox!
};

// For PRODUCTION environment
const productionConfig = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
  // passportDomain defaults to 'https://passport.immutable.com'
};

// Use environment variable to switch between configs
const config =
  process.env.NEXT_PUBLIC_IMMUTABLE_ENV === "production"
    ? productionConfig
    : sandboxConfig;

export const { handlers, auth, signIn, signOut } = createImmutableAuth(config);
```

> **Note:** The `passportDomain` is used for transaction confirmation popups. If not set correctly for your environment, transaction signing will not work as expected.

## API Reference

### Main Exports (`@imtbl/auth-nextjs`)

| Export                                  | Description                                                         |
| --------------------------------------- | ------------------------------------------------------------------- |
| `createImmutableAuth(config, options?)` | Creates Auth.js instance with `{ handlers, auth, signIn, signOut }` |
| `createAuthConfig(config)`              | Creates Auth.js config (for advanced use)                           |
| `refreshAccessToken(token, config)`     | Utility to refresh an expired access token                          |
| `isTokenExpired(expires, buffer?)`      | Utility to check if a token is expired                              |

**Types:**

| Type                     | Description                               |
| ------------------------ | ----------------------------------------- |
| `ImmutableAuthConfig`    | Configuration options                     |
| `ImmutableAuthOverrides` | Auth.js options override type             |
| `ImmutableAuthResult`    | Return type of createImmutableAuth        |
| `ImmutableUser`          | User profile type                         |
| `ImmutableTokenData`     | Token data passed to credentials provider |
| `ZkEvmInfo`              | zkEVM wallet information type             |

### Client Exports (`@imtbl/auth-nextjs/client`)

| Export                  | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `ImmutableAuthProvider` | React context provider (wraps Auth.js SessionProvider) |
| `useImmutableAuth()`    | Hook for authentication state and methods (see below)  |
| `useAccessToken()`      | Hook returning `getAccessToken` function               |
| `CallbackPage`          | Pre-built callback page component for OAuth redirects  |

#### CallbackPage Props

| Prop               | Type                                                  | Default | Description                                                        |
| ------------------ | ----------------------------------------------------- | ------- | ------------------------------------------------------------------ |
| `config`           | `ImmutableAuthConfig`                                 | -       | Required. Immutable auth configuration                             |
| `redirectTo`       | `string \| ((user: ImmutableUser) => string \| void)` | `"/"`   | Where to redirect after successful auth (supports dynamic routing) |
| `loadingComponent` | `React.ReactElement \| null`                          | `null`  | Custom loading UI while processing authentication                  |
| `errorComponent`   | `(error: string) => React.ReactElement \| null`       | -       | Custom error UI component                                          |
| `onSuccess`        | `(user: ImmutableUser) => void \| Promise<void>`      | -       | Callback fired after successful authentication                     |
| `onError`          | `(error: string) => void`                             | -       | Callback fired when authentication fails                           |

**Example with all props:**

```tsx
// app/callback/page.tsx
"use client";

import { CallbackPage } from "@imtbl/auth-nextjs/client";
import { Spinner } from "@/components/ui/spinner";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};

export default function Callback() {
  return (
    <CallbackPage
      config={config}
      // Dynamic redirect based on user
      redirectTo={(user) => {
        if (user.email?.endsWith("@admin.com")) return "/admin";
        return "/dashboard";
      }}
      // Custom loading UI
      loadingComponent={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner />
          <span>Completing authentication...</span>
        </div>
      }
      // Custom error UI
      errorComponent={(error) => (
        <div className="text-center p-8">
          <h2 className="text-red-500">Authentication Error</h2>
          <p>{error}</p>
          <a href="/">Return Home</a>
        </div>
      )}
      // Success callback for analytics
      onSuccess={async (user) => {
        await analytics.track("login_success", { userId: user.sub });
      }}
      // Error callback for logging
      onError={(error) => {
        console.error("Auth failed:", error);
        Sentry.captureMessage(error);
      }}
    />
  );
}
```

**`useImmutableAuth()` Return Value:**

| Property          | Type                    | Description                                      |
| ----------------- | ----------------------- | ------------------------------------------------ |
| `user`            | `ImmutableUser \| null` | Current user profile (null if not authenticated) |
| `session`         | `Session \| null`       | Full Auth.js session with tokens                 |
| `isLoading`       | `boolean`               | Whether authentication state is loading          |
| `isAuthenticated` | `boolean`               | Whether user is authenticated                    |
| `signIn`          | `(options?) => Promise` | Sign in with Immutable (opens popup)             |
| `signOut`         | `() => Promise<void>`   | Sign out from both Auth.js and Immutable         |
| `getAccessToken`  | `() => Promise<string>` | Get a valid access token (refreshes if needed)   |
| `auth`            | `Auth \| null`          | The underlying Auth instance (for advanced use)  |

### Server Exports (`@imtbl/auth-nextjs/server`)

| Export                              | Description                                      |
| ----------------------------------- | ------------------------------------------------ |
| `createImmutableAuth`               | Re-exported for convenience                      |
| `createAuthMiddleware(auth, opts?)` | Create middleware for protecting routes          |
| `withAuth(auth, handler)`           | HOC for protecting Server Actions/Route Handlers |

**`createAuthMiddleware` Options:**

| Option           | Type                   | Default    | Description                            |
| ---------------- | ---------------------- | ---------- | -------------------------------------- |
| `loginUrl`       | `string`               | `"/login"` | URL to redirect when not authenticated |
| `protectedPaths` | `(string \| RegExp)[]` | -          | Paths that require authentication      |
| `publicPaths`    | `(string \| RegExp)[]` | -          | Paths to exclude from protection       |

## How It Works

1. **Login**: User clicks login → `@imtbl/auth` opens popup → tokens returned
2. **Session Creation**: Tokens passed to Auth.js credentials provider → stored in encrypted JWT cookie
3. **Token Refresh**: Auth.js JWT callback automatically refreshes expired tokens using refresh_token
4. **SSR**: `auth()` reads and decrypts cookie, providing full session with tokens
5. **Auto-sync**: Tokens are automatically synced between server (NextAuth session) and client (Auth instance) to handle refresh token rotation

## Handling Token Refresh Errors

When a refresh token expires or becomes invalid (e.g., after 30 days of inactivity, or revoked from another session), the session will contain an `error` property. You should handle this gracefully:

### Server Components

```typescript
// app/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  // Handle refresh token failure - prompt user to re-login
  if (session?.error === "RefreshTokenError") {
    redirect("/login?error=session_expired");
  }

  if (!session) {
    redirect("/login");
  }

  return <h1>Welcome, {session.user.email}</h1>;
}
```

### Client Components

```typescript
"use client";

import { useImmutableAuth } from "@imtbl/auth-nextjs/client";

export function ProtectedContent() {
  const { session, user, signIn, isLoading } = useImmutableAuth();

  if (isLoading) return <div>Loading...</div>;

  // Handle refresh token failure
  if (session?.error) {
    return (
      <div>
        <p>Your session has expired. Please log in again.</p>
        <button onClick={() => signIn()}>Log In</button>
      </div>
    );
  }

  if (!user) {
    return <button onClick={() => signIn()}>Log In</button>;
  }

  return <div>Welcome, {user.email}</div>;
}
```

### Using getAccessToken

The `getAccessToken()` function will throw an error if the token cannot be refreshed:

```typescript
const { getAccessToken } = useImmutableAuth();

async function fetchData() {
  try {
    const token = await getAccessToken();
    const response = await fetch("/api/data", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  } catch (error) {
    // Token refresh failed - redirect to login or show error
    console.error("Failed to get access token:", error);
  }
}
```

## Migration from v4 (Pages Router)

If you're migrating from the Pages Router version:

| v4 (Pages Router)                       | v5 (App Router)                               |
| --------------------------------------- | --------------------------------------------- |
| `ImmutableAuth(config)`                 | `createImmutableAuth(config)`                 |
| `getImmutableSession(req, res, config)` | `auth()` (from createImmutableAuth)           |
| `withPageAuthRequired(config)`          | `createAuthMiddleware(auth)` or layout checks |
| `pages/api/auth/[...nextauth].ts`       | `app/api/auth/[...nextauth]/route.ts`         |
| `pages/_app.tsx` with provider          | `app/layout.tsx` with provider                |
| `NEXTAUTH_SECRET`                       | `AUTH_SECRET`                                 |

## License

Apache-2.0
