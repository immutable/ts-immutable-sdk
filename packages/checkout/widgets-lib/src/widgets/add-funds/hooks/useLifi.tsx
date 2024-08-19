import { Web3Provider } from '@ethersproject/providers';
import { createConfig, EVM } from '@lifi/sdk';
import { useEffect } from 'react';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

export const useLifi = ({
  provider,
}: {
  provider: Web3Provider | undefined;
}) => {
  // const chains = [immutableZkEvm, mainnet, polygon, optimism];

  useEffect(() => {
    if (!provider) {
      return;
    }

    const initializeLifiConfig = async () => {
      const client = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum!), // TODO pass in provider
      });

      const evmProvider = EVM({
        getWalletClient: async () => client,
      });

      createConfig({
        integrator: 'immutable',
        apiKey:
          '0809bf15-d159-42dd-b079-756d1c3b0458.d17e73a9-93fa-4d60-ac1e-a1a027425c3b',
        // TODO: configure routeOptions
        providers: [evmProvider],
      });
    };
    initializeLifiConfig();
  }, []);
};
