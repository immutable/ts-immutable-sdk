'use client';
 
import { http, createConfig, WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { immutableZkEvmTestnet } from 'wagmi/chains';
import { ProviderEvent } from '@imtbl/sdk/passport';
import { passportInstance } from '../page';
import { WalletOptions } from './wallet-options';
import { Account } from './account';
import { injected } from 'wagmi/connectors';

const queryClient = new QueryClient()

// create the Wagmi config
export const config = createConfig({
  chains: [immutableZkEvmTestnet],
  connectors: [injected()],
  transports: {
    [immutableZkEvmTestnet.id]: http(),
  },
});

// show login options or the logged in account details
function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}

export default function ConnectWithWagmi() {

  // fetch the Passport provider from the Passport instance
  // calling connectEVM() makes Passport available as an option to Wagmi
  const passportProvider = passportInstance.connectEvm()

  // render the view to login/logout and show the connected accounts
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
