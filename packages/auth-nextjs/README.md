# @imtbl/auth-nextjs

Next.js authentication integration for Immutable SDK using NextAuth.js.

This package bridges `@imtbl/auth` popup-based authentication with NextAuth.js session management, providing:

- Server-side session storage in encrypted JWT cookies
- Automatic token refresh on both server and client
- Full SSR support with `getServerSession`
- React hooks for easy client-side authentication

## Installation

```bash
pnpm add @imtbl/auth-nextjs next-auth
```

## Quick Start

### 1. Set Up Auth API Route

```typescript
// pages/api/auth/[...nextauth].ts
import { ImmutableAuth } from "@imtbl/auth-nextjs";

export default ImmutableAuth({
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
});
```

### 2. Create Callback Page

```typescript
// pages/callback.tsx
import { CallbackPage } from "@imtbl/auth-nextjs/client";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};

export default function Callback() {
  return <CallbackPage config={config} />;
}
```

### 3. Add Provider to App

```typescript
// pages/_app.tsx
import { ImmutableAuthProvider } from "@imtbl/auth-nextjs/client";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ImmutableAuthProvider config={config} session={pageProps.session}>
      <Component {...pageProps} />
    </ImmutableAuthProvider>
  );
}
```

### 4. Use in Components

```typescript
import { useImmutableAuth } from "@imtbl/auth-nextjs/client";

function LoginButton() {
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

  return <button onClick={signIn}>Login with Immutable</button>;
}
```

### 5. Access Session Server-Side (SSR)

```typescript
// pages/profile.tsx
import { getImmutableSession } from "@imtbl/auth-nextjs/server";
import type { GetServerSideProps } from "next";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};

export default function ProfilePage({ user }) {
  if (!user) return <p>Not logged in</p>;
  return <h1>Welcome, {user.email}</h1>;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getImmutableSession(ctx.req, ctx.res, config);
  return { props: { user: session?.user ?? null } };
};
```

### 6. Protect Pages (Optional)

```typescript
// pages/dashboard.tsx
import { withPageAuthRequired } from "@imtbl/auth-nextjs/server";

const config = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};

function DashboardPage() {
  return <h1>Dashboard (protected)</h1>;
}

export default DashboardPage;

// Redirects to /login if not authenticated
export const getServerSideProps = withPageAuthRequired(config);
```

## Configuration Options

The `ImmutableAuthConfig` object accepts the following properties:

| Property               | Type     | Required | Default                                          | Description                    |
| ---------------------- | -------- | -------- | ------------------------------------------------ | ------------------------------ |
| `clientId`             | `string` | Yes      | -                                                | Immutable OAuth client ID      |
| `redirectUri`          | `string` | Yes      | -                                                | OAuth callback redirect URI    |
| `logoutRedirectUri`    | `string` | No       | -                                                | Where to redirect after logout |
| `audience`             | `string` | No       | `"platform_api"`                                 | OAuth audience                 |
| `scope`                | `string` | No       | `"openid profile email offline_access transact"` | OAuth scopes                   |
| `authenticationDomain` | `string` | No       | `"https://auth.immutable.com"`                   | Authentication domain          |

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_IMMUTABLE_CLIENT_ID=your-client-id
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Required by NextAuth for cookie encryption
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

Generate a secret:

```bash
openssl rand -base64 32
```

## API Reference

### Main Exports (`@imtbl/auth-nextjs`)

| Export                              | Description                                 |
| ----------------------------------- | ------------------------------------------- |
| `ImmutableAuth(config, overrides?)` | Creates NextAuth handler (use in API route) |
| `refreshAccessToken(token)`         | Utility to refresh an expired access token  |
| `isTokenExpired(token)`             | Utility to check if a token is expired      |

**Types:**

| Type                          | Description                               |
| ----------------------------- | ----------------------------------------- |
| `ImmutableAuthConfig`         | Configuration options                     |
| `ImmutableAuthOverrides`      | NextAuth options override type            |
| `ImmutableUser`               | User profile type                         |
| `ImmutableTokenData`          | Token data passed to credentials provider |
| `ZkEvmInfo`                   | zkEVM wallet information type             |
| `WithPageAuthRequiredOptions` | Options for page protection               |

### Client Exports (`@imtbl/auth-nextjs/client`)

| Export                  | Description                                             |
| ----------------------- | ------------------------------------------------------- |
| `ImmutableAuthProvider` | React context provider (wraps NextAuth SessionProvider) |
| `useImmutableAuth()`    | Hook for authentication state and methods (see below)   |
| `useAccessToken()`      | Hook returning `getAccessToken` function                |
| `CallbackPage`          | Pre-built callback page component for OAuth redirects   |

**`useImmutableAuth()` Return Value:**

| Property          | Type                    | Description                                      |
| ----------------- | ----------------------- | ------------------------------------------------ |
| `user`            | `ImmutableUser \| null` | Current user profile (null if not authenticated) |
| `session`         | `Session \| null`       | Full NextAuth session with tokens                |
| `isLoading`       | `boolean`               | Whether authentication state is loading          |
| `isAuthenticated` | `boolean`               | Whether user is authenticated                    |
| `signIn`          | `() => Promise<void>`   | Sign in with Immutable (opens popup)             |
| `signOut`         | `() => Promise<void>`   | Sign out from both NextAuth and Immutable        |
| `getAccessToken`  | `() => Promise<string>` | Get a valid access token (refreshes if needed)   |
| `auth`            | `Auth \| null`          | The underlying Auth instance (for advanced use)  |

**Types:**

| Type                         | Description                      |
| ---------------------------- | -------------------------------- |
| `ImmutableAuthProviderProps` | Props for the provider component |
| `UseImmutableAuthReturn`     | Return type of useImmutableAuth  |
| `CallbackPageProps`          | Props for CallbackPage component |
| `ImmutableAuthConfig`        | Re-exported configuration type   |
| `ImmutableUser`              | Re-exported user type            |

### Server Exports (`@imtbl/auth-nextjs/server`)

| Export                                   | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| `getImmutableSession(req, res, config)`  | Get session server-side                  |
| `withPageAuthRequired(config, options?)` | HOC for protecting pages with auth check |

**`withPageAuthRequired` Options:**

| Option               | Type                    | Default      | Description                                          |
| -------------------- | ----------------------- | ------------ | ---------------------------------------------------- |
| `loginUrl`           | `string`                | `"/login"`   | URL to redirect to when not authenticated            |
| `returnTo`           | `string \| false`       | current page | URL to redirect to after login (`false` to disable)  |
| `getServerSideProps` | `(ctx, session) => ...` | -            | Custom getServerSideProps that runs after auth check |

**Example with custom getServerSideProps:**

```typescript
export const getServerSideProps = withPageAuthRequired(config, {
  loginUrl: "/auth/signin",
  async getServerSideProps(ctx, session) {
    // session is guaranteed to exist here
    const data = await fetchData(session.accessToken);
    return { props: { data } };
  },
});
```

**Types:**

| Type                              | Description                               |
| --------------------------------- | ----------------------------------------- |
| `WithPageAuthRequiredOptions`     | Basic options for page protection         |
| `WithPageAuthRequiredFullOptions` | Full options including getServerSideProps |
| `WithPageAuthRequiredProps`       | Props added to protected pages (session)  |

## How It Works

1. **Login**: User clicks login → `@imtbl/auth` opens popup → tokens returned
2. **Session Creation**: Tokens passed to NextAuth's credentials provider → stored in encrypted JWT cookie
3. **Token Refresh**: NextAuth JWT callback automatically refreshes expired tokens using refresh_token
4. **SSR**: `getServerSession()` reads and decrypts cookie, providing full session with tokens
5. **Auto-hydration**: If localStorage is cleared but session cookie exists, the Auth instance is automatically hydrated from session tokens

## License

Apache-2.0
