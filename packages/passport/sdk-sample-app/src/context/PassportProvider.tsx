import React, {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';
import { IMXProvider, UserProfile } from '@imtbl/sdk';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useStatusProvider } from '@/context/StatusProvider';
import { Provider } from '@imtbl/passport';

const PassportContext = createContext<{
  imxProvider: IMXProvider | undefined;
  zkEvmProvider: Provider | undefined;
  connectImx:() => void;
  connectImxSilent: () => void;
  connectZkEvm: () => void;
  logout: () => void;
  getIdToken: () => Promise<string | undefined>;
  getAccessToken: () => Promise<string | undefined>;
  getUserInfo: () => Promise<UserProfile | undefined>;
}>({
      imxProvider: undefined,
      zkEvmProvider: undefined,
      connectImx: () => undefined,
      connectImxSilent: () => undefined,
      connectZkEvm: () => undefined,
      logout: () => undefined,
      getIdToken: () => Promise.resolve(undefined),
      getAccessToken: () => Promise.resolve(undefined),
      getUserInfo: () => Promise.resolve(undefined),
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
      const provider = await passportClient?.connectImx();
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

  const connectImxSilent = useCallback(async () => {
    try {
      setIsLoading(true);
      const provider = await passportClient?.connectImxSilent();
      if (provider) {
        setImxProvider(provider);
        addMessage('ConnectImxSilent', 'Connected');
      } else {
        addMessage('ConnectImxSilent', 'Failed to connect. Ensure you have logged in before.');
      }
    } catch (err) {
      addMessage('ConnectImxSilent', err);
    } finally {
      setIsLoading(false);
    }
  }, [passportClient, setIsLoading, addMessage]);

  const connectZkEvm = useCallback(async () => {
    setIsLoading(true);
    // @ts-ignore TODO ID-926 Remove once method is public
    const provider = passportClient?.connectEvm();
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
    const idToken = await passportClient?.getIdToken();
    addMessage('Get ID token', idToken);
    setIsLoading(false);

    return idToken;
  }, [passportClient, setIsLoading, addMessage]);

  const getAccessToken = useCallback(async () => {
    setIsLoading(true);
    const accessToken = await passportClient?.getAccessToken();
    addMessage('Get Access token', accessToken);
    setIsLoading(false);

    return accessToken;
  }, [passportClient, setIsLoading, addMessage]);

  const getUserInfo = useCallback(async () => {
    setIsLoading(true);
    const userInfo = await passportClient?.getUserInfo();
    addMessage('Get User Info', userInfo);
    setIsLoading(false);

    return userInfo;
  }, [passportClient, setIsLoading, addMessage]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await passportClient?.logout();
      setImxProvider(undefined);
      setZkEvmProvider(undefined);
    } catch (err) {
      if (err instanceof Error) {
        addMessage(err.toString());
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [passportClient, setIsLoading]);

  const providerValues = useMemo(() => ({
    imxProvider,
    zkEvmProvider,
    connectImx,
    connectImxSilent,
    connectZkEvm,
    logout,
    getIdToken,
    getAccessToken,
    getUserInfo,
  }), [
    imxProvider,
    zkEvmProvider,
    connectImx,
    connectImxSilent,
    connectZkEvm,
    logout,
    getIdToken,
    getAccessToken,
    getUserInfo,
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
    connectImxSilent,
    connectZkEvm,
    logout,
    getIdToken,
    getAccessToken,
    getUserInfo,
  } = useContext(PassportContext);
  return {
    imxProvider,
    zkEvmProvider,
    connectImx,
    connectImxSilent,
    connectZkEvm,
    logout,
    getIdToken,
    getAccessToken,
    getUserInfo,
  };
}
