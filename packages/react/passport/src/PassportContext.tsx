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
    getIdToken: passportInstance.getIdToken.bind(passportInstance),
    getAccessToken: passportInstance.getAccessToken.bind(passportInstance),
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

export function useLinkedAddresses() {
  const { passportInstance, isLoading, isLoggedIn } = usePassport();
  const [linkedAddresses, setLinkedAddresses] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getLinkedAddresses = () => {
    setLoading(true);
    passportInstance
      .getLinkedAddresses()
      .then((t) => setLinkedAddresses(t || null))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  };
  useEffect(getLinkedAddresses, [passportInstance, isLoggedIn]);
  return {
    linkedAddresses, isLoading: isLoading || loading, error,
  };
}

export function useProfile() {
  const { passportInstance, isLoading, isLoggedIn } = usePassport();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getProfile = () => {
    setLoading(true);
    passportInstance
      .getUserInfo()
      .then((t) => setProfile(t || null))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  };
  useEffect(getProfile, [passportInstance, isLoggedIn]);
  return {
    profile, isLoading: isLoading || loading, error,
  };
}

export function useAccounts() {
  const {
    passportInstance, isLoading, isLoggedIn, withWallet,
  } = usePassport();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getAccounts = () => {
    if (!passportInstance || !withWallet || !isLoggedIn) return;
    setLoading(true);
    passportInstance.connectEvm()
      .request({ method: 'eth_requestAccounts' })
      .then((t) => setAccounts(t || []))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  };
  useEffect(getAccounts, [passportInstance, isLoggedIn]);
  return {
    accounts, isLoading: isLoading || loading, error,
  };
}

export function usePassportProvider() {
  const { passportInstance } = usePassport();
  return passportInstance.connectEvm();
}
