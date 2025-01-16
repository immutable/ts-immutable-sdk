import { config, passport } from '@imtbl/sdk';

// #doc passport-silent-instance
export const passportInstance = new passport.Passport({
    baseConfig: {
      environment: config.Environment.SANDBOX, // or config.Environment.SANDBOX
      publishableKey:
        process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>', // replace with your publishable API key from Hub
    },
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>', // replace with your client ID from Hub
    redirectUri: 'http://localhost:3000/redirect', // replace with one of your redirect URIs from Hub
    logoutMode: 'silent',
    logoutRedirectUri: 'http://localhost:3000/silent-logout', // replace with one of your logout URIs from Hub
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
  });
// #enddoc passport-silent-instance
