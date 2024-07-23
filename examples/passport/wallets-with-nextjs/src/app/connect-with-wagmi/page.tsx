'use client';
 
import { http, createConfig, WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { immutableZkEvmTestnet } from 'wagmi/chains';
import { WalletOptions } from './wallet-options';
import { Account } from './account';
import { injected } from 'wagmi/connectors';
import { passportInstance } from '../utils';

// #doc passport-wallets-nextjs-connect-wagmi-config
// create the Wagmi config for Immutable zkEVM Testnet
export const config = createConfig({
  chains: [immutableZkEvmTestnet],
  connectors: [injected()],
  transports: {
    [immutableZkEvmTestnet.id]: http(),
  },
});
// #enddoc passport-wallets-nextjs-connect-wagmi-config

// #doc passport-wallets-nextjs-connect-wagmi-connect-component
// show wallet options for login or the logged in account details
// depending on whether the account is connected or not
function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}
// #enddoc passport-wallets-nextjs-connect-wagmi-connect-component

// #doc passport-wallets-nextjs-connect-wagmi-provider
// initialise the QueryClient for the Provider
const queryClient = new QueryClient()

export default function ConnectWithWagmi() {

  // calling connectEVM() makes Passport available as an option to Wagmi
  const passportProvider = passportInstance.connectEvm()

  // render the ConnectWallet component
  // wrapping it in the Wagami and QueryClient Providers
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
// #enddoc passport-wallets-nextjs-connect-wagmi-provider
