import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import { Connect } from './components/Connect';
import { config } from './wagmi';
import { useEffect, useState } from 'react';
import { passportInstance, PASSPORT_CONNECTOR_ID } from './main';
import { ConnectKitProvider } from 'connectkit';

const queryClient = new QueryClient();

export default function App() {
  const [connector, setConnector] = useState<string | undefined>(undefined);

  useEffect(() => {
    if(!passportInstance) return
    passportInstance.connectEvm() // EIP-6963
  }, [])

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
