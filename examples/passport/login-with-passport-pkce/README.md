# PKCE Flow Authentication Example

This example demonstrates the PKCE (Proof Key for Code Exchange) flow for Immutable Passport authentication. PKCE is an extension to the OAuth 2.0 authorization code flow that provides enhanced security for public clients.

## Features

- **PKCE Flow Authentication**: Implements the PKCE protocol for secure authentication
- **State Management for CSRF Protection**: Uses a randomly generated state parameter to protect against CSRF attacks
- **User Profile Display**: Shows authenticated user information
- **Secure Logout Flow**: Properly handles the logout process

## Why PKCE?

PKCE (Proof Key for Code Exchange) is particularly important for public clients like single-page applications and mobile apps where client secrets cannot be securely stored. It adds an extra layer of security by:

1. Generating a code verifier and code challenge
2. Using the code challenge during the authorization request
3. Sending the code verifier during token exchange

This prevents authorization code interception attacks, as an attacker who intercepts the authorization code would also need the code verifier to obtain an access token.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm

### Installation

1. Clone the repository
2. Navigate to this example directory
   ```
   cd examples/passport/login-with-passport-pkce
   ```
3. Install dependencies
   ```
   pnpm install
   ```
4. Create a `.env` file based on the `.env.example` and fill in your credentials:
   ```
   NEXT_PUBLIC_CLIENT_ID="YOUR_CLIENT_ID"
   NEXT_PUBLIC_PUBLISHABLE_KEY="YOUR_PUBLISHABLE_KEY"
   ```

### Running the Example

```
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the example.

### Testing

```
pnpm test
```

## Configuration

The Passport instance in this example is configured with PKCE enabled:

```typescript
export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
  pkce: true, // Enable PKCE flow
});
```

## How It Works

1. When a user initiates login, a random state parameter is generated for CSRF protection
2. The login process is initiated with PKCE enabled
3. After authentication, the redirect page validates the state parameter
4. User information is displayed after successful authentication

## Learn More

- [Immutable Passport Documentation](https://docs.immutable.com/docs/zkEVM/products/passport)
- [OAuth 2.0 PKCE RFC](https://datatracker.ietf.org/doc/html/rfc7636) 