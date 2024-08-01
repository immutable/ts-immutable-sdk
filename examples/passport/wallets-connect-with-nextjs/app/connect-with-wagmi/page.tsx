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
    <div className="flex flex-col items-center justify-center min-h-screen p-8">

      <h1 className="text-3xl font-bold mb-8">Passport Connect with Wagmi</h1>
      <WagmiProvider config={config}>
              <QueryClientProvider client={queryClient}>
                <ConnectWallet />
              </QueryClientProvider>
            </WagmiProvider>
      <br />
      <a href="/" className='underline'>Return to Examples</a>
    </div>
  );
}
