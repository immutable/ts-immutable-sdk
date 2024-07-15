import { http, createConfig } from 'wagmi';
import { immutableZkEvm } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [immutableZkEvm],
  connectors: [injected()],
  transports: {
    [immutableZkEvm.id]: http(),
  },
});
