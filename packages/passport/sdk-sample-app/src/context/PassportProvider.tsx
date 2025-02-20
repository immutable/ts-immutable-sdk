import React, {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';
import { IMXProvider } from '@imtbl/x-provider';
import {
  LinkedWallet, LinkWalletParams, Provider, UserProfile,
} from '@imtbl/passport';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useStatusProvider } from '@/context/StatusProvider';

const PassportContext = createContext<{
  imxProvider: IMXProvider | undefined;
  zkEvmProvider: Provider | undefined;
  connectImx:() => void;
  connectZkEvm: () => void;
  logout: () => void;
  login: () => void;
  getIdToken: () => Promise<string | undefined>;
  getAccessToken: () => Promise<string | undefined>;
  getUserInfo: () => Promise<UserProfile | undefined>;
  getLinkedAddresses: () => Promise<string[] | undefined>;
  linkWallet: (params: LinkWalletParams) => Promise<LinkedWallet | undefined>;
}>({
      imxProvider: undefined,
      zkEvmProvider: undefined,
      connectImx: () => undefined,
      connectZkEvm: () => undefined,
      logout: () => undefined,
      login: () => Promise.resolve(undefined),
      getIdToken: () => Promise.resolve(undefined),
      getAccessToken: () => Promise.resolve(undefined),
      getUserInfo: () => Promise.resolve(undefined),
      getLinkedAddresses: () => Promise.resolve(undefined),
      linkWallet: () => Promise.resolve(undefined),
    });

export function PassportProvider({
  children,
}: { children: JSX.Element | JSX.Element[] }) {
  const [imxProvider, setImxProvider] = useState<IMXProvider | undefined>();
  const [zkEvmProvider, setZkEvmProvider] = useState<Provider | undefined>();

  const { addMessage, setIsLoading } = useStatusProvider();
  const { passportClient } = useImmutableProvider();

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
    const provider = await passportClient.connectEvm();
    if (provider) {
      setZkEvmProvider(provider);
      addMessage('ConnectZkEvm', 'Connected');
    } else {
      addMessage('ConnectZkEvm', 'Failed to connect');
    }
    setIsLoading(false);
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
    } catch (err) {
      addMessage('Logout', err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, passportClient, setIsLoading]);

  const login = useCallback(async () => {
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

  const providerValues = useMemo(() => ({
    imxProvider,
    zkEvmProvider,
    connectImx,
    connectZkEvm,
    logout,
    login,
    getIdToken,
    getAccessToken,
    getUserInfo,
    getLinkedAddresses,
    linkWallet,
  }), [
    imxProvider,
    zkEvmProvider,
    connectImx,
    connectZkEvm,
    logout,
    login,
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
    connectImx,
    connectZkEvm,
    login,
    logout,
    getIdToken,
    getAccessToken,
    getUserInfo,
    getLinkedAddresses,
    linkWallet,
  } = useContext(PassportContext);
  return {
    imxProvider,
    zkEvmProvider,
    connectImx,
    connectZkEvm,
    login,
    logout,
    getIdToken,
    getAccessToken,
    getUserInfo,
    getLinkedAddresses,
    linkWallet,
  };
}
