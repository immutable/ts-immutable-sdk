import { config, passport } from '@imtbl/sdk';

const PUBLISHABLE_KEY = 'PUBLISHABLE_KEY';
const CLIENT_ID = 'CLIENT_ID';

export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.PRODUCTION,
    publishableKey: PUBLISHABLE_KEY,
  },
  clientId: CLIENT_ID,
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});
