'use client';

import React, {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import { Orderbook, OrderbookOverrides } from '@imtbl/orderbook';
import { Passport, PassportModuleConfiguration } from '@imtbl/passport';
import { Environment, ImmutableConfiguration, ModuleConfiguration } from '@imtbl/config';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
// Note: Session type is augmented in @imtbl/auth-next-client/types
import {
  AUDIENCE,
  POPUP_REDIRECT_URI,
  REDIRECT_URI,
  LOGOUT_REDIRECT_URI,
  SILENT_LOGOUT_REDIRECT_URI,
  LOGOUT_MODE,
  SCOPE,
} from '@/config';
import { EnvironmentNames } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';

import { BlockchainData, BlockchainDataModuleConfiguration } from '@imtbl/blockchain-data';

const getBlockchainDataConfig = (environment: EnvironmentNames): BlockchainDataModuleConfiguration => {
  switch (environment) {
    case EnvironmentNames.PRODUCTION: {
      const baseConfig = new ImmutableConfiguration({ environment: Environment.PRODUCTION });
      return {
        baseConfig,
      };
    }
    case EnvironmentNames.SANDBOX:
    case EnvironmentNames.DEFAULT: {
      const baseConfig = new ImmutableConfiguration({ environment: Environment.SANDBOX });
      return { baseConfig };
    }
    case EnvironmentNames.DEV: {
      const baseConfig = new ImmutableConfiguration({ environment: Environment.SANDBOX });
      return {
        baseConfig,
        overrides: {
          basePath: 'https://api.dev.immutable.com',
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
    popupRedirectUri: POPUP_REDIRECT_URI,
    redirectUri: REDIRECT_URI,
    logoutMode: LOGOUT_MODE,
    logoutRedirectUri: LOGOUT_MODE === 'silent'
      ? SILENT_LOGOUT_REDIRECT_URI
      : LOGOUT_REDIRECT_URI,
    forceScwDeployBeforeMessageSignature: true,
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
    case EnvironmentNames.SANDBOX:
    case EnvironmentNames.DEFAULT: {
      // DEFAULT uses sandbox client ID to match default auth
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
          magicProviderId: 'd196052b-8175-4a45-ba13-838a715d370f',
          passportDomain: 'https://passport.dev.immutable.com',
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
    case EnvironmentNames.SANDBOX:
    case EnvironmentNames.DEFAULT: {
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
  orderbookClient: Orderbook,
  blockchainData: BlockchainData,
  environment: EnvironmentNames,
  setEnvironment?:(environment: EnvironmentNames) => void;
}>({
      orderbookClient: new Orderbook(getOrderbookConfig(EnvironmentNames.DEV)),
      passportClient: new Passport(getPassportConfig(EnvironmentNames.DEV)),
      environment: EnvironmentNames.DEV,
      blockchainData: new BlockchainData(getBlockchainDataConfig(EnvironmentNames.DEV)),
    });

export function ImmutableProvider({
  children,
  session,
}: { children: JSX.Element | JSX.Element[]; session?: Session }) {
  const [environment, setEnvironment] = useLocalStorage(
    'IMX_PASSPORT_SAMPLE_ENVIRONMENT',
    useContext(ImmutableContext).environment,
  );
  const [orderbookClient, setOrderbookClient] = useState<Orderbook>(
    useContext(ImmutableContext).orderbookClient,
  );
  const [passportClient, setPassportClient] = useState<Passport>(
    useContext(ImmutableContext).passportClient,
  );

  const [blockchainData, setBlockchainData] = useState<BlockchainData>(
    useContext(ImmutableContext).blockchainData,
  );

  useEffect(() => {
    const passportInstance = new Passport(getPassportConfig(environment));
    Object.defineProperty(window, 'passport', {
      configurable: true,
      value: passportInstance,
    });
    setOrderbookClient(new Orderbook(getOrderbookConfig(environment)));
    setPassportClient(passportInstance);
    setBlockchainData(new BlockchainData(getBlockchainDataConfig(environment)));
  }, [environment]);

  const providerValues = useMemo(() => ({
    orderbookClient,
    passportClient,
    blockchainData,
    environment,
    setEnvironment,
  }), [orderbookClient, passportClient, blockchainData, environment, setEnvironment]);

  // Get the NextAuth base path for the current environment
  const authBasePath = useMemo(() => {
    switch (environment) {
      case EnvironmentNames.DEV:
        return '/api/auth/dev';
      case EnvironmentNames.PRODUCTION:
        return '/api/auth/prod';
      case EnvironmentNames.DEFAULT:
        return '/api/auth/default';
      default:
        return '/api/auth/sandbox';
    }
  }, [environment]);

  return (
    <ImmutableContext.Provider value={providerValues}>
      <SessionProvider session={session ?? null} basePath={authBasePath}>
        {children}
      </SessionProvider>
    </ImmutableContext.Provider>
  );
}

export function useImmutableProvider() {
  const {
    orderbookClient,
    passportClient,
    blockchainData,
    environment,
    setEnvironment,
  } = useContext(ImmutableContext);
  return {
    orderbookClient,
    passportClient,
    blockchainData,
    environment,
    setEnvironment,
  };
}
