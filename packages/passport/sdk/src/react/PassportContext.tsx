/* eslint-disable @typescript-eslint/naming-convention */
import React, {
  createContext, useContext, useEffect, useMemo,
  useState,
} from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '../Passport';
import { PassportModuleConfiguration, UserProfile } from '../types';

type PassportContextType = {
  passportInstance: Passport;
  isLoggedIn: boolean;
  login: () => Promise<string[]>;
  logout: () => Promise<void>;
  loginWithoutWallet: () => Promise<UserProfile | null>;
  loginWithEthersjs: () => Promise<string[]>;
  isLoading: boolean;
  error: Error | null;
};

const PassportContext = createContext<PassportContextType>({
  passportInstance: {} as Passport,
  isLoggedIn: false,
  login: () => { throw new Error('login must be used within a PassportProvider'); },
  logout: () => { throw new Error('logout must be used within a PassportProvider'); },
  loginWithoutWallet: () => { throw new Error('loginWithoutWallet must be used within a PassportProvider'); },
  loginWithEthersjs: () => { throw new Error('loginWithEthersjs must be used within a PassportProvider'); },
  isLoading: false,
  error: null,
});

type PassportProviderProps = {
  config: PassportModuleConfiguration;
  children: React.ReactNode;
};

export function PassportProvider({ children, config }: PassportProviderProps) {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const passportInstance = new Passport(config);
  const v = useMemo(() => ({
    passportInstance,
    isLoggedIn,
    isLoading,
    error,
    login: async () => {
      try {
        setError(null);
        setIsLoading(true);
        const provider = passportInstance.connectEvm();
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setLoggedIn(true);
        return accounts;
      } catch (e: any) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
      return [];
    },
    logout: async () => {
      try {
        setError(null);
        setIsLoading(true);
        await passportInstance.logout();
        setLoggedIn(false);
      } catch (e: any) {
        setError(e);
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
      } catch (e: any) {
        setError(e);
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
        const provider = new Web3Provider(passportInstance.connectEvm());
        const accounts = await provider.send('eth_requestAccounts', []);
        setLoggedIn(true);
        return accounts;
      } catch (e: any) {
        setError(e);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
  }), [config, isLoggedIn]);

  return (
    <PassportContext.Provider value={v}>
      {children}
    </PassportContext.Provider>
  );
}

export function usePassport() {
  const c = useContext(PassportContext);
  if (!c) {
    throw new Error('usePassport must be used within a PassportProvider');
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
  const [userInfo, setUserInfo] = useState<Record<string, unknown> | null>(null);
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
