"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { config, passport, checkout } from "@imtbl/sdk";
import { useSearchParams } from "next/navigation";
import { WalletEventType } from "@imtbl/checkout-sdk";
import useLocalStorage from "@imtbl/passport-sdk-sample-app/src/hooks/useLocalStorage";
import { Web3Provider } from "@ethersproject/providers";

type PassportContextType = {
  passportInstance?: passport.Passport;
  login?: () => void;
  logout?: () => void;
  loginWithoutWallet?: () => void;
  walletWidget: checkout.Widget<checkout.WidgetType> | undefined;
  backToGame: () => void;
};

const PassportContext = createContext<PassportContextType>({} as any);

export function PassportProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [environment, setEnvironment] = useLocalStorage(
    'IMX_CLIENT',
    {}
  );
  const [client, setClient] = useState<string | null>(null);

  const [passportInstance, setPassportInstance] = useState<
    passport.Passport | undefined
  >(undefined);
  const [walletWidget, setWalletWidget] = useState<checkout.Widget<checkout.WidgetType>>();

  useEffect(() => {
    if (client) return ;
    const clientId = searchParams.get("client");
    const redirectUri = searchParams.get("redirect_uri");
    if (clientId) {
      setEnvironment({
        clientId,
        redirectUri,
      });
      setClient(clientId);
    } else if (environment.clientId) {
      setClient(environment.clientId);
    }
  }, [searchParams]);
  useEffect(() => {
    const initializePassport = async () => {
      if (!passportInstance && client) {
        const instance = new passport.Passport({
          baseConfig: {
            environment: config.Environment.SANDBOX,
          },
          clientId: client,
          redirectUri: "http://localhost:3000/redirect", // replace with one of your redirect URIs from Hub
          logoutRedirectUri: "http://localhost:3000/logout", // replace with one of your logout URIs from Hub
          audience: "platform_api",
          scope: "openid offline_access email transact",
        });
        setPassportInstance(instance);
      }
    }
    initializePassport();
  }, [client]);

  useEffect(() => {
    if(!passportInstance) return;
    const initializeWallet = async () => {
      const checkoutSDK = new checkout.Checkout({
        baseConfig: {
          environment: config.Environment.SANDBOX,
        },
        passport: passportInstance,
      });
      const widgets = await checkoutSDK.widgets({
        config: {theme: checkout.WidgetTheme.DARK},
      });

      const walletProviderName = checkout.WalletProviderName.PASSPORT;
      const {provider} = await checkoutSDK.createProvider({walletProviderName});
      // const provider = passportInstance.connectEvm();
      const wallet = widgets.create(checkout.WidgetType.WALLET, {
        provider
      });

      wallet.addListener(WalletEventType.CLOSE_WIDGET, () => {
        {
          window.location.href = `${environment.redirectUri}?status=hell_from_widget`;
        }
      })
      setWalletWidget(wallet);
    }
    initializeWallet();
  }, [passportInstance]);

  const backToGame = useCallback(async () => {
    window.location.href = `${environment.redirectUri}?status=hell_from_widget`;
  }, [environment]);

  const login = useCallback(async () => {
    if (!passportInstance) return;
    const provider = passportInstance.connectEvm();
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    // window.alert(`accounts: ${accounts}`);
  }, [passportInstance]);

  const logout = useCallback(async () => {
    if (!passportInstance) return;
    await passportInstance.logout();
  }, [passportInstance]);

  const loginWithoutWallet = useCallback(async () => {
    if (!passportInstance) return;
    const profile: passport.UserProfile | null = await passportInstance.login();
    // window.alert(`profile: ${JSON.stringify(profile)}`);
  }, [passportInstance]);

  const providerValue = useMemo(
    () => ({
      passportInstance,
      login,
      logout,
      loginWithoutWallet,
      walletWidget,
      backToGame,
    }),
    [passportInstance, login, logout, loginWithoutWallet, walletWidget, backToGame]
  );

  return (
    <PassportContext.Provider value={providerValue}>
      {children}
    </PassportContext.Provider>
  );
}

export const usePassport = () => useContext(PassportContext);
