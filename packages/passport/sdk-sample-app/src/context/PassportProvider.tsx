import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { IMXProvider } from '@imtbl/x-provider';
import {
  LinkedWallet, LinkWalletParams, Provider, UserProfile, MarketingConsentStatus,
} from '@imtbl/passport';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useStatusProvider } from '@/context/StatusProvider';
import { EnvironmentNames } from '@/types';

const PassportContext = createContext<{
  imxProvider: IMXProvider | undefined;
  zkEvmProvider: Provider | undefined;
  defaultWalletProvider: Provider | undefined;
  activeZkEvmProvider: Provider | undefined;
  activeZkEvmAccount: string;
  isSandboxEnvironment: boolean;
  setDefaultWalletProvider: (provider?: Provider) => void;
  connectImx:() => void;
  connectZkEvm: () => void;
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
      defaultWalletProvider: undefined,
      activeZkEvmProvider: undefined,
      activeZkEvmAccount: '',
      setDefaultWalletProvider: () => undefined,
      isSandboxEnvironment: false,
      connectImx: () => undefined,
      connectZkEvm: () => undefined,
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
  const [zkEvmProvider, setZkEvmProvider] = useState<Provider | undefined>();
  const [defaultWalletProvider, setDefaultWalletProvider] = useState<Provider | undefined>();
  const [activeZkEvmAccount, setActiveZkEvmAccount] = useState<string>('');

  const { addMessage, setIsLoading } = useStatusProvider();
  const { passportClient, environment } = useImmutableProvider();
  const isSandboxEnvironment = environment === EnvironmentNames.SANDBOX;
  // `zkEvmProvider` is initialised using Passport package. 
  // `defaultWalletProvider` is created by connectWallet() with getUser from NextAuth or default auth.
  // Both providers can be used for zkEVM operations in any environment.
  const activeZkEvmProvider = defaultWalletProvider || zkEvmProvider;

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
    try {
      const provider = await passportClient.connectEvm();
      if (provider) {
        // Call eth_requestAccounts to trigger zkEvm registration if needed
        // This ensures the user has a zkEvm address before setting the provider
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setZkEvmProvider(provider);
          addMessage('ConnectZkEvm', `Connected: ${accounts[0]}`);
        } else {
          addMessage('ConnectZkEvm', 'No accounts returned');
        }
      } else {
        addMessage('ConnectZkEvm', 'Failed to connect');
      }
    } catch (err) {
      addMessage('ConnectZkEvm', err);
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

  // Clear wallet provider when environment changes to ensure clean state
  useEffect(() => {
    setDefaultWalletProvider(undefined);
    setZkEvmProvider(undefined);
  }, [environment]);

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
    defaultWalletProvider,
    activeZkEvmProvider,
    activeZkEvmAccount,
    setDefaultWalletProvider,
    connectImx,
    connectZkEvm,
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
    defaultWalletProvider,
    activeZkEvmProvider,
    activeZkEvmAccount,
    isSandboxEnvironment,
    connectImx,
    connectZkEvm,
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
    defaultWalletProvider,
    activeZkEvmProvider,
    activeZkEvmAccount,
    isSandboxEnvironment,
    setDefaultWalletProvider,
    connectImx,
    connectZkEvm,
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
    defaultWalletProvider,
    activeZkEvmProvider,
    activeZkEvmAccount,
    isSandboxEnvironment,
    setDefaultWalletProvider,
    connectImx,
    connectZkEvm,
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
