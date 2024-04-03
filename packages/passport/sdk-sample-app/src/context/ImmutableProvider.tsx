import React, {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import {
  createImmutableXConfiguration,
  IMXClient,
  ImmutableX,
  ImxModuleConfiguration,
} from '@imtbl/x-client';
import { Orderbook, OrderbookOverrides } from '@imtbl/orderbook';
import { Passport, PassportModuleConfiguration } from '@imtbl/passport';
import { Environment, ImmutableConfiguration, ModuleConfiguration } from '@imtbl/config';
import {
  AUDIENCE,
  LOGOUT_REDIRECT_URI,
  REDIRECT_URI,
  SILENT_LOGOUT_REDIRECT_URI,
  LOGOUT_MODE,
  SCOPE,
} from '@/config';
import { EnvironmentNames } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { ImxApiClients, createConfig } from '@imtbl/generated-clients';

const getSdkConfig = (environment: EnvironmentNames): ImxModuleConfiguration => {
  switch (environment) {
    case EnvironmentNames.PRODUCTION: {
      const baseConfig = new ImmutableConfiguration({ environment: Environment.PRODUCTION });
      return {
        baseConfig,
      };
    }
    case EnvironmentNames.SANDBOX: {
      const baseConfig = new ImmutableConfiguration({ environment: Environment.SANDBOX });
      return {
        baseConfig,
      };
    }
    case EnvironmentNames.DEV: {
      const baseConfig = new ImmutableConfiguration({ environment: Environment.SANDBOX });
      return {
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
      };
    }
    default: {
      throw new Error('Invalid environment');
    }
  }
};

const getPassportConfig = (environment: EnvironmentNames): PassportModuleConfiguration => {
  const sharedConfigurationValues = {
    scope: SCOPE,
    audience: AUDIENCE,
    redirectUri: REDIRECT_URI,
    logoutMode: LOGOUT_MODE,
    logoutRedirectUri: LOGOUT_MODE === 'silent'
      ? SILENT_LOGOUT_REDIRECT_URI
      : LOGOUT_REDIRECT_URI,
  };

  switch (environment) {
    case EnvironmentNames.PRODUCTION: {
      return {
        baseConfig: new ImmutableConfiguration({
          environment: Environment.PRODUCTION,
        }),
        clientId: 'PtQRK4iRJ8GkXjiz6xfImMAYhPhW0cYk',
        ...sharedConfigurationValues,
      };
    }
    case EnvironmentNames.SANDBOX: {
      return {
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        clientId: 'mjtCL8mt06BtbxSkp2vbrYStKWnXVZfo',
        ...sharedConfigurationValues,
      };
    }
    case EnvironmentNames.DEV: {
      const baseConfig = new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      });
      return {
        baseConfig,
        clientId: 'pCtSnHovRnPiQuBcFkXAnbCNqNVcDM3m',
        overrides: {
          authenticationDomain: 'https://auth.dev.immutable.com',
          magicPublishableApiKey: 'pk_live_4058236363130CA9',
          magicProviderId: 'C9odf7hU4EQ5EufcfgYfcBaT5V6LhocXyiPRhIjw2EY=',
          passportDomain: 'https://passport.dev.immutable.com',
          imxPublicApiDomain: 'https://api.dev.immutable.com',
          imxApiClients: new ImxApiClients(createConfig({
            basePath: 'https://api.dev.immutable.com',
          })),
          immutableXClient: new IMXClient(getSdkConfig(EnvironmentNames.DEV)),
          zkEvmRpcUrl: 'https://rpc.dev.immutable.com',
          relayerUrl: 'https://api.dev.immutable.com/relayer-mr',
          indexerMrBasePath: 'https://api.dev.immutable.com',
          orderBookMrBasePath: 'https://api.dev.immutable.com',
          passportMrBasePath: 'https://api.dev.immutable.com',
        },
        ...sharedConfigurationValues,
      };
    }
    default: {
      throw new Error('Invalid environment');
    }
  }
};

const getOrderbookConfig = (environment: EnvironmentNames): ModuleConfiguration<OrderbookOverrides> => {
  switch (environment) {
    case EnvironmentNames.PRODUCTION: {
      const baseConfig = new ImmutableConfiguration({ environment: Environment.PRODUCTION });
      return {
        baseConfig,
      };
    }
    case EnvironmentNames.SANDBOX: {
      const baseConfig = new ImmutableConfiguration({ environment: Environment.SANDBOX });
      return {
        baseConfig,
      };
    }
    case EnvironmentNames.DEV: {
      const baseConfig = new ImmutableConfiguration({ environment: Environment.SANDBOX });
      return {
        baseConfig,
        overrides: {
          seaportContractAddress: '0xbA22c310787e9a3D74343B17AB0Ab946c28DFB52',
          zoneContractAddress: '0x030a84161998972648e639bd0e2123b019e7DfE5',
          apiEndpoint: 'https://api.dev.immutable.com',
          chainName: 'imtbl-zkevm-devnet',
          jsonRpcProviderUrl: 'https://rpc.dev.immutable.com',
        },
      };
    }
    default: {
      throw new Error('Invalid environment');
    }
  }
};

const ImmutableContext = createContext<{
  passportClient: Passport,
  sdkClient: ImmutableX,
  orderbookClient: Orderbook,
  environment: EnvironmentNames,
  setEnvironment?:(environment: EnvironmentNames) => void;
}>({
      sdkClient: new ImmutableX(getSdkConfig(EnvironmentNames.DEV)),
      orderbookClient: new Orderbook(getOrderbookConfig(EnvironmentNames.DEV)),
      passportClient: new Passport(getPassportConfig(EnvironmentNames.DEV)),
      environment: EnvironmentNames.DEV,
    });

export function ImmutableProvider({
  children,
}: { children: JSX.Element | JSX.Element[] }) {
  const [environment, setEnvironment] = useLocalStorage(
    'IMX_PASSPORT_SAMPLE_ENVIRONMENT',
    useContext(ImmutableContext).environment,
  );
  const [sdkClient, setSdkClient] = useState<ImmutableX>(
    useContext(ImmutableContext).sdkClient,
  );
  const [orderbookClient, setOrderbookClient] = useState<Orderbook>(
    useContext(ImmutableContext).orderbookClient,
  );
  const [passportClient, setPassportClient] = useState<Passport>(
    useContext(ImmutableContext).passportClient,
  );

  useEffect(() => {
    setSdkClient(new ImmutableX(getSdkConfig(environment)));
    setOrderbookClient(new Orderbook(getOrderbookConfig(environment)));
    setPassportClient(new Passport(getPassportConfig(environment)));
  }, [environment]);

  const providerValues = useMemo(() => ({
    sdkClient,
    orderbookClient,
    passportClient,
    environment,
    setEnvironment,
  }), [sdkClient, orderbookClient, passportClient, environment, setEnvironment]);

  return (
    <ImmutableContext.Provider value={providerValues}>
      {children}
    </ImmutableContext.Provider>
  );
}

export function useImmutableProvider() {
  const {
    sdkClient,
    orderbookClient,
    passportClient,
    environment,
    setEnvironment,
  } = useContext(ImmutableContext);
  return {
    sdkClient,
    orderbookClient,
    passportClient,
    environment,
    setEnvironment,
  };
}
