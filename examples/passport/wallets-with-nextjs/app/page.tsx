'use client';
 
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { config, passport } from '@imtbl/sdk';
import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ProviderEvent } from '@imtbl/sdk/passport';

export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY ?? "", // replace with your publishable API key from Hub
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID ?? "", // replace with your client ID from Hub
  redirectUri: 'http://localhost:3000/redirect', // replace with one of your redirect URIs from Hub
  logoutRedirectUri: 'http://localhost:3000/logout', // replace with one of your logout URIs from Hub
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
  popupOverlayOptions: {
    disableGenericPopupOverlay: false, // Set to true to disable the generic pop-up overlay
    disableBlockedPopupOverlay: false, // Set to true to disable the blocked pop-up overlay
  }
}); 

export default function Home() {
  
  const [accountsState, setAccountsState] = useState<any>();

  const passportProvider = passportInstance.connectEvm() // EIP-6963
  const web3Provider = new ethers.providers.Web3Provider(passportProvider);

  const passportLogin = async () => {
    if (web3Provider.provider.request) {
      const accounts = await web3Provider.provider.request({ method: "eth_requestAccounts" });
      setAccountsState(accounts)
    }
  }

  // @NOTE to use the eth_requestAccounts to trigger login 
  // then connect to the wallet and unlock it

  passportProvider.on(ProviderEvent.ACCOUNTS_CHANGED, (accounts: string[]) => {
    setAccountsState(accounts);
  });

  const passportLogout = async () => {
    await passportInstance.logout()
    setAccountsState([])
  }

  console.log('accountsState', accountsState)

  return (<>
    <h1>Passport Wallet Examples</h1>
    <a href="/connect-with-etherjs">Connect Wallet with EtherJS</a>
  </>);
}
