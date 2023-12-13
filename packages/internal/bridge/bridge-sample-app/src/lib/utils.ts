import { ethers } from 'ethers';

export async function setupForBridge() {
    if (!process.env.ROOT_PROVIDER_RPC) {
        throw new Error('ROOT_PROVIDER not set');
      }
      if (!process.env.CHILD_PROVIDER_RPC) {
        throw new Error('CHILD_PROVIDER not set');
      }
      if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY not set');
      }
      if (!process.env.DEPOSITOR_ADDRESS) {
        throw new Error('DEPOSITOR_ADDRESS not set');
      }
      if (!process.env.RECIPIENT_ADDRESS) {
        throw new Error('RECIPIENT_ADDRESS not set');
      }
      if (!process.env.SEPOLIA_TOKEN_ADDRESS) {
        throw new Error('SEPOLIA_TOKEN_ADDRESS not set');
      }
      if (!process.env.ZKEVM_TESTNET_TOKEN_ADDRESS) {
        throw new Error('ZKEVM_TESTNET_TOKEN_ADDRESS not set');
      }
      if (!process.env.DEPOSIT_AMOUNT) {
        throw new Error('DEPOSIT_AMOUNT not set');
      }
      if (!process.env.ROOT_BRIDGE_ADDRESS) {
        throw new Error('ROOT_BRIDGE_ADDRESS not set');
      }
    
      if (!process.env.CHILD_BRIDGE_ADDRESS) {
        throw new Error('CHILD_BRIDGE_ADDRESS not set');
      }
      // Parse deposit amount from environment variable
      const amount = ethers.utils.parseUnits(
        process.env.DEPOSIT_AMOUNT,
        18,
      );
    
      // Create providers for root and child chains
      const rootProvider = new ethers.providers.JsonRpcProvider(
        process.env.ROOT_PROVIDER_RPC,
      );
      const childProvider = new ethers.providers.JsonRpcProvider(
        process.env.CHILD_PROVIDER_RPC,
      );
    
      // Create a wallet instance to simulate the user's wallet
      const rootWallet = new ethers.Wallet(
        process.env.PRIVATE_KEY,
        rootProvider,
      );
    
      // Create a wallet instance to simulate the user's wallet
      const childWallet = new ethers.Wallet(
        process.env.PRIVATE_KEY,
        childProvider,
      );

      return {
        rootProvider,
        childProvider,
        depositor: process.env.DEPOSITOR_ADDRESS,
        recipient: process.env.RECIPIENT_ADDRESS,
        sepoliaToken: process.env.SEPOLIA_TOKEN_ADDRESS,
        zkevmTestnetToken: process.env.ZKEVM_TESTNET_TOKEN_ADDRESS,
        amount,
        rootWallet,
        childWallet,
        rootBridgeAddress:  process.env.ROOT_BRIDGE_ADDRESS,
        childBridgeAddress: process.env.CHILD_BRIDGE_ADDRESS,
      }
}