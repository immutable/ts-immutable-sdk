'use client';
 
import { http, createConfig, WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { immutableZkEvm } from 'wagmi/chains';
// immutableZkEvmTestnet for testnet
import { ProviderEvent } from '@imtbl/sdk/passport';
import { passportInstance } from '../page';
import { WalletOptions } from './wallet-options';
import { Account } from './account';
import { injected } from 'wagmi/connectors';

const queryClient = new QueryClient()

export const config = createConfig({
  chains: [immutableZkEvm], // connects to Immutable zkEVM mainnet
  connectors: [injected()],
  transports: {
    [immutableZkEvm.id]: http(),
  },
});

function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}

export default function ConnectWithWagmi() {

  // fetch the Passport provider from the Passport instance
  const passportProvider = passportInstance.connectEvm()

  // listen to the ACCOUNTS_CHANGED event and update the accounts state when it changes
  passportProvider.on(ProviderEvent.ACCOUNTS_CHANGED, (accounts: string[]) => {
    console.log('ACCOUNTS_CHANGED', accounts)
  });

  // render the view to login and show the connected accounts
  return (<>
    <h1>Passport Wallet - Connect with Wagmi</h1>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectWallet />
      </QueryClientProvider>
    </WagmiProvider>
    <p>
      <a href="/">Return to Examples</a>
    </p>
  </>);
}
