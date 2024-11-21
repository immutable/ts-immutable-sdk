'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { passportInstance } from '../utils/passport';
import { config } from './config';
import { ConnectWallet } from './connect';
import { Heading, Link } from '@biom3/react';
import NextLink from 'next/link';
import { useEffect } from 'react';

// initialise the QueryClient for the Provider
const queryClient = new QueryClient();

export default function ConnectWithWagmi() {
  useEffect(() => {
    const init = async () => {
    // calling connectEVM() makes Passport available as an option to Wagmi
      await passportInstance.connectEvm();
    }

    init();
  }, []);

  // render the ConnectWallet component
  // wrapping it in the Wagami and QueryClient Providers
  return (
    <>
      <Heading className="mb-1">Passport Connect with Wagmi</Heading>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectWallet />
        </QueryClientProvider>
      </WagmiProvider>
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}
