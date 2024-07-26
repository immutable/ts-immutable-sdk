'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { passportInstance } from '../utils';
import { config } from './config';
import { ConnectWallet } from './connect';

// initialise the QueryClient for the Provider
const queryClient = new QueryClient();

export default function ConnectWithWagmi() {
  // calling connectEVM() makes Passport available as an option to Wagmi
  passportInstance.connectEvm();

  // render the ConnectWallet component
  // wrapping it in the Wagami and QueryClient Providers
  return (
    <>
      <h1>Passport Wallet - Connect with Wagmi</h1>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectWallet />
        </QueryClientProvider>
      </WagmiProvider>
      <p>
        <a href="/">Return to Examples</a>
      </p>
    </>
  );
}
