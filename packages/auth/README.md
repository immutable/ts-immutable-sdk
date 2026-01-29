# @imtbl/auth

Authentication utilities for the Immutable SDK.

## Installation

```bash
npm install @imtbl/auth
```

## Overview

This package provides two ways to handle Immutable authentication:

1. **Auth Class** - Full-featured authentication with session managed on client side.
2. **Standalone Login Functions** - Stateless login functions for use with external session managers (e.g., NextAuth)

## Standalone Login Functions

For Next.js applications using NextAuth, use the standalone login functions. These handle OAuth flows and return tokens without managing session state.

### loginWithPopup

Opens a popup window for authentication and returns tokens when complete.

```typescript
import { loginWithPopup } from '@imtbl/auth';
import { signIn } from 'next-auth/react';

async function handleLogin() {
  const tokens = await loginWithPopup({
    clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
    redirectUri: `${window.location.origin}/callback`,
  });
  
  // Sign in to NextAuth with the tokens
  await signIn('immutable', {
    tokens: JSON.stringify(tokens),
    redirect: false,
  });
}
```

### loginWithRedirect

Redirects the page to the authentication provider. Use `handleLoginCallback` on the callback page.

```typescript
import { loginWithRedirect } from '@imtbl/auth';

function handleLogin() {
  loginWithRedirect({
    clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
    redirectUri: `${window.location.origin}/callback`,
  });
}
```

### handleLoginCallback

Handles the OAuth callback and exchanges the authorization code for tokens.

```typescript
import { handleLoginCallback } from '@imtbl/auth';
import { signIn } from 'next-auth/react';

// In your callback page
async function processCallback() {
  const tokens = await handleLoginCallback({
    clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
    redirectUri: `${window.location.origin}/callback`,
  });
  
  if (tokens) {
    await signIn('immutable', {
      tokens: JSON.stringify(tokens),
      redirect: false,
    });
    // Redirect to home or dashboard
    window.location.href = '/';
  }
}
```

### LoginConfig

Configuration options for standalone login functions:

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

### TokenResponse

The token data returned from successful authentication:

```typescript
interface TokenResponse {
  /** OAuth access token for API calls */
  accessToken: string;
  /** OAuth refresh token for token renewal */
  refreshToken?: string;
  /** OpenID Connect ID token */
  idToken?: string;
  /** Unix timestamp (ms) when the access token expires */
  accessTokenExpires: number;
  /** User profile information */
  profile: {
    sub: string;
    email?: string;
    nickname?: string;
  };
  /** zkEVM wallet information if available */
  zkEvm?: {
    ethAddress: string;
    userAdminAddress: string;
  };
}
```

## Auth Class

For applications that need full authentication management (like the Passport SDK), use the `Auth` class:

```typescript
import { Auth } from '@imtbl/auth';

const auth = new Auth({
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback',
  scope: 'openid profile email offline_access transact',
});

// Login with popup
const user = await auth.login();

// Get current user
const user = await auth.getUser();

// Logout
await auth.logout();
```

## Integration with NextAuth

For a complete Next.js authentication setup, use this package with:
- `@imtbl/auth-next-server` - Server-side NextAuth configuration
- `@imtbl/auth-next-client` - Client-side components and hooks

See those packages for full integration documentation.
