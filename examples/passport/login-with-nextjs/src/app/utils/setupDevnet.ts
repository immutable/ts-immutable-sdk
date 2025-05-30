import { passport, config } from '@imtbl/sdk';
import { ImmutableX, createImmutableXConfiguration } from '@imtbl/x-client';

const baseConfig = new config.ImmutableConfiguration({
  environment: config.Environment.SANDBOX,
});

export const passportInstance = new passport.Passport({
  baseConfig,
  clientId: process.env.NEXT_PUBLIC_DEVNET_CLIENT_ID || '<YOUR_CLIENT_ID>', // replace with your client ID from Hub
  redirectUri: 'http://localhost:3000/auth/callback', // replace with one of your redirect URIs from Hub
  logoutRedirectUri: 'http://localhost:3000/auth/logout', // replace with one of your logout URIs from Hub
  audience: 'platform_api',
  scope: 'openid offline_access profile email transact',
  overrides: {
    authenticationDomain: 'https://auth.dev.immutable.com',
    magicPublishableApiKey: 'pk_live_4058236363130CA9', // Public key
    magicProviderId: 'C9odf7hU4EQ5EufcfgYfcBaT5V6LhocXyiPRhIjw2EY=', // Public key
    passportDomain: 'https://passport.dev.immutable.com',
    imxPublicApiDomain: 'https://api.dev.immutable.com',
    immutableXClient: new ImmutableX({
      baseConfig,
      overrides: {
        immutableXConfig: createImmutableXConfiguration({
          baseConfig,
          basePath: 'https://api.dev.x.immutable.com',
          chainID: 5,
          coreContractAddress: '0xd05323731807A35599BF9798a1DE15e89d6D6eF1',
          registrationContractAddress: '0x7EB840223a3b1E0e8D54bF8A6cd83df5AFfC88B2',
        }),
      },
    }),
    zkEvmRpcUrl: 'https://rpc.dev.immutable.com',
    relayerUrl: 'https://api.dev.immutable.com/relayer-mr',
    indexerMrBasePath: 'https://api.dev.immutable.com',
    orderBookMrBasePath: 'https://api.dev.immutable.com',
    passportMrBasePath: 'https://api.dev.immutable.com',
  },
});

