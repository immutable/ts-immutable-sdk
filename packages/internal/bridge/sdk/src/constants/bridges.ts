import { BridgeInstance } from 'types';

// ETH chains
export const ETH_SEPOLIA_CHAIN_ID = 'eip155:11155111';
export const ETH_MAINNET_CHAIN_ID = 'eip155:1';

// IMX zkEVM chains
export const ZKEVM_TESTNET_CHAIN_ID = 'eip155:13373';
export const ZKEVM_MAINNET_CHAIN_ID = 'eip155:13371';

// Bridge instances
export const ETH_SEPOLIA_TO_ZKEVM_DEVNET: BridgeInstance = {
  rootChainID: ETH_SEPOLIA_CHAIN_ID,
  childChainID: ZKEVM_TESTNET_CHAIN_ID,
};

export const ETH_MAINNET_TO_ZKEVM_MAINNET: BridgeInstance = {
  rootChainID: ETH_MAINNET_CHAIN_ID,
  childChainID: ZKEVM_MAINNET_CHAIN_ID,
};
