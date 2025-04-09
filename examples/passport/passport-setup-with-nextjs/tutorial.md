# Passport Setup Patterns with Next.js

<div class="display-none">
# Passport Setup Patterns with Next.js
</div>

This example demonstrates various ways to configure and initialize the Passport SDK, showcasing different configuration patterns and their effects on authentication behavior.

<div class="button-component">
[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/passport-setup-with-nextjs) <span class="button-component-arrow">→</span>
</div>

## Configuration Patterns Overview

This example demonstrates seven different Passport configuration patterns:

1. Default Configuration
2. Disabled Popup Overlays
3. Minimal Scopes
4. All Scopes
5. Silent Logout
6. Generic Overlay Disabled
7. Blocked Overlay Disabled

## Implementation Details

### 1. Default Configuration
**Configuration Name**: Basic Passport Setup
**Source Code**: [setupDefault.ts](src/app/utils/setupDefault.ts)

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

**Explanation**:
The default configuration implements a standard OAuth2.0 setup with OpenID Connect, providing a solid foundation for most web applications. It includes both email and transaction scopes, enabling access to user email information and transaction capabilities out of the box. The configuration maintains session persistence through the offline_access scope, allowing users to remain authenticated across page reloads and browser sessions. This setup displays default popup overlays for both generic and blocked states, providing users with clear visual feedback during authentication processes. This configuration is ideal for standard web applications that need user authentication with email access and transaction capabilities, particularly when the default popup behavior aligns with the application's user experience goals.

### 2. Disabled Popup Overlays
**Configuration Name**: No Popup Overlays
**Source Code**: [setupDefault.ts](src/app/utils/setupDefault.ts)

```typescript
const passportInstanceWithDisabledOverlays = new passport.Passport({
  // ... base configuration ...
  popupOverlayOptions: {
    disableGenericPopupOverlay: true,
    disableBlockedPopupOverlay: true,
  },
});
```

**Explanation**:
This configuration completely removes all popup overlay notifications while maintaining the core authentication functionality. While popup windows still open for authentication processes, they do so without the standard overlay UI, creating a more minimalist experience. This setup is particularly valuable for embedded applications or those with custom UI requirements where the default overlays might interfere with the application's design. Developers can implement their own overlay systems or notification mechanisms, making this configuration perfect for applications requiring complete control over the visual feedback during authentication processes. This approach is especially useful in embedded environments or when integrating with existing notification systems.

### 3. Minimal Scopes
**Configuration Name**: Essential Scopes Only
**Source Code**: [setupDefault.ts](src/app/utils/setupDefault.ts)

```typescript
const passportInstanceWithMinimalScopes = new passport.Passport({
  // ... base configuration ...
  scope: 'openid offline_access',
});
```

**Explanation**:
The minimal scopes configuration strips down the authentication to its essential components, utilizing only the openid and offline_access scopes. By removing email and transaction capabilities, this configuration creates a lighter, faster authentication process with minimal data access. The configuration still maintains session persistence through offline_access while reducing the initial authentication payload. This streamlined approach is particularly beneficial for performance-critical applications or those that don't require additional user information or transaction capabilities. It's an excellent choice for applications that prioritize quick authentication times and minimal data access, such as read-only applications or those with separate systems for handling user data and transactions.

### 4. All Scopes
**Configuration Name**: Full Feature Access
**Source Code**: [setupDefault.ts](src/app/utils/setupDefault.ts)

```typescript
const passportInstanceWithAllScopes = new passport.Passport({
  // ... base configuration ...
  scope: 'openid offline_access email transact',
});
```

**Explanation**:
This configuration enables the complete feature set of the Passport SDK, incorporating all available scopes for maximum functionality. It provides comprehensive access to user information through the email scope and enables transaction capabilities through the transact scope, while maintaining session persistence with offline_access. This setup is designed for applications that need full access to user profiles and blockchain transaction capabilities. It's particularly well-suited for full-featured applications that require complete user interaction, such as blockchain gaming platforms, NFT marketplaces, or any application that needs to handle both user data and blockchain transactions seamlessly.

### 5. Silent Logout
**Configuration Name**: Silent Logout Mode
**Source Code**: [setupDefault.ts](src/app/utils/setupDefault.ts)

```typescript
const passportInstanceWithSilentLogout = new passport.Passport({
  // ... base configuration ...
  logoutMode: 'silent',
});
```

**Explanation**:
The silent logout configuration implements a seamless logout experience by handling session termination in the background without redirecting the user. This approach maintains the application's state during the logout process, providing a smoother user experience compared to traditional logout flows. When a user logs out, the session is terminated quietly while keeping them on the current page, making it ideal for single-page applications (SPAs) where maintaining context is crucial. This configuration significantly improves the user experience in applications where frequent authentication state changes occur, as it prevents disruptive page reloads and maintains the user's context throughout the logout process.

### 6. Generic Overlay Disabled
**Configuration Name**: Selective Overlay Control
**Source Code**: [setupDefault.ts](src/app/utils/setupDefault.ts)

```typescript
const passportInstanceWithGenericOverlayDisabled = new passport.Passport({
  // ... base configuration ...
  popupOverlayOptions: {
    disableGenericPopupOverlay: true,
    disableBlockedPopupOverlay: false,
  },
});
```

**Explanation**:
This configuration takes a balanced approach to overlay management by disabling only the generic popup overlay while maintaining the blocked popup notifications. It allows applications to handle routine popup notifications in a custom way while preserving important security-related overlays. This selective approach is particularly useful when you want to maintain critical security notifications but customize the presentation of general authentication processes. It's well-suited for applications that need to balance custom UI requirements with security considerations, allowing developers to implement their own generic popup handling while ensuring users still receive important security-related notifications through the standard blocked overlay.

### 7. Blocked Overlay Disabled
**Configuration Name**: Security Overlay Control
**Source Code**: [setupDefault.ts](src/app/utils/setupDefault.ts)

```typescript
const passportInstanceWithBlockedOverlayDisabled = new passport.Passport({
  // ... base configuration ...
  popupOverlayOptions: {
    disableGenericPopupOverlay: false,
    disableBlockedPopupOverlay: true,
  },
});
```

**Explanation**:
This configuration maintains the generic popup notifications while disabling the blocked popup overlay, offering an alternative approach to security state handling. It keeps users informed about general authentication processes through the standard overlay system while allowing for custom handling of blocked states. This setup is valuable for applications that need to implement their own security notification system while maintaining the default behavior for routine authentication processes. It's particularly useful in scenarios where the application needs to handle security states in a specific way, such as integrating with custom security monitoring systems or implementing specialized blocked state notifications that align with the application's security requirements.

## Running the App

### Prerequisites
- Node.js 16 or higher
- pnpm package manager
- Environment variables:
  - `NEXT_PUBLIC_CLIENT_ID`: Your Immutable client ID
  - `NEXT_PUBLIC_PUBLISHABLE_KEY`: Your Immutable publishable key

### Setup Instructions
1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing Different Configurations

1. Navigate to different routes to test each configuration:
   - `/passport-setup-default` - Default configuration
   - `/passport-setup-disabled-overlays` - No popup overlays
   - `/passport-setup-minimal-scopes` - Minimal scope configuration
   - `/passport-setup-all-scopes` - Full scope configuration
   - `/passport-setup-silent-logout` - Silent logout behavior
   - `/passport-setup-generic-overlay-disabled` - No generic overlay
   - `/passport-setup-blocked-overlay-disabled` - No blocked overlay

2. For each configuration:
   - Test the login flow
   - Observe popup behavior
   - Check available user information
   - Test the logout process
   - Note any differences in behavior

## Summary

This example demonstrates the flexibility of Passport SDK configuration options. Key takeaways:

- **Overlay Control**: Fine-grained control over popup notifications
- **Scope Management**: Balance between functionality and performance
- **Logout Behavior**: Options for different logout experiences
- **Security Considerations**: Maintain security while customizing UX
- **Session Management**: Various approaches to handling authentication state

Choose the configuration that best matches your application's needs while considering:
- User experience requirements
- Security needs
- Performance considerations
- Feature requirements
- Integration complexity 