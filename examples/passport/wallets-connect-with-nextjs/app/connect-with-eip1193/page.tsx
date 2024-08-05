'use client';

import { useState } from 'react';
import { ProviderEvent } from '@imtbl/sdk/passport';
import { passportInstance } from '../utils';

export default function ConnectWithEtherJS() {
  // setup the accounts state
  const [accountsState, setAccountsState] = useState<any>([]);

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  // #doc passport-wallets-nextjs-connect-eip1193-create
  // fetch the Passport provider from the Passport instance
  const passportProvider = passportInstance.connectEvm();
  // #enddoc passport-wallets-nextjs-connect-eip1193-create

  const passportLogin = async () => {
    // disable button while loading
    setLoadingState(true);
    // #doc passport-wallets-nextjs-connect-eip1193-request
    // calling eth_requestAccounts triggers the Passport login flow
    const accounts = await passportProvider.request({ method: 'eth_requestAccounts' });
    // #enddoc passport-wallets-nextjs-connect-eip1193-request
    // once logged in Passport is connected to the wallet and ready to transact
    setAccountsState(accounts);
    // enable button once loading finished
    setLoadingState(false);
  };

  // #doc passport-wallets-nextjs-connect-eip1193-event
  // listen to the ACCOUNTS_CHANGED event and update the accounts state when it changes
  passportProvider.on(ProviderEvent.ACCOUNTS_CHANGED, (accounts: string[]) => {
    setAccountsState(accounts);
  });
  // #enddoc passport-wallets-nextjs-connect-eip1193-event

  // reset the accounts state when logout is called
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
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Passport Connect with EIP-1193</h1>
      {accountsState.length === 0
      && (
      <button
        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        onClick={passportLogin}
        disabled={loading}
      >
        Passport Login
      </button>
      )}
      {accountsState.length >= 1
      && (
      <button
        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        onClick={passportLogout}
        disabled={loading}
      >
        Passport Logout
      </button>
      )}
      <br />
      {loading
        ? <p>Loading...</p>
        : (
          <p>
            Connected Account:
            {accountsState.length >= 1 ? accountsState : '(not connected)'}
          </p>
        )}
      <br />
      <a href="/" className="underline">Return to Examples</a>
    </div>
  );
}
