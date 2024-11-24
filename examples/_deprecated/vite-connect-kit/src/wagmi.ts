import { http, createConfig } from 'wagmi';
import { mainnet, immutableZkEvm } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, immutableZkEvm],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [immutableZkEvm.id]: http(),
  },
});
