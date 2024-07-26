'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import { useEffect } from 'react';
import { Connect } from '../components/Connect';
import { config } from './wagmi';
import { passportInstance } from './passport';

const queryClient = new QueryClient();

export default function Page() {
  useEffect(() => {
    if (!passportInstance) return;
    passportInstance.connectEvm(); // EIP-6963
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Connect />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
