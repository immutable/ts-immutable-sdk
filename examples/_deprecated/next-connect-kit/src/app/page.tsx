'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { useEffect } from 'react';
import { Connect } from '@/components/Connect';
import { ConnectKitProvider } from 'connectkit';
import { passportInstance } from './passport';
import { config } from './wagmi';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    if (!passportInstance) return;
    passportInstance.connectEvm(); // EIP-6963
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider onDisconnect={async () => {
          const userinfo = await passportInstance.getUserInfo();
          if (userinfo) await passportInstance.logout();
        }}
        >
          <Connect />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
