'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { passportInstance } from '../utils/passport';
import { config } from './config';
import { ConnectWallet } from './connect';
import { Heading, Link } from '@biom3/react';
import NextLink from 'next/link';

// initialise the QueryClient for the Provider
const queryClient = new QueryClient();

export default async function ConnectWithWagmi() {
  // calling connectEVM() makes Passport available as an option to Wagmi
  await passportInstance.connectEvm();

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
