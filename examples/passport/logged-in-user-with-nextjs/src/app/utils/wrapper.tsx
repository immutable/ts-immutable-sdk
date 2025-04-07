'use client';
import { BiomeCombinedProviders, Stack } from '@biom3/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { config } from './wagmiConfig';

export default function AppWrapper({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const [queryClient] = useState(() => new QueryClient());
    
    return (
      <div className="flex-container">
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <BiomeCombinedProviders>
              <Stack alignItems="center">
                { children }
              </Stack>
            </BiomeCombinedProviders>
          </QueryClientProvider>
        </WagmiProvider>
      </div>
    );
}