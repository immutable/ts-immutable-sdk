# @imtbl/auth

Minimal OAuth-based authentication package for Immutable Passport. Provides a thin wrapper around `oidc-client-ts` for OAuth/OIDC authentication flows.

## Installation

```bash
npm install @imtbl/auth
# or
pnpm add @imtbl/auth
# or
yarn add @imtbl/auth
```

## Quick Start

```typescript
import { Auth } from '@imtbl/auth';

const auth = new Auth({
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback',
});

// Login with popup
const user = await auth.loginPopup();
console.log(user?.profile.email);
console.log(user?.access_token);

// Get current user
const currentUser = await auth.getUser();

// Logout
await auth.logout();
```

## Usage

### Popup Flow

```typescript
const auth = new Auth({
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback',
});

const user = await auth.loginPopup();
if (user) {
  console.log(user.access_token);
  console.log(user.id_token);
  console.log(user.profile.email);
}
```

### Redirect Flow

```typescript
// On your login page
await auth.loginRedirect();

// On your callback page (e.g., /callback)
const user = await auth.handleRedirect();
if (user) {
  console.log(user.access_token);
}
```

### Direct Login Methods

```typescript
// Google login
await auth.loginPopup({ directLoginMethod: 'google' });

// Apple login
await auth.loginPopup({ directLoginMethod: 'apple' });

// Email login
await auth.loginPopup({
  directLoginMethod: 'email',
  email: 'user@example.com',
});
```

### Token Management

```typescript
const user = await auth.getUser();

if (user) {
  // Check if token is expired
  if (user.expired) {
    await auth.refreshToken();
  }
  
  // Access tokens directly
  const accessToken = user.access_token;
  const idToken = user.id_token;
  const refreshToken = user.refresh_token;
}
```

## API Reference

### `Auth`

#### Constructor

```typescript
new Auth(config: AuthConfig)
```

**Config Options:**
- `clientId` (required): OAuth client ID
- `redirectUri` (required): OAuth redirect URI
- `popupRedirectUri` (optional): Custom popup redirect URI (defaults to `redirectUri`)
- `logoutRedirectUri` (optional): Custom logout redirect URI
- `scope` (optional): OAuth scope (defaults to `'openid profile email'`)

#### Methods

- `loginPopup(options?: LoginOptions): Promise<User | null>` - Login with popup window
- `loginRedirect(options?: LoginOptions): Promise<void>` - Login with redirect flow
- `handleRedirect(): Promise<User | null>` - Handle OAuth callback after redirect
- `getUser(): Promise<User | null>` - Get current authenticated user
- `logout(): Promise<void>` - Logout with redirect
- `logoutSilent(): Promise<void>` - Logout silently (without redirect)
- `refreshToken(): Promise<void>` - Refresh access token if expired

### Types

- `User` - OIDC user object from `oidc-client-ts` (includes `id_token`, `access_token`, `refresh_token`, `profile`, `expired`, `expires_at`, `scope`, etc.)
- `AuthConfig` - Configuration options
- `LoginOptions` - Login options:
  - `directLoginMethod?: string` - Direct login method (`'google'`, `'apple'`, `'email'`)
  - `email?: string` - Email address (required when `directLoginMethod` is `'email'`)
  - `marketingConsent?: 'opted_in' | 'unsubscribed'` - Marketing consent status

## Integration with Wallet Package

The auth package can be used standalone or passed to the wallet package for automatic authentication:

```typescript
import { Auth } from '@imtbl/auth';
import { connectWallet } from '@imtbl/wallet';

const auth = new Auth({ clientId: '...', redirectUri: '...' });

// Pass auth client - login handled automatically when needed
const provider = await connectWallet({ auth });

// User will be prompted to login automatically when required
const accounts = await provider.request({ method: 'eth_requestAccounts' });
```

## Storage

- **Browser**: Uses `localStorage` for token storage
- **SSR**: Uses `InMemoryWebStorage` (tokens not persisted)

## License

Apache-2.0
