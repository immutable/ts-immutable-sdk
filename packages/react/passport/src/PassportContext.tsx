/* eslint-disable @typescript-eslint/naming-convention */
import React, {
  createContext, useCallback, useContext, useEffect, useMemo,
  useState,
} from 'react';
import { setPassportClientId, track } from '@imtbl/metrics';
import {
  Passport,
  PassportModuleConfiguration,
  Provider,
  UserProfile,
  PassportExternalEvent,
} from '@imtbl/passport';

type ZkEvmReactContext = {
  passportInstance: Passport;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: Error | null;
  accessToken: string | undefined;
  idToken: string | undefined;
  profile: UserProfile | undefined;
  linkedAddresses: string[] | undefined;
  accounts: string[] | undefined;
  provider: Provider | undefined;
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
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [idToken, setIdToken] = useState<string | undefined>();
  const [profile, setProfile] = useState<UserProfile | undefined>();
  const [linkedAddresses, setLinkedAddresses] = useState<string[]>();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [provider, setProvider] = useState<Provider>();
  const passportInstance = useMemo(() => new Passport(config), [config]);
  const onLogin = useCallback(async () => {
    setLoggedIn(true);
    setIsLoading(true);
    setProvider(passportInstance.connectEvm());

    await Promise.all([passportInstance.getAccessToken().then((t) => {
      setAccessToken(t);
    }),
    passportInstance.getIdToken().then((t) => {
      setIdToken(t);
    }),
    passportInstance.getUserInfo().then((t) => {
      setProfile(t);
    }),
    passportInstance.getLinkedAddresses().then((t) => {
      setLinkedAddresses(t);
    }),
    withWallet ? passportInstance.connectEvm()
      .request({ method: 'eth_requestAccounts' })
      .then((t) => setAccounts(t || []))
      : Promise.resolve(),
    ]).catch((e) => setError(e as Error)).finally(() => setIsLoading(false));
  }, [withWallet, passportInstance]);

  const onLogout = useCallback(() => {
    setLoggedIn(false);
    setAccessToken(undefined);
    setIdToken(undefined);
    setProfile(undefined);
    setLinkedAddresses([]);
    setAccounts([]);
    setProvider(undefined);
  }, []);

  useEffect(() => {
    passportInstance.on(PassportExternalEvent.LOGGED_IN, onLogin);

    passportInstance.on(PassportExternalEvent.LOGGED_OUT, onLogout);
    return () => {
      passportInstance.removeListener(PassportExternalEvent.LOGGED_IN, onLogin);
      passportInstance.removeListener(PassportExternalEvent.LOGGED_OUT, onLogout);
    };
  }, []);

  const checkLogggedIn = useCallback(async () => {
    const p = await passportInstance.login({
      useCachedSession: true,
    });
    if (p) {
      onLogin();
    }
  }, [passportInstance]);

  useEffect(() => {
    checkLogggedIn();
  }, [config, passportInstance]);

  const v = useMemo(() => ({
    passportInstance,
    isLoggedIn,
    isLoading,
    error,
    accessToken,
    idToken,
    profile,
    linkedAddresses,
    accounts,
    provider,
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

        // if (!options?.withoutWallet) {
        //   const p = passportInstance.connectEvm();
        //   await p.request({ method: 'eth_requestAccounts' });
        // }
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
