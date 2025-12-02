import React, {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';
import { IMXProvider } from '@imtbl/x-provider';
import {
  LinkedWallet, LinkWalletParams, Provider, UserProfile, MarketingConsentStatus, EvmChain,
} from '@imtbl/passport';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useStatusProvider } from '@/context/StatusProvider';

const PassportContext = createContext<{
  imxProvider: IMXProvider | undefined;
  zkEvmProvider: Provider | undefined;
  arbOneProvider: Provider | undefined;
  connectImx:() => void;
  connectZkEvm: () => void;
  connectArbOne: () => void;
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
      arbOneProvider: undefined,
      connectImx: () => undefined,
      connectZkEvm: () => undefined,
      connectArbOne: () => undefined,
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
  const [arbOneProvider, setArbOneProvider] = useState<Provider | undefined>();

  const { addMessage, setIsLoading } = useStatusProvider();
  const { passportClient } = useImmutableProvider();

  const connectImx = useCallback(async () => {
    if (!passportClient) return;
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
    if (!passportClient) return;
    setIsLoading(true);
    const provider = await passportClient.connectEvm();
    if (provider) {
      setZkEvmProvider(provider);
      addMessage('ConnectZkEvm', 'Connected');
    } else {
      addMessage('ConnectZkEvm', 'Failed to connect');
    }
    setIsLoading(false);
  }, [passportClient, setIsLoading, addMessage]);

  const connectArbOne = useCallback(async () => {
    if (!passportClient) return;
    setIsLoading(true);
    const provider = await passportClient.connectEvm({ chain: EvmChain.ARBITRUM_SEPOLIA });
    if (provider) {
      setArbOneProvider(provider);
      addMessage('ConnectArbOne', 'Connected');
    } else {
      addMessage('ConnectArbOne', 'Failed to connect');
    }
    setIsLoading(false);
  }, [passportClient, setIsLoading, addMessage]);

  const getIdToken = useCallback(async () => {
    if (!passportClient) return;
    setIsLoading(true);
    const idToken = await passportClient.getIdToken();
    addMessage('Get ID token', idToken);
    setIsLoading(false);

    return idToken;
  }, [passportClient, setIsLoading, addMessage]);

  const getAccessToken = useCallback(async () => {
    if (!passportClient) return;
    setIsLoading(true);
    const accessToken = await passportClient.getAccessToken();
    addMessage('Get Access token', accessToken);
    setIsLoading(false);

    return accessToken;
  }, [passportClient, setIsLoading, addMessage]);

  const getUserInfo = useCallback(async () => {
    if (!passportClient) return;
    setIsLoading(true);
    const userInfo = await passportClient.getUserInfo();
    addMessage('Get User Info', userInfo);
    setIsLoading(false);

    return userInfo;
  }, [passportClient, setIsLoading, addMessage]);

  const getLinkedAddresses = useCallback(async () => {
    if (!passportClient) return;
    setIsLoading(true);
    const linkedAddresses = await passportClient.getLinkedAddresses();
    addMessage('Get Linked Addresses', linkedAddresses);
    setIsLoading(false);

    return linkedAddresses;
  }, [passportClient, setIsLoading, addMessage]);

  const linkWallet = useCallback(async (params: LinkWalletParams) => {
    if (!passportClient) return;
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
    if (!passportClient) return;
    try {
      setIsLoading(true);
      await passportClient.logout();
      setImxProvider(undefined);
      setZkEvmProvider(undefined);
      setArbOneProvider(undefined);
    } catch (err) {
      addMessage('Logout', err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, passportClient, setIsLoading]);

  const popupRedirect = useCallback(async () => {
    if (!passportClient) return;
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
    if (!passportClient) return;
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
    if (!passportClient) return;
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
    if (!passportClient) return;
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
    if (!passportClient) return;
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
    if (!passportClient) return;
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
    if (!passportClient) return;
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
    if (!passportClient) return;
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

  const providerValues = useMemo(() => ({
    imxProvider,
    zkEvmProvider,
    arbOneProvider,
    connectImx,
    connectZkEvm,
    connectArbOne,
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
  }), [
    imxProvider,
    zkEvmProvider,
    arbOneProvider,
    connectImx,
    connectZkEvm,
    connectArbOne,
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
    arbOneProvider,
    connectImx,
    connectZkEvm,
    connectArbOne,
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
    arbOneProvider,
    connectImx,
    connectZkEvm,
    connectArbOne,
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
