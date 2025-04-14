<div class="display-none">
# Passport Setup with NextJS
</div>

Learn how to initialize and configure the Immutable Passport SDK in a Next.js application with various configuration options. This example demonstrates different initialization patterns that affect UI overlays, scope settings, and logout behavior.

<div class="button-component">
[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/setup-with-nextjs) <span class="button-component-arrow">→</span>
</div>

## Configuration Patterns Overview

This example demonstrates the following Passport configuration patterns:

- **Default Configuration**: Basic Passport setup with standard settings
- **Disabled Popup Overlays**: Configuration with all popup overlays disabled
- **Minimal Scopes**: Configuration with only essential scopes (openid, offline_access)
- **All Scopes**: Configuration with all available scopes enabled
- **Silent Logout**: Configuration using silent logout mode
- **Selective Overlay Disabling**: Configurations that disable specific overlay types

## Implementation Details

### Default Configuration

**Description**: Standard initialization of the Passport SDK with default settings.

**Source Code**: [setupDefault.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/setup-with-nextjs/src/app/utils/setupDefault.ts#L4-L14)

**Configuration Details**:
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

**Behavior Explanation**: This configuration initializes Passport with standard settings, showing all overlays and using standard login/logout behavior. The default configuration includes:
- Regular redirection-based login and logout
- Both popup overlays enabled (generic and blocked)
- Standard scope set for authentication and transaction capabilities

**Use Cases**: Use this configuration for standard web applications where default Passport behavior is acceptable and a seamless user experience with helpful guidance is desired.

### Disabled Popup Overlays

**Description**: Configuration that disables all popup overlays.

**Source Code**: [setupDefault.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/setup-with-nextjs/src/app/utils/setupDefault.ts#L17-L30)

**Configuration Details**:
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

**Behavior Explanation**: This configuration disables both the generic popup overlay and the blocked popup overlay. Users will not see any guidance overlays when popup windows are opened or blocked during the authentication flow.

**Use Cases**: Use this configuration for applications targeting technically savvy users who don't need guidance, or when integrating Passport into an application with its own custom user guidance system.

### Minimal Scopes

**Description**: Configuration using only the minimum required scopes.

**Source Code**: [setupDefault.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/setup-with-nextjs/src/app/utils/setupDefault.ts#L33-L43)

**Configuration Details**:
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
  scope: 'openid offline_access', // Minimal required scopes, without email and transact
});
```

**Behavior Explanation**: This configuration includes only the minimum required scopes (`openid` and `offline_access`), excluding `email` and `transact` scopes. This means:
- The application won't have access to the user's email
- The application won't have transaction capabilities
- Authentication will still work for basic identity verification

**Use Cases**: Use this configuration for applications that only need basic authentication but don't need user emails or transaction capabilities, such as read-only applications or those with limited functionality.

### All Scopes

**Description**: Configuration with all available scopes.

**Source Code**: [setupDefault.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/setup-with-nextjs/src/app/utils/setupDefault.ts#L46-L56)

**Configuration Details**:
```typescript
const passportInstanceWithAllScopes = new passport.Passport({
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

**Behavior Explanation**: This configuration requests all available scopes, including `openid`, `offline_access`, `email`, and `transact`. This provides the application with:
- Basic authentication capabilities
- Access to the user's email
- Ability to perform transactions on behalf of the user

**Use Cases**: Use this configuration for full-featured applications that need complete user information and transaction capabilities, such as gaming applications, marketplaces, or full-featured wallet applications.

### Silent Logout

**Description**: Configuration using silent logout mode.

**Source Code**: [setupDefault.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/setup-with-nextjs/src/app/utils/setupDefault.ts#L59-L70)

**Configuration Details**:
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

**Behavior Explanation**: This configuration sets the logout mode to `silent`, which means:
- Logout happens without redirecting to the identity provider
- The session is ended locally without clearing cookies at the identity provider level
- The user's browser won't navigate away from the current page during logout

**Use Cases**: Use this configuration for applications where keeping the user in the current context is important, or where user experience would be disrupted by a full logout redirect. This is especially useful for applications with their own session management on top of Passport.

### Generic Overlay Disabled

**Description**: Configuration with only the generic popup overlay disabled.

**Source Code**: [setupDefault.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/setup-with-nextjs/src/app/utils/setupDefault.ts#L73-L86)

**Configuration Details**:
```typescript
const passportInstanceWithGenericOverlayDisabled = new passport.Passport({
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
    disableGenericPopupOverlay: true, // Only disable generic
    disableBlockedPopupOverlay: false,
  },
});
```

**Behavior Explanation**: This configuration disables only the generic popup overlay while keeping the blocked popup overlay enabled. This means:
- Users won't see the overlay that guides them about the popup window opening
- Users will still see the warning overlay if their browser blocks the popup

**Use Cases**: Use this configuration when your users are familiar with popup-based authentication but may still need guidance if their browser blocks popups. This offers a balance between a streamlined experience and necessary guidance.

### Blocked Overlay Disabled

**Description**: Configuration with only the blocked popup overlay disabled.

**Source Code**: [setupDefault.ts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/setup-with-nextjs/src/app/utils/setupDefault.ts#L89-L102)

**Configuration Details**:
```typescript
const passportInstanceWithBlockedOverlayDisabled = new passport.Passport({
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
    disableGenericPopupOverlay: false,
    disableBlockedPopupOverlay: true, // Only disable blocked
  },
});
```

**Behavior Explanation**: This configuration disables only the blocked popup overlay while keeping the generic popup overlay enabled. Users will see the initial guidance about popups opening but won't receive a special warning if their browser blocks the popup.

**Use Cases**: Use this configuration when you want to inform users about popups in general but prefer to handle blocked popup situations with your own custom error handling or UI rather than relying on Passport's built-in warning.

## Running the App

### Prerequisites

- Node.js v20 or later
- pnpm (or npm/yarn)
- Environment variables:
  - `NEXT_PUBLIC_CLIENT_ID`: Your Passport Client ID from Immutable Hub
  - `NEXT_PUBLIC_PUBLISHABLE_KEY`: Your Publishable API Key from Immutable Hub

### Setup Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/passport/setup-with-nextjs
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy the example environment file: `cp .env.example .env`
   - Update with your client ID and publishable key from Immutable Hub

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Testing Different Configurations

1. From the home page, click on any of the configuration patterns to navigate to its dedicated page
2. Click "Login" to test the authentication process with that specific configuration
3. After successful login, you'll see user information displayed
4. Click "Logout" to test the logout process with that specific configuration
5. Return to the home page to try other configurations

## Summary

The Passport SDK offers various configuration options that allow you to customize the authentication experience for your users. Key considerations when choosing between different configurations:

- **Popup Overlays**: Choose between providing helpful guidance (default) or a more streamlined experience (disabled)
- **Scopes**: Request only the permissions your application needs (minimal scopes) or get full capabilities (all scopes)
- **Logout Behavior**: Use standard redirection logout or silent logout depending on your UX requirements
- **Selective Overlay Control**: Fine-tune which overlays are shown to balance guidance and streamlined experience

For most applications, starting with the default configuration is recommended, then adjusting specific options as needed based on your application's requirements and user preferences. Always consider security implications when modifying authentication-related configurations, particularly when changing scopes or login/logout behaviors. 