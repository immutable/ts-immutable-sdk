import { createConfig, http } from "wagmi";
import { immutableZkEvmTestnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// create the Wagmi config for Immutable zkEVM Testnet
export const config = createConfig({
  chains: [immutableZkEvmTestnet],
  connectors: [injected()],
  transports: {
    [immutableZkEvmTestnet.id]: http(),
  },
});
