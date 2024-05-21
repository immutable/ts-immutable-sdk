'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import { useEffect, useState } from 'react';
import { ConnectKitProvider } from 'connectkit';
import { Connect } from '../components/Connect';
import { config } from './wagmi';
import { PASSPORT_CONNECTOR_ID, passportInstance } from './passport';

const queryClient = new QueryClient();

export default function Page() {
  const [connector, setConnector] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!passportInstance) return;
    passportInstance.connectEvm(); // EIP-6963
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          onDisconnect={async () => {
            if (connector !== PASSPORT_CONNECTOR_ID) return;
            await passportInstance.logout();
          }}
          onConnect={({ connectorId }) => {
            if (connectorId) setConnector(connectorId);
          }}
        >
          <Connect />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
