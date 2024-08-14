/* eslint-disable @typescript-eslint/naming-convention */
import React, {
  createContext, useCallback, useContext, useEffect, useMemo,
  useState,
} from 'react';
import { setPassportClientId, track } from '@imtbl/metrics';
import {
  Passport, PassportModuleConfiguration, UserProfile, Provider,
} from '@imtbl/passport';

type ZkEvmReactContext = {
  passportInstance: Passport;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: Error | null;
  accounts: string[];
  profile: UserProfile | null;
  passportProvider: Provider | null;
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
  const [accounts, setAccounts] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [passportProvider, setPassportProvider] = useState<Provider | null>(null);
  const passportInstance = new Passport(config);

  const getPassportProvider = () => {
    if (passportProvider) return passportProvider;
    const p = passportInstance.connectEvm();
    setPassportProvider(p);
    return p;
  };

  const checkLogggedIn = useCallback(async () => {
    const p = await passportInstance.login({
      useCachedSession: true,
    });
    setLoggedIn(!!p);
  }, [passportInstance]);

  useEffect(() => {
    checkLogggedIn();
  }, [config, passportInstance, accounts, profile]);

  const v = useMemo(() => ({
    passportInstance,
    passportProvider,
    isLoggedIn,
    isLoading,
    accounts,
    profile,
    error,
    login: async (options?: {
      useCachedSession?: boolean;
      anonymousId?: string;
      withoutWallet?: boolean;
    }) => {
      try {
        setError(null);
        setIsLoading(true);
        const p = await passportInstance.login({
          useCachedSession: !!options?.useCachedSession,
          anonymousId: options?.anonymousId,
        });
        setProfile(p);

        if (!options?.withoutWallet) {
          const provider = getPassportProvider();
          const acc = await provider.request({ method: 'eth_requestAccounts' });
          setAccounts(acc);
        }
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
        setPassportProvider(null);
        setAccounts([]);
        setProfile(null);
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

export function useIdToken() {
  const { passportInstance, isLoading } = usePassport();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getIdToken = () => {
    setLoading(true);
    passportInstance
      .getIdToken()
      .then((t) => {
        setIdToken(t || null);
        if (!t) {
          setError(new Error('No ID Token'));
        }
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  };
  useEffect(getIdToken, [passportInstance]);
  return {
    idToken, isLoading: isLoading || loading, error,
  };
}

export function useAccessToken() {
  const { passportInstance, isLoading } = usePassport();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getAccessToken = () => {
    setLoading(true);
    passportInstance
      .getAccessToken()
      .then((t) => setAccessToken(t || null))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  };
  useEffect(getAccessToken, [passportInstance]);
  return {
    accessToken, isLoading: isLoading || loading, error,
  };
}

export function useLinkedAddresses() {
  const { passportInstance, isLoading } = usePassport();
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
  useEffect(getLinkedAddresses, [passportInstance]);
  return {
    linkedAddresses, isLoading: isLoading || loading, error,
  };
}

export function useUserInfo() {
  const { passportInstance, isLoading } = usePassport();
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getUserInfo = () => {
    setLoading(true);
    passportInstance
      .getUserInfo()
      .then((t) => setUserInfo(t || null))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  };
  useEffect(getUserInfo, [passportInstance]);
  return {
    userInfo, isLoading: isLoading || loading, error,
  };
}

export function useAccounts() {
  const { accounts, isLoading, error } = usePassport();
  return { accounts, isLoading, error };
}

export function usePassportProvider() {
  const { passportProvider, isLoading, error } = usePassport();
  return { passportProvider, isLoading, error };
}

export function useProfile() {
  const { profile, isLoading, error } = usePassport();
  return { profile, isLoading, error };
}
