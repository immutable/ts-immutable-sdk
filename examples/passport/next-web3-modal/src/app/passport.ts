import { config, passport } from '@imtbl/sdk';

export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.PRODUCTION, // or config.Environment.SANDBOX
    publishableKey: '<YOUR_PUBLISHABLE_KEY>', // replace with your publishable API key from Hub
  },
  clientId: '<YOUR_CLIENT_ID>', // replace with your client ID from Hub
  redirectUri: 'http://localhost:3000/redirect', // replace with one of your redirect URIs from Hub
  logoutRedirectUri: 'http://localhost:3000/logout', // replace with one of your logout URIs from Hub
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
  popupOverlayOptions: {
    disableGenericPopupOverlay: false, // Set to true to disable the generic pop-up overlay
    disableBlockedPopupOverlay: false, // Set to true to disable the blocked pop-up overlay
  }
});
