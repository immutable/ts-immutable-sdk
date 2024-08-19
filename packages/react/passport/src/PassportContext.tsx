/* eslint-disable @typescript-eslint/naming-convention */
import React, {
  createContext, useCallback, useContext, useEffect, useMemo,
  useState,
} from 'react';
import { setPassportClientId, track } from '@imtbl/metrics';
import {
  Passport, PassportModuleConfiguration,
  UserProfile,
} from '@imtbl/passport';

type ZkEvmReactContext = {
  passportInstance: Passport;
  isLoggedIn: boolean;
  isLoading: boolean;
  withWallet: boolean;
  error: Error | null;
  getIdToken: Passport['getIdToken'];
  getAccessToken: Passport['getAccessToken'];
  getAccounts: () => Promise<string[]>;
  getLinkedAddresses: Passport['getLinkedAddresses'];
  getProfile: () => Promise<UserProfile | undefined>;
  login: (options?: {
    useCachedSession?: boolean;
    anonymousId?: string;
    withoutWallet?: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loginCallback: () => Promise<void>;
  linkExternalWallet: Passport['linkExternalWallet'];
};

const PassportContext = createContext<ZkEvmReactContext | null>(null);

type ZkEvmReactProviderProps = {
  config: PassportModuleConfiguration;
  children: React.ReactNode;
};

export function ZkEvmReactProvider({ children, config }: ZkEvmReactProviderProps) {
  setPassportClientId(config.clientId);
  track('passport', 'ZkEvmProviderInitialised');
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [withWallet, setWithWallet] = useState(true);
  const passportInstance = new Passport(config);

  const checkLogggedIn = useCallback(async () => {
    const p = await passportInstance.login({
      useCachedSession: true,
    });
    setLoggedIn(!!p);
  }, [passportInstance]);

  useEffect(() => {
    checkLogggedIn();
  }, [config, passportInstance]);

  const v = useMemo(() => ({
    passportInstance,
    isLoggedIn,
    isLoading,
    error,
    withWallet,
    login: async (options?: {
      useCachedSession?: boolean;
      anonymousId?: string;
      withoutWallet?: boolean;
    }) => {
      try {
        setError(null);
        setIsLoading(true);
        setWithWallet(!options?.withoutWallet);
        await passportInstance.login({
          useCachedSession: !!options?.useCachedSession,
          anonymousId: options?.anonymousId,
        });

        if (!options?.withoutWallet) {
          const provider = passportInstance.connectEvm();
          await provider.request({ method: 'eth_requestAccounts' });
        }
        setLoggedIn(true);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    },
    logout: async () => {
      try {
        setError(null);
        setIsLoading(true);
        await passportInstance.logout();
        setWithWallet(false);
        setLoggedIn(false);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    },
    loginCallback: async () => {
      await passportInstance.loginCallback();
    },
    linkExternalWallet: passportInstance.linkExternalWallet.bind(passportInstance),
    getIdToken: async () => {
      setIsLoading(true);
      try {
        const idToken = await passportInstance.getIdToken();
        return idToken;
      } catch (e: any) {
        setError(e as Error);
        setLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
      return undefined;
    },
    getAccessToken: async () => {
      setIsLoading(true);
      try {
        const accessToken = await passportInstance.getAccessToken();
        return accessToken;
      } catch (e: any) {
        setError(e as Error);
        setLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
      return undefined;
    },
    getAccounts: async () => {
      setIsLoading(true);
      try {
        const provider = passportInstance.connectEvm();
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        return accounts;
      } catch (e: any) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
      return [];
    },
    getLinkedAddresses: async () => {
      setIsLoading(true);
      try {
        const linkedAddresses = await passportInstance.getLinkedAddresses();
        return linkedAddresses;
      } catch (e: any) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
      return [];
    },
    getProfile: async () => {
      setIsLoading(true);
      try {
        const profile = await passportInstance.getUserInfo();
        return profile;
      } catch (e: any) {
        setError(e as Error);
        setLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
      return undefined;
    },
  }), [config, isLoggedIn]);

  return (
    <PassportContext.Provider value={v}>
      {children}
    </PassportContext.Provider>
  );
}

export function usePassport(): ZkEvmReactContext {
  const c = useContext(PassportContext);
  if (!c) {
    throw new Error('usePassport must be used within a ZkEvmProvider');
  }
  return c;
}
