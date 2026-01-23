import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { IMXProvider } from '@imtbl/x-provider';
import {
  LinkedWallet, LinkWalletParams, Provider, UserProfile, MarketingConsentStatus, EvmChain,
} from '@imtbl/passport';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useStatusProvider } from '@/context/StatusProvider';
import { EnvironmentNames } from '@/types';
import { SequenceProvider, ZkEvmProvider } from '@imtbl/wallet';

const PassportContext = createContext<{
  imxProvider: IMXProvider | undefined;
  zkEvmProvider: ZkEvmProvider | undefined;
  arbitrumProvider: SequenceProvider | undefined;
  defaultWalletProvider: ZkEvmProvider | undefined;
  activeZkEvmProvider: ZkEvmProvider | undefined;
  activeZkEvmAccount: string;
  isSandboxEnvironment: boolean;
  setDefaultWalletProvider: (provider?: ZkEvmProvider) => void;
  connectImx:() => void;
  connectZkEvm: () => void;
  connectArbitrum: () => void;
  logout: () => void;
  login: () => void;
  popupRedirect: () => void;
  getIdToken: () => Promise<string | undefined>;
  getAccessToken: () => Promise<string | undefined>;
  getUserInfo: () => Promise<UserProfile | undefined>;
  getLinkedAddresses: () => Promise<string[] | undefined>;
  linkWallet: (params: LinkWalletParams) => Promise<LinkedWallet | undefined>;
  popupRedirectGoogle: () => void;
  popupRedirectApple: () => void;
  popupRedirectFacebook: () => void;
  loginGoogle: () => void;
  loginApple: () => void;
  loginFacebook: () => void;
}>({
      imxProvider: undefined,
      zkEvmProvider: undefined,
      arbitrumProvider: undefined,
      defaultWalletProvider: undefined,
      activeZkEvmProvider: undefined,
      activeZkEvmAccount: '',
      setDefaultWalletProvider: () => undefined,
      isSandboxEnvironment: false,
      connectImx: () => undefined,
      connectZkEvm: () => undefined,
      connectArbitrum: () => undefined,
      logout: () => undefined,
      login: () => Promise.resolve(undefined),
      popupRedirect: () => Promise.resolve(undefined),
      getIdToken: () => Promise.resolve(undefined),
      getAccessToken: () => Promise.resolve(undefined),
      getUserInfo: () => Promise.resolve(undefined),
      getLinkedAddresses: () => Promise.resolve(undefined),
      linkWallet: () => Promise.resolve(undefined),
      popupRedirectGoogle: () => undefined,
      popupRedirectApple: () => undefined,
      popupRedirectFacebook: () => undefined,
      loginGoogle: () => undefined,
      loginApple: () => undefined,
      loginFacebook: () => undefined,
    });

export function PassportProvider({
  children,
}: { children: JSX.Element | JSX.Element[] }) {
  const [imxProvider, setImxProvider] = useState<IMXProvider | undefined>();
  const [zkEvmProvider, setZkEvmProvider] = useState<ZkEvmProvider | undefined>();
  const [arbitrumProvider, setArbitrumProvider] = useState<SequenceProvider | undefined>();
  const [defaultWalletProvider, setDefaultWalletProvider] = useState<ZkEvmProvider | undefined>();
  const [activeZkEvmAccount, setActiveZkEvmAccount] = useState<string>('');

  const { addMessage, setIsLoading } = useStatusProvider();
  const { passportClient, environment } = useImmutableProvider();
  const isSandboxEnvironment = environment === EnvironmentNames.SANDBOX;
  // `zkEvmProvider` is initialised using Passport package. 
  // `defaultWalletProvider` is created by connectWallet(), which includes a default auth instance underneath.
  // In sandbox environment, we allow testing the default wallet provider because the 
  // conenectWallet works with testnet and sandbox env when no arguements are provided.
  const activeZkEvmProvider = isSandboxEnvironment
    ? (defaultWalletProvider || zkEvmProvider)
    : zkEvmProvider;

  const connectImx = useCallback(async () => {
    try {
      setIsLoading(true);
      const provider = await passportClient.connectImx();
      if (provider) {
        setImxProvider(provider);
        addMessage('ConnectImx', 'Connected');
      } else {
        addMessage('ConnectImx', 'Failed to connect');
      }
    } catch (err) {
      addMessage('ConnectImx', err);
    } finally {
      setIsLoading(false);
    }
  }, [passportClient, setIsLoading, addMessage]);

  const connectZkEvm = useCallback(async () => {
    setIsLoading(true);
    const provider = await passportClient.connectEvm() as ZkEvmProvider;
    if (provider) {
      setZkEvmProvider(provider);
      addMessage('ConnectZkEvm', 'Connected');
    } else {
      addMessage('ConnectZkEvm', 'Failed to connect');
    }
    setIsLoading(false);
  }, [passportClient, setIsLoading, addMessage]);

  const connectArbitrum = useCallback(async () => {
    setIsLoading(true);
    try {
      const provider = await passportClient.connectEvm({ chain: EvmChain.ARBITRUM_ONE, announceProvider: true }) as SequenceProvider;
      if (provider) {
        setArbitrumProvider(provider);
        addMessage('ConnectArbitrum', 'Connected');
      } else {
        addMessage('ConnectArbitrum', 'Failed to connect');
      }
    } catch (err) {
      addMessage('ConnectArbitrum', err);
    } finally {
      setIsLoading(false);
    }
  }, [passportClient, setIsLoading, addMessage]);

  const getIdToken = useCallback(async () => {
    setIsLoading(true);
    const idToken = await passportClient.getIdToken();
    addMessage('Get ID token', idToken);
    setIsLoading(false);

    return idToken;
  }, [passportClient, setIsLoading, addMessage]);

  const getAccessToken = useCallback(async () => {
    setIsLoading(true);
    const accessToken = await passportClient.getAccessToken();
    addMessage('Get Access token', accessToken);
    setIsLoading(false);

    return accessToken;
  }, [passportClient, setIsLoading, addMessage]);

  const getUserInfo = useCallback(async () => {
    setIsLoading(true);
    const userInfo = await passportClient.getUserInfo();
    addMessage('Get User Info', userInfo);
    setIsLoading(false);

    return userInfo;
  }, [passportClient, setIsLoading, addMessage]);

  const getLinkedAddresses = useCallback(async () => {
    setIsLoading(true);
    const linkedAddresses = await passportClient.getLinkedAddresses();
    addMessage('Get Linked Addresses', linkedAddresses);
    setIsLoading(false);

    return linkedAddresses;
  }, [passportClient, setIsLoading, addMessage]);

  const linkWallet = useCallback(async (params: LinkWalletParams) => {
    setIsLoading(true);
    let linkedWallet;
    try {
      linkedWallet = await passportClient.linkExternalWallet(params);
      addMessage('Link Wallet', linkedWallet);
    } catch (e: any) {
      addMessage(`Link wallet failed: message: ${e.message} type: ${e.type}`);
    }
    setIsLoading(false);
    return linkedWallet || undefined;
  }, [passportClient, setIsLoading, addMessage]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await passportClient.logout();
      setImxProvider(undefined);
      setZkEvmProvider(undefined);
      setArbitrumProvider(undefined);
      setDefaultWalletProvider(undefined);
    } catch (err) {
      addMessage('Logout', err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, passportClient, setIsLoading]);

  const popupRedirect = useCallback(async () => {
    try {
      setIsLoading(true);
      const userProfile = await passportClient.login();
      addMessage('Login', userProfile);
    } catch (err) {
      addMessage('Login', err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, passportClient, setIsLoading]);

  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      const userProfile = await passportClient.login({ useRedirectFlow: true });
      addMessage('Login Redirect', userProfile);
    } catch (err) {
      addMessage('Login Redirect', err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, passportClient, setIsLoading]);

  // Popup redirect methods (provider-specific)
  const popupRedirectGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      const userProfile = await passportClient.login({
        directLoginOptions: {
          directLoginMethod: 'google',
          marketingConsentStatus: MarketingConsentStatus.Unsubscribed,
        },
      });
      addMessage('Popup Login (Google)', userProfile);
    } catch (err) {
      addMessage('Popup Login (Google)', err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, passportClient, setIsLoading]);

  const popupRedirectApple = useCallback(async () => {
    try {
      setIsLoading(true);
      const userProfile = await passportClient.login({
        directLoginOptions: {
          directLoginMethod: 'apple',
          marketingConsentStatus: MarketingConsentStatus.Unsubscribed,
        },
      });
      addMessage('Popup Login (Apple)', userProfile);
    } catch (err) {
      addMessage('Popup Login (Apple)', err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, passportClient, setIsLoading]);

  const popupRedirectFacebook = useCallback(async () => {
    try {
      setIsLoading(true);
      const userProfile = await passportClient.login({
        directLoginOptions: {
          directLoginMethod: 'facebook',
          marketingConsentStatus: MarketingConsentStatus.Unsubscribed,
        },
      });
      addMessage('Popup Login (Facebook)', userProfile);
    } catch (err) {
      addMessage('Popup Login (Facebook)', err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, passportClient, setIsLoading]);

  // Login (redirect) methods
  const loginGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      const userProfile = await passportClient.login({
        useRedirectFlow: true,
        directLoginOptions: {
          directLoginMethod: 'google',
          marketingConsentStatus: MarketingConsentStatus.Unsubscribed,
        },
      });
      addMessage('Login (Google)', userProfile);
    } catch (err) {
      addMessage('Login (Google)', err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, passportClient, setIsLoading]);

  const loginApple = useCallback(async () => {
    try {
      setIsLoading(true);
      const userProfile = await passportClient.login({
        useRedirectFlow: true,
        directLoginOptions: {
          directLoginMethod: 'apple',
          marketingConsentStatus: MarketingConsentStatus.Unsubscribed,
        },
      });
      addMessage('Login (Apple)', userProfile);
    } catch (err) {
      addMessage('Login (Apple)', err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, passportClient, setIsLoading]);

  const loginFacebook = useCallback(async () => {
    try {
      setIsLoading(true);
      const userProfile = await passportClient.login({
        useRedirectFlow: true,
        directLoginOptions: {
          directLoginMethod: 'facebook',
          marketingConsentStatus: MarketingConsentStatus.Unsubscribed,
        },
      });
      addMessage('Login (Facebook)', userProfile);
    } catch (err) {
      addMessage('Login (Facebook)', err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, passportClient, setIsLoading]);

  useEffect(() => {
    if (environment !== EnvironmentNames.SANDBOX && defaultWalletProvider) {
      setDefaultWalletProvider(undefined);
    }
  }, [environment, defaultWalletProvider]);

  useEffect(() => {
    if (!activeZkEvmProvider) {
      setActiveZkEvmAccount('');
      return;
    }

    let unsubscribed = false;

    const syncAccounts = async () => {
      try {
        const accounts = await activeZkEvmProvider.request({
          method: 'eth_accounts',
        });

        if (!unsubscribed) {
          setActiveZkEvmAccount(accounts?.[0] ?? '');
        }
      } catch (error) {
        console.error('Failed to get accounts', error);
      }
    };

    syncAccounts();

    const handleAccountsChanged = (accounts: string[]) => {
      if (!unsubscribed) {
        setActiveZkEvmAccount(accounts?.[0] ?? '');
      }
    };

    const providerWithEvents = activeZkEvmProvider as unknown as {
      on?: (event: string, listener: (...args: any[]) => void) => void;
      removeListener?: (event: string, listener: (...args: any[]) => void) => void;
    };

    providerWithEvents.on?.('accountsChanged', handleAccountsChanged);

    return () => {
      unsubscribed = true;
      providerWithEvents.removeListener?.('accountsChanged', handleAccountsChanged);
    };
  }, [activeZkEvmProvider]);

  const providerValues = useMemo(() => ({
    imxProvider,
    zkEvmProvider,
    arbitrumProvider,
    defaultWalletProvider,
    activeZkEvmProvider,
    activeZkEvmAccount,
    setDefaultWalletProvider,
    connectImx,
    connectZkEvm,
    connectArbitrum,
    logout,
    popupRedirect,
    popupRedirectGoogle,
    popupRedirectApple,
    popupRedirectFacebook,
    login,
    loginGoogle,
    loginApple,
    loginFacebook,
    getIdToken,
    getAccessToken,
    getUserInfo,
    getLinkedAddresses,
    linkWallet,
    isSandboxEnvironment,
  }), [
    imxProvider,
    zkEvmProvider,
    arbitrumProvider,
    defaultWalletProvider,
    activeZkEvmProvider,
    activeZkEvmAccount,
    isSandboxEnvironment,
    connectImx,
    connectZkEvm,
    connectArbitrum,
    logout,
    popupRedirect,
    popupRedirectGoogle,
    popupRedirectApple,
    popupRedirectFacebook,
    login,
    loginGoogle,
    loginApple,
    loginFacebook,
    getIdToken,
    getAccessToken,
    getUserInfo,
    getLinkedAddresses,
    linkWallet,
    setDefaultWalletProvider,
  ]);

  return (
    <PassportContext.Provider value={providerValues}>
      {children}
    </PassportContext.Provider>
  );
}

export function usePassportProvider() {
  const {
    imxProvider,
    zkEvmProvider,
    arbitrumProvider,
    defaultWalletProvider,
    activeZkEvmProvider,
    activeZkEvmAccount,
    isSandboxEnvironment,
    setDefaultWalletProvider,
    connectImx,
    connectZkEvm,
    connectArbitrum,
    logout,
    popupRedirect,
    popupRedirectGoogle,
    popupRedirectApple,
    popupRedirectFacebook,
    login,
    loginGoogle,
    loginApple,
    loginFacebook,
    getIdToken,
    getAccessToken,
    getUserInfo,
    getLinkedAddresses,
    linkWallet,
  } = useContext(PassportContext);
  return {
    imxProvider,
    zkEvmProvider,
    arbitrumProvider,
    defaultWalletProvider,
    activeZkEvmProvider,
    activeZkEvmAccount,
    isSandboxEnvironment,
    setDefaultWalletProvider,
    connectImx,
    connectZkEvm,
    connectArbitrum,
    logout,
    popupRedirect,
    popupRedirectGoogle,
    popupRedirectApple,
    popupRedirectFacebook,
    login,
    loginGoogle,
    loginApple,
    loginFacebook,
    getIdToken,
    getAccessToken,
    getUserInfo,
    getLinkedAddresses,
    linkWallet,
  };
}
