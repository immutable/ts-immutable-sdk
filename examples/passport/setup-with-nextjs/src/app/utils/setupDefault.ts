import { config, passport } from '@imtbl/sdk';

// Default Passport instance with basic configuration
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
});

// Passport instance with disabled popup overlay options
export const passportInstanceWithDisabledOverlays = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
  popupOverlayOptions: {
    disableGenericPopupOverlay: true,
    disableBlockedPopupOverlay: true,
  },
});

// Passport instance with minimal scopes
export const passportInstanceWithMinimalScopes = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access', // Minimal required scopes, without email and transact
});

// Passport instance with all available scopes
export const passportInstanceWithAllScopes = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});

// Passport instance with silent logout mode
export const passportInstanceWithSilentLogout = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
  logoutMode: 'silent',
});

// Passport instance with only the generic popup overlay disabled
export const passportInstanceWithGenericOverlayDisabled = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
  popupOverlayOptions: {
    disableGenericPopupOverlay: true, // Only disable generic
    disableBlockedPopupOverlay: false,
  },
});

// Passport instance with only the blocked popup overlay disabled
export const passportInstanceWithBlockedOverlayDisabled = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
  popupOverlayOptions: {
    disableGenericPopupOverlay: false,
    disableBlockedPopupOverlay: true, // Only disable blocked
  },
}); 