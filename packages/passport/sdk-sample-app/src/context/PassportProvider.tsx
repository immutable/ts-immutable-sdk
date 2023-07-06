import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { IMXProvider } from '@imtbl/sdk';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useStatusProvider } from '@/context/StatusProvider';

const PassportContext = createContext<{
  imxProvider: IMXProvider | undefined;
  connectImx:() => void;
  connectImxSilent: () => void;
  logout: () => void;
  idToken?: string;
  accessToken?: string;
  imxWalletAddress?: string;
  userInfo?: object;
}>({
      imxProvider: undefined,
      connectImx: () => undefined,
      connectImxSilent: () => undefined,
      logout: () => undefined,
    });

export function PassportProvider({
  children,
}: { children: JSX.Element | JSX.Element[] }) {
  const [imxProvider, setImxProvider] = useState<IMXProvider | undefined>();
  const [idToken, setIdToken] = useState<string>();
  const [accessToken, setAccessToken] = useState<string>();
  const [imxWalletAddress, setImxWalletAddress] = useState<string>();
  const [userInfo, setUserInfo] = useState<object>();

  const { setMessage, setIsLoading } = useStatusProvider();
  const { passportClient } = useImmutableProvider();

  const connectImx = useCallback(async () => {
    try {
      setMessage('');
      setIsLoading(true);
      setImxProvider(await passportClient?.connectImx());
      setMessage('Passport connected');
    } catch (err) {
      if (err instanceof Error) {
        setMessage(err.toString());
      }
    } finally {
      setIsLoading(false);
    }
  }, [passportClient, setIsLoading, setMessage]);

  const connectImxSilent = useCallback(async () => {
    try {
      setMessage('');
      setIsLoading(true);
      const provider = await passportClient?.connectImxSilent();
      if (provider) {
        setImxProvider(provider);
        setMessage('Passport connected');
      }
    } catch (err) {
      if (err instanceof Error) {
        setMessage(err.toString());
      }
    } finally {
      setIsLoading(false);
    }
  }, [passportClient, setIsLoading, setMessage]);

  const logout = useCallback(async () => {
    passportClient?.logout();
  }, [passportClient]);

  useEffect(() => {
    const populatePassportClientProperties = async () => {
      setIdToken(await passportClient?.getIdToken());
      setAccessToken(await passportClient?.getAccessToken());
      setUserInfo(await passportClient?.getUserInfo());
    };

    populatePassportClientProperties().catch(console.error);
  }, [passportClient, imxProvider]);

  useEffect(() => {
    const populateImxProviderProperties = async () => {
      setImxWalletAddress(await imxProvider?.getAddress());
    };

    populateImxProviderProperties().catch(console.error);
  }, [imxProvider]);

  const providerValues = useMemo(() => ({
    imxProvider,
    connectImx,
    connectImxSilent,
    logout,
    idToken,
    accessToken,
    imxWalletAddress,
    userInfo,
  }), [
    imxProvider,
    connectImx,
    connectImxSilent,
    logout,
    idToken,
    accessToken,
    imxWalletAddress,
    userInfo,
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
    connectImx,
    connectImxSilent,
    logout,
    idToken,
    accessToken,
    imxWalletAddress,
    userInfo,
  } = useContext(PassportContext);
  return {
    imxProvider,
    connectImx,
    connectImxSilent,
    logout,
    idToken,
    accessToken,
    imxWalletAddress,
    userInfo,
  };
}
