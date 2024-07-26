'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { ProviderEvent } from '@imtbl/sdk/passport';
import { passportInstance } from '../utils';

export default function ConnectWithEtherJS() {
  // setup the accounts state
  const [accountsState, setAccountsState] = useState<any>([]);

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  // #doc passport-wallets-nextjs-connect-etherjs-create
  // fetch the Passport provider from the Passport instance
  const passportProvider = passportInstance.connectEvm();

  // create the Web3Provider using the Passport provider
  const web3Provider = new ethers.providers.Web3Provider(passportProvider);
  // #enddoc passport-wallets-nextjs-connect-etherjs-create

  const passportLogin = async () => {
    if (web3Provider.provider.request) {
      // disable button while loading
      setLoadingState(true);

      // #doc passport-wallets-nextjs-connect-etherjs-request
      // calling eth_requestAccounts triggers the Passport login flow
      const accounts = await web3Provider.provider.request({ method: 'eth_requestAccounts' });
      // #enddoc passport-wallets-nextjs-connect-etherjs-request

      // once logged in Passport is connected to the wallet and ready to transact
      setAccountsState(accounts);
      // enable button when loading has finished
      setLoadingState(false);
    }
  };

  // listen to the ACCOUNTS_CHANGED event and update the accounts state when it changes
  passportProvider.on(ProviderEvent.ACCOUNTS_CHANGED, (accounts: string[]) => {
    setAccountsState(accounts);
  });

  const passportLogout = async () => {
    // disable button while loading
    setLoadingState(true);
    // reset the account state
    setAccountsState([]);
    // logout from passport
    await passportInstance.logout();
  };

  // render the view to login/logout and show the connected accounts
  return (
    <>
      <h1>Passport Wallet - Connect with EtherJS</h1>
      {accountsState.length === 0
      && <button onClick={passportLogin} disabled={loading} type='button'>Passport Login</button>}
      {accountsState.length >= 1
      && <button onClick={passportLogout} disabled={loading} type='button'>Passport Logout</button>}
      {loading
        ? <p>Loading...</p>
        : (
          <p>
            Connected Account:
            {accountsState.length >= 1 ? accountsState : '(not connected)'}
          </p>
        )}
      <p>
        <a href="/">Return to Examples</a>
      </p>
    </>
  );
}
