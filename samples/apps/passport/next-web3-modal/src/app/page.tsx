'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './wagmi';
import { useEffect } from 'react';
import { passportInstance } from './passport';
import { Connect } from '@/components/Connect';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    if(!passportInstance) return
    passportInstance.connectEvm() // EIP-6963
  }, [passportInstance])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Connect />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
