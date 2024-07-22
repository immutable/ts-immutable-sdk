'use client';
 
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { config, passport } from '@imtbl/sdk';
import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ProviderEvent } from '@imtbl/sdk/passport';
import { passportInstance } from '../page';


export default function Connect() {
  
  const [accountsState, setAccountsState] = useState<any>([]);

  const passportProvider = passportInstance.connectEvm() // EIP-6963
  const web3Provider = new ethers.providers.Web3Provider(passportProvider);

  const passportLogin = async () => {
    if (web3Provider.provider.request) {
      // calling eth_requestAccounts triggers the Passport login flow
      const accounts = await web3Provider.provider.request({ method: "eth_requestAccounts" });
      // once logged in Passport is connected to the wallet and ready to transact
      setAccountsState(accounts)
    }
  }

  // the ACCOUNTS_CHANGED event can be subscribed to
  passportProvider.on(ProviderEvent.ACCOUNTS_CHANGED, (accounts: string[]) => {
    setAccountsState(accounts);
  });

  const passportLogout = async () => {
    await passportInstance.logout()
    setAccountsState([])
  }

  return (<>
    <h1>Passport Wallet - Connect Wallet with EtherJS</h1>
    {accountsState.length == 0 && 
      <button onClick={passportLogin}>Login</button>
    }
    {accountsState.length >= 1 && 
      <button onClick={passportLogout}>Logout</button>
    }
    <p>Connected Account: {accountsState.length >= 1 ? accountsState : '(not connected)'}</p>
  </>);
}
