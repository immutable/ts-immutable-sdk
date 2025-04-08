# Passport Setup Options Example

This example demonstrates different Immutable Passport setup configurations and how they affect the behavior of your application. You can explore various setup options such as popup overlay settings, scope configurations, and logout modes.

## Features

- Standard Passport configuration
- Disabled popup overlays configuration
- Minimal scopes configuration
- Complete scopes configuration
- Silent logout mode configuration
- Production environment configuration

## Getting Started

### Prerequisites

- Node.js v20 or later
- pnpm (recommended)

### Installation

1. Clone the repository
2. Navigate to the example directory:
   ```bash
   cd examples/passport/passport-setup-with-nextjs
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
5. Update the environment variables in `.env.local` with your Passport client details from Immutable Hub

### Running the Example

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Setup Options Explained

### Standard Configuration

Default Passport setup with standard settings:

```typescript
const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});
```

### Disabled Popup Overlays

Passport configured with popup overlays disabled:

```typescript
const passportInstanceWithDisabledOverlays = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
  popupOverlayOptions: {
    disableGenericPopupOverlay: true,
    disableBlockedPopupOverlay: true,
  },
});
```

### Minimal Scopes

Passport configured with only required scopes:

```typescript
const passportInstanceWithMinimalScopes = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access', // Minimal required scopes
});
```

### Silent Logout

Passport configured with silent logout mode:

```typescript
const passportInstanceWithSilentLogout = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
  logoutMode: 'silent',
});
```

## Observed Behaviors

### Popup Overlays

- **Standard Configuration**: Shows both generic and blocked popup overlays
- **Disabled Overlays**: Does not show any overlays during login/transaction processes

### Scopes

- **Minimal Scopes**: Limited user information available, no email or transaction capabilities
- **Full Scopes**: Complete user information including email and transaction capabilities

### Logout Modes

- **Standard Logout**: Redirects to the logout page upon logout
- **Silent Logout**: Performs logout without redirecting, staying on the current page

## Testing

Run the tests with:

```bash
pnpm test
```

## Learn More

- [Immutable Passport Documentation](https://docs.immutable.com/products/zkevm/passport/setup/)
- [Next.js Documentation](https://nextjs.org/docs)

## Troubleshooting

### Common Issues

- **Authentication Errors**: Ensure your client ID and redirect URIs are properly configured in Immutable Hub
- **Popup Blocked**: Check browser settings to allow popups from your application domain
- **Scope Issues**: Make sure you're requesting the correct scopes required for your application

If you encounter persistent issues, check the browser console for detailed error messages. 