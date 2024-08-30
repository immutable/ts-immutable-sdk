import { mainnet, immutableZkEvm } from 'wagmi/chains';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { createWeb3Modal } from '@web3modal/wagmi';

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// Get projectId at https://cloud.walletconnect.com
export const PROJECT_ID = 'PROJECT_ID';

export const config = defaultWagmiConfig({
  chains: [mainnet, immutableZkEvm],
  projectId: PROJECT_ID,
  metadata,
});

createWeb3Modal({
  wagmiConfig: config,
  projectId: PROJECT_ID,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
});
