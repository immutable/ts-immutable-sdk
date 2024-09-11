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
import useLocalStorage from "@imtbl/passport-sdk-sample-app/src/hooks/useLocalStorage";
import { Passport, UserProfile } from "@imtbl/passport";
import { Environment } from "@imtbl/config";
import { useSearchParams } from "react-router-dom";

type PassportContextType = {
  passportInstance?: Passport;
  login?: () => void;
  logout?: () => void;
  loginWithoutWallet?: () => void;
  backToGame: () => void;
};

const PassportContext = createContext<PassportContextType>({} as any);

export function PassportProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [environment, setEnvironment] = useLocalStorage(
    'IMX_CLIENT',
    {}
  );
  const [client, setClient] = useState<string | null>(null);

  const [passportInstance, setPassportInstance] = useState<
    Passport | undefined
  >(undefined);

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
        const instance = new Passport({
          baseConfig: {
            environment: Environment.SANDBOX,
          },
          clientId: client,
          redirectUri: "http://localhost:3000/redirect",
          logoutRedirectUri: "http://localhost:3000/logout",
          audience: "platform_api",
          scope: "openid offline_access email transact",
        });
        setPassportInstance(instance);
      }
    }
    initializePassport();
  }, [client]);

  const backToGame = useCallback(async () => {
    if (!environment.redirectUri) return;
    window.location.href = `${environment.redirectUri}?status=hello_from_widget`;
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
    const profile: UserProfile | null = await passportInstance.login();
    // window.alert(`profile: ${JSON.stringify(profile)}`);
  }, [passportInstance]);

  const providerValue = useMemo(
    () => ({
      passportInstance,
      login,
      logout,
      loginWithoutWallet,
      backToGame,
    }),
    [passportInstance, login, logout, loginWithoutWallet, backToGame]
  );

  return (
    <PassportContext.Provider value={providerValue}>
      {children}
    </PassportContext.Provider>
  );
}

export const usePassport = () => useContext(PassportContext);
