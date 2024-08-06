/* eslint-disable @typescript-eslint/naming-convention */
import React, {
  createContext, useContext, useMemo,
  useState,
} from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '../Passport';
import { PassportModuleConfiguration } from '../types';

type PassportContextType = Passport | null;

export const PassportContext = createContext<PassportContextType>(null);

type PassportProviderProps = {
  config: PassportModuleConfiguration;
  children: React.ReactNode;
};

export function PassportProvider({ children, config }: PassportProviderProps) {
  const v = useMemo(() => new Passport(config), [config]);
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

// eslint-disable-next-line @typescript-eslint/comma-dangle
const useEffectAsync = <T,>(
  effect: () => Promise<T>,
) => {
  const [data, setData] = useState<T | null>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const action = async () => {
    setLoading(true);
    try {
      const d = await effect();
      setData(d);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return {
    data, loading, error, action,
  };
};

// eslint-disable-next-line @typescript-eslint/comma-dangle
const useValueAsync = <T,>(
  effect: Promise<T>,
) => {
  const {
    data, loading, error, action,
  } = useEffectAsync(() => effect);

  action();

  return { data, loading, error };
};

export function useLogin() {
  const passport = usePassport();

  const {
    data, loading, error, action,
  } = useEffectAsync(async () => {
    const provider = passport.connectEvm();
    return await provider.request({ method: 'eth_requestAccounts' });
  });

  return {
    accounts: data, loading, error, login: action,
  };
}

export function useLogout() {
  const passport = usePassport();
  const {
    data,
    loading,
    error,
    action,
  } = useEffectAsync(
    () => passport.logout(),
  );

  return {
    profile: data, loading, error, logout: action,
  };
}

export function useLoginWithoutWallet() {
  const passport = usePassport();

  const {
    data, loading, error, action,
  } = useEffectAsync(
    () => passport.login(),
  );

  return {
    profile: data, loading, error, login: action,
  };
}

type Constructor<T> = new (...args: any[]) => T;
export function useLoginWithEthersjs(ctor: Constructor<Web3Provider>) {
  const passport = usePassport();

  const {
    data, loading, error, action,
  } = useEffectAsync(async () => {
    const provider = passport.connectEvm();
    // eslint-disable-next-line new-cap
    return await new ctor(provider).send('eth_requestAccounts', []);
  });

  return {
    accounts: data, loading, error, login: action,
  };
}

export function useIdToken() {
  const passport = usePassport();
  const { data, loading, error } = useValueAsync(
    passport.getIdToken(),
  );

  return { idToken: data, loading, error };
}

export function useAccessToken() {
  const passport = usePassport();
  const { data, loading, error } = useValueAsync(
    passport.getAccessToken(),
  );

  return { accessToken: data, loading, error };
}

export function useLinkedAddresses() {
  const passport = usePassport();
  const { data, loading, error } = useValueAsync(
    passport.getLinkedAddresses(),
  );

  return { linkedAddresses: data, loading, error };
}

export function useUserInfo() {
  const passport = usePassport();
  const { data, loading, error } = useValueAsync(
    passport.getUserInfo(),
  );

  return { userInfo: data, loading, error };
}
