# @imtbl/auth-nextjs

Next.js App Router authentication for Immutable SDK using Auth.js v5.

## Installation

```bash
pnpm add @imtbl/auth-nextjs next-auth@beta
```

## Setup

### 1. Shared Auth Config

Create a single config used by all auth components:

```typescript
// lib/auth-config.ts
import type { ImmutableAuthConfig } from "@imtbl/auth-nextjs";

export const authConfig: ImmutableAuthConfig = {
  clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
  // OAuth callback URL - where Immutable redirects after login
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
  // Optional: for popup-based login (defaults to redirectUri if not set)
  // popupRedirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
};
```

### 2. Server Auth (createImmutableAuth)

```typescript
// lib/auth.ts
import { createImmutableAuth } from "@imtbl/auth-nextjs";
import { authConfig } from "./auth-config";

export const { handlers, auth } = createImmutableAuth(authConfig);
```

### 3. API Route

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

### 4. Callback Page

The callback page handles the OAuth redirect. The `redirectUri` in config must match this page's URL.

```typescript
// app/callback/page.tsx
"use client";
import { CallbackPage } from "@imtbl/auth-nextjs/client";
import { authConfig } from "@/lib/auth-config";

export default function Callback() {
  return (
    <CallbackPage
      config={authConfig}
      // Where to navigate AFTER auth completes (not the OAuth redirect)
      redirectTo="/dashboard"
    />
  );
}
```

### 5. Provider

```typescript
// app/layout.tsx
import { ImmutableAuthProvider } from "@imtbl/auth-nextjs/client";
import { authConfig } from "@/lib/auth-config";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <ImmutableAuthProvider config={authConfig}>
          {children}
        </ImmutableAuthProvider>
      </body>
    </html>
  );
}
```

## Usage Examples

### Client Component - Login/Logout

```typescript
"use client";
import { useImmutableAuth } from "@imtbl/auth-nextjs/client";

export function LoginButton() {
  const { user, isLoading, isLoggingIn, signIn, signOut } = useImmutableAuth();

  if (isLoading) return <div>Loading...</div>;
  if (user) return <button onClick={signOut}>Logout ({user.email})</button>;

  return (
    <button onClick={() => signIn()} disabled={isLoggingIn}>
      {isLoggingIn ? "Logging in..." : "Login"}
    </button>
  );
}
```

### Client Component - API Calls

```typescript
"use client";
import { useImmutableAuth } from "@imtbl/auth-nextjs/client";

export function FetchData() {
  const { getAccessToken } = useImmutableAuth();

  async function handleFetch() {
    const token = await getAccessToken(); // Auto-refreshes if expired
    const res = await fetch("/api/data", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  }

  return <button onClick={handleFetch}>Fetch</button>;
}
```

### Server Component - Basic

```typescript
// app/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");
  return <h1>Welcome, {session.user.email}</h1>;
}
```

### Server Component - SSR Data Fetching (Recommended)

```typescript
// lib/auth-server.ts
import { createProtectedFetchers } from "@imtbl/auth-nextjs/server";
import { auth } from "./auth";
import { redirect } from "next/navigation";

// Define auth error handling once
export const { getData } = createProtectedFetchers(auth, (error) => {
  redirect(`/login?error=${encodeURIComponent(error)}`);
});
```

```typescript
// lib/fetchers.ts - Shared fetcher for server & client
export interface DashboardData {
  stats: { views: number };
}

export async function fetchDashboard(token: string): Promise<DashboardData> {
  const res = await fetch("https://api.example.com/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
```

```typescript
// app/dashboard/page.tsx (Server Component)
import { getData } from "@/lib/auth-server";
import { fetchDashboard } from "@/lib/fetchers";
import Dashboard from "./Dashboard";

export default async function DashboardPage() {
  const props = await getData(fetchDashboard); // Auth errors redirect automatically
  return <Dashboard {...props} />;
}
```

```typescript
// app/dashboard/Dashboard.tsx (Client Component)
"use client";
import {
  useHydratedData,
  type ProtectedAuthPropsWithData,
} from "@imtbl/auth-nextjs/client";
import { fetchDashboard, type DashboardData } from "@/lib/fetchers";

export default function Dashboard(
  props: ProtectedAuthPropsWithData<DashboardData>
) {
  // ssr=true: uses server data immediately
  // ssr=false: refreshes token client-side, then fetches
  const { data, isLoading, error } = useHydratedData(props, fetchDashboard);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>Views: {data!.stats.views}</div>;
}
```

### Middleware - Route Protection

```typescript
// middleware.ts
import { createAuthMiddleware } from "@imtbl/auth-nextjs/server";
import { auth } from "@/lib/auth";

export default createAuthMiddleware(auth, { loginUrl: "/login" });

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
```

### Server Action - Protected

```typescript
// app/actions.ts
"use server";
import { withAuth } from "@imtbl/auth-nextjs/server";
import { auth } from "@/lib/auth";

export const updateProfile = withAuth(
  auth,
  async (session, formData: FormData) => {
    // session.user, session.accessToken available
    const name = formData.get("name");
    // ... update logic
  }
);
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_IMMUTABLE_CLIENT_ID=your-client-id
NEXT_PUBLIC_BASE_URL=http://localhost:3000
AUTH_SECRET=generate-with-openssl-rand-base64-32  # openssl rand -base64 32
```

## Tips & Caveats

### Redirect URIs Explained

| Config Property | Purpose |
| --------------- | ------- |
| `redirectUri` | OAuth callback URL - where Immutable redirects after authentication (must match your callback page URL) |
| `popupRedirectUri` | Same as `redirectUri` but for popup login flow. Defaults to `redirectUri` if not set |
| `redirectTo` (CallbackPage prop) | Where to navigate the user AFTER authentication completes (e.g., `/dashboard`) |

### Login Flows

- **Popup (default)**: `signIn()` opens a popup window. Uses `popupRedirectUri` (or `redirectUri`)
- **Redirect**: `signIn({ useCachedSession: false, useRedirectFlow: true })` does a full page redirect

Both flows redirect to your callback page, which completes the auth and navigates to `redirectTo`.

### Sandbox Environment

For sandbox, set `passportDomain` explicitly:

```typescript
export const authConfig: ImmutableAuthConfig = {
  clientId: "...",
  redirectUri: "...",
  passportDomain: "https://passport.sandbox.immutable.com", // Required for sandbox
};
```

### Token Refresh

- Tokens are refreshed **client-side only** to avoid race conditions with refresh token rotation
- `getAccessToken()` automatically refreshes expired tokens
- `useHydratedData` handles SSR/CSR switching automatically - if server token is expired, it fetches client-side after refresh

### SSR Data Fetching

| Token State | Server                     | Client                   |
| ----------- | -------------------------- | ------------------------ |
| Valid       | Fetches data (`ssr: true`) | Uses server data         |
| Expired     | Skips fetch (`ssr: false`) | Refreshes token, fetches |
| Auth Error  | Redirects via handler      | -                        |

### CallbackPage Props

| Prop               | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `config`           | Required. Auth configuration                                |
| `redirectTo`       | Where to redirect after auth (string or `(user) => string`) |
| `loadingComponent` | Custom loading UI                                           |
| `errorComponent`   | Custom error UI `(error) => ReactElement`                   |
| `onSuccess`        | Callback after successful auth                              |
| `onError`          | Callback when auth fails                                    |
