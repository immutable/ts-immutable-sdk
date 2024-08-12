/* eslint-disable @typescript-eslint/naming-convention */
import React, {
  createContext, useContext, useEffect, useMemo,
  useState,
} from 'react';
import { Passport } from '../Passport';
import { PassportModuleConfiguration, UserProfile } from '../types';
import { Provider } from '../zkEvm/types';

type PassportContextType = {
  passportInstance: Passport;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: Error | null;
  accounts: string[];
  profile: UserProfile | null;
  passportProvider: Provider | null;
  login: (withoutWallet?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loginCallback: () => Promise<void>;
  linkExternalWallet: Passport['linkExternalWallet'];
};

const PassportContext = createContext<PassportContextType | null>(null);

type PassportProviderProps = {
  config: PassportModuleConfiguration;
  children: React.ReactNode;
};

export function ReactProvider({ children, config }: PassportProviderProps) {
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

  const v = useMemo(() => ({
    passportInstance,
    passportProvider,
    isLoggedIn,
    isLoading,
    accounts,
    profile,
    error,
    login: async (withoutWallet: boolean = false) => {
      try {
        setError(null);
        setIsLoading(true);
        if (withoutWallet) {
          const p = await passportInstance.login();
          setProfile(p);
          setLoggedIn(true);
        } else {
          const provider = getPassportProvider();
          const acc = await provider.request({ method: 'eth_requestAccounts' });
          setLoggedIn(true);
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
        setLoggedIn(false);
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

export function usePassport(): PassportContextType {
  const c = useContext(PassportContext);
  if (!c) {
    throw new Error('usePassport must be used within a ReactProvider');
  }
  return c;
}

export function useIdToken() {
  const { passportInstance, isLoading, isLoggedIn } = usePassport();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getIdToken = () => {
    if (isLoggedIn) {
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
    } else {
      setIdToken(null);
    }

    return () => {
      setIdToken(null);
    };
  };
  useEffect(getIdToken, [passportInstance, isLoggedIn]);
  return {
    idToken, isLoading: isLoading || loading, error, refetch: getIdToken,
  };
}

export function useAccessToken() {
  const { passportInstance, isLoading, isLoggedIn } = usePassport();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getAccessToken = () => {
    if (isLoggedIn) {
      setLoading(true);
      passportInstance
        .getAccessToken()
        .then((t) => setAccessToken(t || null))
        .catch((e) => setError(e))
        .finally(() => setLoading(false));
    } else {
      setAccessToken(null);
    }

    return () => {
      setAccessToken(null);
    };
  };
  useEffect(getAccessToken, [passportInstance, isLoggedIn]);
  return {
    accessToken, isLoading: isLoading || loading, error, refetch: getAccessToken,
  };
}

export function useLinkedAddresses() {
  const { passportInstance, isLoading, isLoggedIn } = usePassport();
  const [linkedAddresses, setLinkedAddresses] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getLinkedAddresses = () => {
    if (isLoggedIn) {
      setLoading(true);
      passportInstance
        .getLinkedAddresses()
        .then((t) => setLinkedAddresses(t || null))
        .catch((e) => setError(e))
        .finally(() => setLoading(false));
    } else {
      setLinkedAddresses(null);
    }

    return () => {
      setLinkedAddresses(null);
    };
  };
  useEffect(getLinkedAddresses, [passportInstance, isLoggedIn]);
  return {
    linkedAddresses, isLoading: isLoading || loading, error, refetch: getLinkedAddresses,
  };
}

export function useUserInfo() {
  const { passportInstance, isLoading, isLoggedIn } = usePassport();
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getUserInfo = () => {
    if (isLoggedIn) {
      setLoading(true);
      passportInstance
        .getUserInfo()
        .then((t) => setUserInfo(t || null))
        .catch((e) => setError(e))
        .finally(() => setLoading(false));
    } else {
      setUserInfo(null);
    }

    return () => {
      setUserInfo(null);
    };
  };
  useEffect(getUserInfo, [passportInstance, isLoggedIn]);
  return {
    userInfo, isLoading: isLoading || loading, error, refetch: getUserInfo,
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
