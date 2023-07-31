import { createContext, useCallback, useContext, useState } from "react";
import {
  Provider,
  Passport,
  UserProfile,
  PassportModuleConfiguration,
  Networks,
} from "@imtbl/passport";
import { ImmutableConfiguration, Environment } from "@imtbl/config";
import { Config } from "@imtbl/core-sdk";
import { ImmutableXClient } from "@imtbl/immutablex-client";

export enum EnvironmentNames {
  DEV = "dev",
  SANDBOX = "sandbox",
  PRODUCTION = "production",
}

const getCoreSdkConfig = (environment: EnvironmentNames) => {
  switch (environment) {
    case EnvironmentNames.PRODUCTION: {
      return Config.PRODUCTION;
    }
    case EnvironmentNames.SANDBOX: {
      return Config.SANDBOX;
    }
    case EnvironmentNames.DEV: {
      return Config.createConfig({
        basePath: "https://api.dev.x.immutable.com",
        chainID: 5,
        coreContractAddress: "0xd05323731807A35599BF9798a1DE15e89d6D6eF1",
        registrationContractAddress:
          "0x7EB840223a3b1E0e8D54bF8A6cd83df5AFfC88B2",
      });
    }
    default: {
      throw new Error("Invalid environment");
    }
  }
};

const getPassportConfig = (
  environment: EnvironmentNames
): PassportModuleConfiguration => {
  const sharedConfigurationValues = {
    redirectUri: "http://localhost:3000/login",
    logoutRedirectUri: "http://localhost:3000",
    audience: "platform_api",
    scope: "openid offline_access email transact",
  };

  switch (environment) {
    case EnvironmentNames.PRODUCTION: {
      return {
        baseConfig: new ImmutableConfiguration({
          environment: Environment.PRODUCTION,
        }),
        clientId: "KhU9w2QYZa07IBRO03vnUxBTnaH3MQIR",
        ...sharedConfigurationValues,
      };
    }
    case EnvironmentNames.SANDBOX: {
      return {
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        clientId: "KhU9w2QYZa07IBRO03vnUxBTnaH3MQIR",
        ...sharedConfigurationValues,
      };
    }
    case EnvironmentNames.DEV: {
      const baseConfig = new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      });
      return {
        baseConfig,
        clientId: "tPHyz14V14SyQTO2qA2Rm6nFeUhUoGe2",
        overrides: {
          network: Networks.SANDBOX,
          authenticationDomain: "https://auth.dev.immutable.com",
          magicPublishableApiKey: "pk_live_4058236363130CA9",
          magicProviderId: "C9odf7hU4EQ5EufcfgYfcBaT5V6LhocXyiPRhIjw2EY=",
          passportDomain: "https://passport.dev.immutable.com",
          imxPublicApiDomain: "https://api.dev.immutable.com",
          immutableXClient: new ImmutableXClient({
            baseConfig,
            overrides: {
              immutableXConfig: getCoreSdkConfig(EnvironmentNames.DEV),
            },
          }),
          zkEvmRpcUrl: "https://zkevm-rpc.dev.x.immutable.com",
          zkEvmChainId: "eip155:13423",
          relayerUrl: "https://api.dev.immutable.com/relayer-mr",
          indexerMrBasePath: "https://indexer-mr.dev.imtbl.com",
          orderBookMrBasePath: "https://order-book-mr.dev.imtbl.com",
          passportMrBasePath: "https://api.dev.immutable.com",
        },
        ...sharedConfigurationValues,
      };
    }
    default: {
      throw new Error("Invalid environment");
    }
  }
};

const devConfig = Config.createConfig({
  basePath: "https://api.dev.x.immutable.com",
  chainID: 5,
  coreContractAddress: "0xd05323731807A35599BF9798a1DE15e89d6D6eF1",
  registrationContractAddress: "0x7EB840223a3b1E0e8D54bF8A6cd83df5AFfC88B2",
});

const passport = new Passport(getPassportConfig(EnvironmentNames.DEV));

const PassportContext = createContext<{
  connect: () => Promise<void>;
  connectSilent: () => Promise<void>;
  handleRedirectCallback: () => void;
  logout: () => void;
  getUserInfo: () => Promise<UserProfile | undefined>;
  sendTx: (to: string, data: string) => Promise<any>;
  call: (to: string, data: string) => Promise<any>;
}>({
  connect: () => Promise.resolve(),
  connectSilent: () => Promise.resolve(),
  handleRedirectCallback: () => undefined,
  logout: () => undefined,
  getUserInfo: () => Promise.resolve(undefined),
  sendTx: (_to: string, _data: string) => Promise.resolve(undefined),
  call: (_to: string, _data: string) => Promise.resolve(undefined),
});

export function PassportProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  const [zkEvmProvider, setZkEvmProvider] = useState<Provider | undefined>();

  const connect = useCallback(async () => {
    await passport?.connectImx().catch((error) => {
      console.log(error);
    });
    // @ts-ignore TODO ID-926 Remove once method is public
    setZkEvmProvider(passport?.connectEvm());
  }, [setZkEvmProvider]);

  const connectSilent = useCallback(async () => {
    await passport?.connectImxSilent().catch((error) => {
      console.log(error);
    });
    // @ts-ignore TODO ID-926 Remove once method is public
    setZkEvmProvider(passport?.connectEvm());
  }, [setZkEvmProvider]);

  const handleRedirectCallback = useCallback(async () => {
    await passport?.loginCallback();
  }, []);

  const logout = useCallback(async () => {
    await passport?.logout();
  }, []);

  const getUserInfo = useCallback(async () => {
    return await passport?.getUserInfo();
  }, []);

  const sendTx = useCallback(
    async (to: string, data: string) => {
      await zkEvmProvider?.request({ method: "eth_requestAccounts" });
      return await zkEvmProvider?.request({
        method: "eth_sendTransaction",
        params: [{
          "to": to,
          "data": data,
          "gas": "0x76c0",
          "gasPrice": "0x9184e72a000",
          // "nonce": "0x11",
        }, "latest"]
      });
    },
    [zkEvmProvider]
  );

  const call = useCallback(
    async (to: string, data: string) => {
      return await zkEvmProvider?.request({
        method: "eth_call",
        params: [{
          "to": to,
          "data": data,
        }, "latest"]
      });
    },
    [zkEvmProvider]
  );

  return (
    <PassportContext.Provider
      value={{
        connect,
        connectSilent,
        handleRedirectCallback,
        logout,
        getUserInfo,
        sendTx,
        call,
      }}
    >
      {children}
    </PassportContext.Provider>
  );
}

export function usePassportProvider() {
  return useContext(PassportContext);
}
