'use client';

import {
  createContext, ReactNode, useCallback, useContext,
  useMemo,
} from 'react';
import { config, passport } from '@imtbl/sdk';
import { BrowserProvider } from 'ethers';

type PassportContextType = {
  passportInstance?: passport.Passport;
  passportSilentInstance?: passport.Passport;
  login?: () => void;
  logout?: () => void;
  logoutSilent?: () => void;
  loginWithoutWallet?: () => void;
  loginWithEthersjs?: () => void;
  getIdToken?: () => void;
  getAccessToken?: () => void;
  getLinkedAddresses?: () => void;
  getUserInfo?: () => void;
};

const PassportContext = createContext<PassportContextType>({});

export function PassportProvider({ children }: { children: ReactNode }) {
  // #doc passport-instance
  const passportInstance = useMemo(() => new passport.Passport({
    baseConfig: {
      environment: config.Environment.SANDBOX, // or config.Environment.SANDBOX
      publishableKey:
        process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>', // replace with your publishable API key from Hub
    },
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>', // replace with your client ID from Hub
    redirectUri: 'http://localhost:3000/redirect', // replace with one of your redirect URIs from Hub
    logoutRedirectUri: 'http://localhost:3000/logout', // replace with one of your logout URIs from Hub
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
  }), []);
  // #enddoc passport-instance

  // #doc passport-silent-instance
  const passportSilentInstance = useMemo(() => new passport.Passport({
    baseConfig: {
      environment: config.Environment.SANDBOX, // or config.Environment.SANDBOX
      publishableKey:
        process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>', // replace with your publishable API key from Hub
    },
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>', // replace with your client ID from Hub
    redirectUri: 'http://localhost:3000/redirect', // replace with one of your redirect URIs from Hub
    logoutRedirectUri: 'http://localhost:3000/silent-logout', // replace with one of your logout URIs from Hub
    logoutMode: 'silent',
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
  }), []);
  // #enddoc passport-silent-instance

  const login = useCallback(async () => {
    if (!passportInstance) return;
    // #doc passport-evm-login
    const provider = await passportInstance.connectEvm();
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    // #enddoc passport-evm-login
    window.alert(`accounts: ${accounts}`);
  }, [passportInstance]);

  const logout = useCallback(async () => {
    if (!passportInstance) return;
    // #doc passport-logout
    await passportInstance.logout();
    // #enddoc passport-logout
  }, [passportInstance]);

  const logoutSilent = useCallback(async () => {
    if (!passportSilentInstance) return;
    // #doc passport-silent-logout
    await passportSilentInstance.logout();
    // #enddoc passport-silent-logout
  }, [passportSilentInstance]);

  const loginWithoutWallet = useCallback(async () => {
    if (!passportInstance) return;
    // #doc passport-login-without-wallet
    const profile: passport.UserProfile | null = await passportInstance.login();
    // #enddoc passport-login-without-wallet
    window.alert(`profile: ${JSON.stringify(profile)}`);
  }, [passportInstance]);

  const loginWithEthersjs = useCallback(async () => {
    if (!passportInstance) return;
    // #doc passport-login-with-ethersjs
    const passportProvider = await passportInstance.connectEvm();

    const browserProvider = new BrowserProvider(passportProvider);

    const accounts = await browserProvider.send('eth_requestAccounts', []);
    // #enddoc passport-login-with-ethersjs

    const signer = await browserProvider.getSigner();

    window.alert(
      `accounts: ${accounts} signer: ${JSON.stringify(signer)}`,
    );
  }, [passportInstance]);

  const getIdToken = useCallback(async () => {
    if (!passportInstance) return;
    // #doc passport-get-id-token
    const idToken = await passportInstance.getIdToken();
    // #enddoc passport-get-id-token
    window.alert(`idToken: ${idToken}`);
  }, [passportInstance]);

  const getAccessToken = useCallback(async () => {
    if (!passportInstance) return;
    // #doc passport-get-access-token
    const accessToken = await passportInstance.getAccessToken();
    // #enddoc passport-get-access-token
    window.alert(`accessToken: ${accessToken}`);
  }, [passportInstance]);

  const getLinkedAddresses = useCallback(async () => {
    if (!passportInstance) return;
    // #doc passport-get-linked-addresses
    const linkedAddresses = await passportInstance.getLinkedAddresses();
    // #enddoc passport-get-linked-addresses
    window.alert(`linkedAddresses: ${linkedAddresses}`);
  }, [passportInstance]);

  const getUserInfo = useCallback(async () => {
    if (!passportInstance) return;
    // #doc passport-get-user-info
    const userProfile = await passportInstance.getUserInfo();
    // #enddoc passport-get-user-info
    window.alert(`userProfile: ${JSON.stringify(userProfile)}`);
  }, [passportInstance]);

  const providerValue = useMemo(() => ({
    passportInstance,
    passportSilentInstance,
    login,
    logout,
    logoutSilent,
    loginWithoutWallet,
    loginWithEthersjs,
    getIdToken,
    getAccessToken,
    getLinkedAddresses,
    getUserInfo,
  }), [
    passportInstance,
    passportSilentInstance,
    login,
    logout,
    logoutSilent,
    loginWithoutWallet,
    loginWithEthersjs,
    getIdToken,
    getAccessToken,
    getLinkedAddresses,
    getUserInfo,
  ]);

  return (
    <PassportContext.Provider value={providerValue}>
      {children}
    </PassportContext.Provider>
  );
}

export const usePassport = () => useContext(PassportContext);
