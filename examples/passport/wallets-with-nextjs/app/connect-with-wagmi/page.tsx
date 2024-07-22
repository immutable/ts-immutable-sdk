'use client';
 
import { useState } from 'react';
import { http, createConfig, WagmiProvider, useConnect, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mainnet, immutableZkEvm } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

import { ProviderEvent } from '@imtbl/sdk/passport';
import { passportInstance } from '../page';
import { WalletOptions } from './wallet-options';
import { Account } from './account';

const queryClient = new QueryClient()

export const config = createConfig({
  chains: [mainnet, immutableZkEvm],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [immutableZkEvm.id]: http(),
  },
});

function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}

export default function ConnectWithWagmi() {
  
  // setup the accounts state
  const [accountsState, setAccountsState] = useState<any>([]);

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  // fetch the Passport provider from the Passport instance
  const passportProvider = passportInstance.connectEvm()

  // listen to the ACCOUNTS_CHANGED event and update the accounts state when it changes
  passportProvider.on(ProviderEvent.ACCOUNTS_CHANGED, (accounts: string[]) => {
    console.log('ACCOUNTS_CHANGED', accounts)
    setAccountsState(accounts);
  });

  // reset the accounts state when logout is called
  const passportLogout = async () => {
    setAccountsState([])
    await passportInstance.logout()
  }

  // render the view to login and show the connected accounts
  return (<>
    <h1>Passport Wallet - Connect with Wagmi</h1>
    <div>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectWallet />
        </QueryClientProvider>
      </WagmiProvider>
    </div>

    {accountsState.length >= 1 && 
      <button onClick={passportLogout} disabled={loading}>Passport Logout</button>
    }
    {loading 
      ? <p>Loading...</p> 
      : <p>Connected Account: {accountsState.length >= 1 ? accountsState : '(not connected)'}</p>
    }
    <p>
      <a href="/">Return to Examples</a>
    </p>
  </>);
}
