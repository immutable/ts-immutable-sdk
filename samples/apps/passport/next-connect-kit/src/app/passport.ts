import { config, passport } from '@imtbl/sdk';

const PUBLISHABLE_KEY = 'pk_imapik-test-QytWbBMsazOvrCAc9VqA';
const CLIENT_ID = 'gwz9RhYzPghp6z3uciNAFYlDsuCFtJ6U';

export const PASSPORT_CONNECTOR_ID = 'com.immutable.passport';

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
