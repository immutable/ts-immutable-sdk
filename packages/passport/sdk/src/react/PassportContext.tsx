/* eslint-disable @typescript-eslint/naming-convention */
import React, {
  ReactNode, createContext, useEffect, useMemo,
} from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '../Passport';
import { PassportModuleConfiguration } from '../types';

type PassportContextType = Passport | null;

export const PassportContext = createContext<PassportContextType>(null);

type PassportProviderProps = {
  config: PassportModuleConfiguration;
  children: ReactNode;
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
  const c = React.useContext(PassportContext);
  if (!c) {
    throw new Error('usePassport must be used within a PassportProvider');
  }
  return c;
}

// eslint-disable-next-line @typescript-eslint/comma-dangle
const useEffectAsync = <T,>(
  effect: Promise<T>,
  deps: React.DependencyList,
) => {
  const [data, setData] = React.useState<T | null>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    effect.then(setData).catch(setError).finally(() => setLoading(false));
  }, deps);

  return { data, loading, error };
};

export function useLogin() {
  const passport = usePassport();
  const provider = passport.connectEvm();
  const { data, loading, error } = useEffectAsync<string[]>(
    provider.request({ method: 'eth_requestAccounts' }),
    [provider],
  );

  return { accounts: data, loading, error };
}

export function useLogout() {
  const passport = usePassport();
  const { loading, error } = useEffectAsync(
    passport.logout(),
    [passport],
  );

  return { loading, error };
}

export function useLoginWithoutWallet() {
  const passport = usePassport();
  const { data, loading, error } = useEffectAsync(
    passport.login(),
    [passport],
  );

  return { profile: data, loading, error };
}

type Constructor<T> = new (...args: any[]) => T;
export function useLoginWithEthersjs(ctor: Constructor<Web3Provider>) {
  const passport = usePassport();
  const provider = passport.connectEvm();
  const { data, loading, error } = useEffectAsync(
    // eslint-disable-next-line new-cap
    new ctor(provider).send('eth_requestAccounts', []),
    [provider],
  );

  return { accounts: data, loading, error };
}

export function useIdToken() {
  const passport = usePassport();
  const { data, loading, error } = useEffectAsync(
    passport.getIdToken(),
    [passport],
  );

  return { idToken: data, loading, error };
}

export function useAccessToken() {
  const passport = usePassport();
  const { data, loading, error } = useEffectAsync(
    passport.getAccessToken(),
    [passport],
  );

  return { accessToken: data, loading, error };
}

export function useLinkedAddresses() {
  const passport = usePassport();
  const { data, loading, error } = useEffectAsync(
    passport.getLinkedAddresses(),
    [passport],
  );

  return { linkedAddresses: data, loading, error };
}

export function useUserInfo() {
  const passport = usePassport();
  const { data, loading, error } = useEffectAsync(
    passport.getUserInfo(),
    [passport],
  );

  return { userInfo: data, loading, error };
}
