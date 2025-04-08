import { createConfig, http } from 'wagmi';
import { immutableZkEvmTestnet, immutableZkEvm } from 'wagmi/chains';
import { injected, metaMask, safe } from 'wagmi/connectors';

// create the Wagmi config for Immutable zkEVM Testnet
export const config = createConfig({
  chains: [immutableZkEvm],
  connectors: [injected(), metaMask(), safe()],
  transports: {
    [immutableZkEvm.id]: http(),
  },
});
