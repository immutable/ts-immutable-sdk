/* eslint-disable @typescript-eslint/naming-convention */
import React, {
  createContext, useContext, useEffect, useMemo,
  useState,
} from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '../Passport';
import { PassportModuleConfiguration, UserProfile } from '../types';
import { Provider } from '../zkEvm/types';

type PassportContextType = {
  passportInstance: Passport;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: Error | null;
  accounts: string[];
  passportProvider: Provider | null;
  web3Provider: Web3Provider | null;
  login: () => Promise<string[]>;
  logout: () => Promise<void>;
  loginWithoutWallet: () => Promise<UserProfile | null>;
  loginWithEthersjs: () => Promise<string[]>;
  loginCallback: () => Promise<void>;
};

const PassportContext = createContext<PassportContextType | null>(null);

type PassportProviderProps = {
  config: PassportModuleConfiguration;
  children: React.ReactNode;
};

export function PassportReactProvider({ children, config }: PassportProviderProps) {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [passportProvider, setPassportProvider] = useState<Provider | null>(null);
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | null>(null);
  const passportInstance = new Passport(config);

  const getPassportProvider = () => {
    if (passportProvider) return passportProvider;
    const p = passportInstance.connectEvm();
    setPassportProvider(p);
    return p;
  };
  const getWeb3Provider = () => {
    if (web3Provider) return web3Provider;
    const p = getPassportProvider();
    const w = new Web3Provider(p);
    setWeb3Provider(w);
    return w;
  };

  const v = useMemo(() => ({
    passportInstance,
    passportProvider,
    web3Provider,
    isLoggedIn,
    isLoading,
    accounts,
    error,
    login: async () => {
      try {
        setError(null);
        setIsLoading(true);
        setWeb3Provider(null);
        const provider = getPassportProvider();
        const acc = await provider.request({ method: 'eth_requestAccounts' });
        setLoggedIn(true);
        setAccounts(acc);
        return accounts;
      } catch (e) {
        setError(e as Error);
        setPassportProvider(null);
      } finally {
        setIsLoading(false);
      }
      return [];
    },
    logout: async () => {
      try {
        setError(null);
        setIsLoading(true);
        setPassportProvider(null);
        setWeb3Provider(null);
        await passportInstance.logout();
        setLoggedIn(false);
        setAccounts([]);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    },
    loginWithoutWallet: async () => {
      try {
        setError(null);
        setIsLoading(true);
        const profile = await passportInstance.login();
        setLoggedIn(true);
        return profile;
      } catch (e) {
        setError(e as Error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    loginWithEthersjs: async () => {
      try {
        setError(null);
        setIsLoading(true);
        // eslint-disable-next-line new-cap
        const provider = getWeb3Provider();
        const acc = await provider.send('eth_requestAccounts', []);
        setLoggedIn(true);
        return acc;
      } catch (e) {
        setError(e as Error);
        setPassportProvider(null);
        setWeb3Provider(null);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    loginCallback: async () => {
      await passportInstance.loginCallback();
    },
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
    throw new Error('usePassport must be used within a PassportReactProvider');
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
        .then((t) => setIdToken(t || null))
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

export function useWeb3Provider() {
  const { web3Provider, isLoading, error } = usePassport();
  return { web3Provider, isLoading, error };
}
