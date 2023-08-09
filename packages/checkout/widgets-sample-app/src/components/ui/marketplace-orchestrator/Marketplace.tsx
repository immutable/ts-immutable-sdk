import {
  CheckoutWidgets,
  WidgetTheme,
  UpdateConfig,
  CheckoutWidgetsConfig,
} from '@imtbl/checkout-widgets';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { MainPage } from './MainPage';
import { useEffect, useMemo } from 'react';
import { WidgetProvider } from './WidgetProvider';
import { Networks, Passport } from '@imtbl/passport';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import { Config } from '@imtbl/core-sdk';

export const baseConfig = new ImmutableConfiguration({environment: Environment.SANDBOX})
export const passportModuleConfig = {
  baseConfig,
  clientId: 'FgazXVH4DAXm5tTTPqpyZa70vUaYhwja',
  logoutRedirectUri: 'http://localhost:3000/marketplace-orchestrator',
  redirectUri: 'http://localhost:3000/marketplace-orchestrator/login/callback',
  scope: 'openid offline_access email transact',
  audience: 'platform_api',
  // overrides: {
  //   network: Networks.SANDBOX,
  //   authenticationDomain: 'https://auth.dev.immutable.com',
  //   magicPublishableApiKey: 'pk_live_4058236363130CA9',
  //   magicProviderId: 'C9odf7hU4EQ5EufcfgYfcBaT5V6LhocXyiPRhIjw2EY=',
  //   passportDomain: 'https://passport.dev.immutable.com',
  //   imxPublicApiDomain: 'https://api.dev.immutable.com',
  //   immutableXClient: new ImmutableXClient({
  //     baseConfig,
  //     overrides: {
  //       immutableXConfig: Config.createConfig({
  //         basePath: 'https://api.dev.x.immutable.com',
  //         chainID: 5,
  //         coreContractAddress: '0xd05323731807A35599BF9798a1DE15e89d6D6eF1',
  //         registrationContractAddress: '0x7EB840223a3b1E0e8D54bF8A6cd83df5AFfC88B2',
  //       })
  //     },
  //   }),
  //   zkEvmRpcUrl: 'https://zkevm-rpc.dev.x.immutable.com',
  //   zkEvmChainId: 'eip155:13433',
  //   relayerUrl: 'https://api.dev.immutable.com/relayer-mr',
  //   indexerMrBasePath: 'https://indexer-mr.dev.imtbl.com',
  //   orderBookMrBasePath: 'https://order-book-mr.dev.imtbl.com',
  //   passportMrBasePath: 'https://api.dev.immutable.com',
  // },
}

export const Marketplace = () => {
  const passport = useMemo(() => new Passport(passportModuleConfig), []);
  useEffect(() => {
    const widgetsConfig: CheckoutWidgetsConfig = {
      theme: WidgetTheme.DARK,
      environment: Environment.SANDBOX,
      // TODO https://immutable.atlassian.net/browse/WT-1509
      // isOnRampEnabled: true,
      isBridgeEnabled: true,
      isSwapEnabled: true,
    };

    CheckoutWidgets(widgetsConfig);
  
    UpdateConfig(widgetsConfig);
  },[]);

  return (
    <WidgetProvider>
      <MainPage passport={passport} />
    </WidgetProvider>
  );
};
