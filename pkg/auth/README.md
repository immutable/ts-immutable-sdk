# @imtbl/auth

Minimal authentication package for Immutable Passport. Provides OAuth-based authentication that can be used standalone or passed to other SDK packages for enhanced functionality.

## Installation

```bash
npm install @imtbl/auth
# or
pnpm add @imtbl/auth
# or
yarn add @imtbl/auth
```

## Usage

### Basic Authentication with Popup

```typescript
import { Auth } from '@imtbl/auth';

const auth = new Auth({
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback',
  environment: 'production',
});

// Login with popup
const user = await auth.loginPopup();
console.log(user?.profile.email);
console.log(user?.access_token); // Direct access to tokens

// Get current user
const currentUser = await auth.getUser();
if (currentUser) {
  console.log(currentUser.id_token); // Access ID token
  console.log(currentUser.expired); // Check if expired
}

// Logout
await auth.logout();
```

### With Redirect Flow

```typescript
// On your login page
await auth.loginRedirect();

// On your callback page
const user = await auth.handleRedirect();
console.log(user?.profile.email);
console.log(user?.access_token); // Direct access to tokens
```

### Standalone Usage

The auth package can be used completely independently:

```typescript
import { Auth } from '@imtbl/auth';

const auth = new Auth({ clientId: '...', redirectUri: '...' });
const user = await auth.loginPopup();
const accessToken = user?.access_token;

// Use token for API calls
fetch('https://api.example.com/data', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

### With Wallet Package

```typescript
import { Auth } from '@imtbl/auth';
import { Wallet } from '@imtbl/wallet';

const auth = new Auth({ clientId: '...', redirectUri: '...' });
await auth.loginPopup();
const user = await auth.getUser();

// Pass authenticated user to wallet for enhanced features
const wallet = new Wallet({ authenticatedUser: user });
const provider = await wallet.connect();
```

## API Reference

### `Auth`

#### Constructor

```typescript
new Auth(config: AuthConfig)
```

#### Methods

- `loginPopup(options?: LoginOptions): Promise<OidcUser | null>` - Login with popup window
- `loginRedirect(options?: LoginOptions): Promise<void>` - Login with redirect flow
- `handleRedirect(): Promise<OidcUser | null>` - Handle OAuth callback after redirect
- `getUser(): Promise<OidcUser | null>` - Gets current authenticated user
- `logout(): Promise<void>` - Logs out current user (with redirect)
- `logoutSilent(): Promise<void>` - Logs out silently (without redirect)
- `refreshToken(): Promise<void>` - Refreshes access token if expired

### Types

- `OidcUser` - OIDC user object from oidc-client-ts (includes `id_token`, `access_token`, `refresh_token`, `profile`, `expired`, `expires_at`, `scope`, etc.)
- `AuthConfig` - Configuration options
- `LoginOptions` - Login options (direct method, email, marketing consent) - works for both popup and redirect flows

### Accessing Tokens

Since methods return `OidcUser` directly, you can access tokens and user info:

```typescript
const user = await auth.getUser();
if (user) {
  const accessToken = user.access_token;
  const idToken = user.id_token;
  const email = user.profile.email;
  const isExpired = user.expired;
  const expiresAt = user.expires_at;
}
```

## License

Apache-2.0

