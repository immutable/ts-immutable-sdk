import { 
  ETH_MAINNET_TO_ZKEVM_MAINNET, 
  ETH_SEPOLIA_TO_ZKEVM_DEVNET, 
  ETH_SEPOLIA_TO_ZKEVM_TESTNET 
} from '@imtbl/bridge-sdk';
import { Environment } from '@imtbl/config';
import { ethers } from 'ethers';

export async function setupForBridge() {
  if (!process.env.ENVIRONMENT) {
    throw new Error('ENVIRONMENT not set');
  }
  if (!process.env.ROOT_PROVIDER_RPC) {
    throw new Error('ROOT_PROVIDER_RPC not set');
  }
  if (!process.env.CHILD_PROVIDER_RPC) {
    throw new Error('CHILD_PROVIDER_RPC not set');
  }
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not set');
  }
  if (!process.env.SENDER_ADDRESS) {
    throw new Error('SENDER_ADDRESS not set');
  }
  if (!process.env.RECIPIENT_ADDRESS) {
    throw new Error('RECIPIENT_ADDRESS not set');
  }
  if (!process.env.ROOT_TOKEN_ADDRESS) {
    throw new Error('ROOT_TOKEN_ADDRESS not set');
  }
  if (!process.env.CHILD_TOKEN_ADDRESS) {
    throw new Error('CHILD_TOKEN_ADDRESS not set');
  }
  if (!process.env.SEND_AMOUNT) {
    throw new Error('SEND_AMOUNT not set');
  }
  if (!process.env.SEND_DECIMALS) {
    throw new Error('SEND_DECIMALS not set');
  }
  if (!process.env.SEND_GAS_MULTIPLIER) {
    throw new Error('SEND_GAS_MULTIPLIER not set');
  }
  if (!process.env.ROOT_BRIDGE_ADDRESS) {
    throw new Error('ROOT_BRIDGE_ADDRESS not set');
  }
  if (!process.env.CHILD_BRIDGE_ADDRESS) {
    throw new Error('CHILD_BRIDGE_ADDRESS not set');
  }
  // Parse deposit amount from environment variable
  const amount = ethers.utils.parseUnits(
    process.env.SEND_AMOUNT,
    process.env.SEND_DECIMALS,
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

  let bridgeInstance, environment;
  switch (process.env.ENVIRONMENT) {
    case 'MAINNET':
      environment = Environment.PRODUCTION;
      bridgeInstance = ETH_MAINNET_TO_ZKEVM_MAINNET;
      break;
    case 'TESTNET':
      environment = Environment.SANDBOX;
      bridgeInstance = ETH_SEPOLIA_TO_ZKEVM_TESTNET;
      break;
    case 'DEVNET':
      environment = Environment.SANDBOX;
      bridgeInstance = ETH_SEPOLIA_TO_ZKEVM_DEVNET;
      break;
    default:
      throw new Error(`Invalid ENVIRONMENT: ${process.env.ENVIRONMENT}`);
  }

  return {
    bridgeInstance,
    environment,
    rootProvider,
    childProvider,
    sender: process.env.SENDER_ADDRESS,
    recipient: process.env.RECIPIENT_ADDRESS,
    rootToken: process.env.ROOT_TOKEN_ADDRESS,
    childToken: process.env.CHILD_TOKEN_ADDRESS,
    amount,
    gasMultiplier:  parseInt(process.env.SEND_GAS_MULTIPLIER,10),
    rootWallet,
    childWallet,
    rootBridgeAddress:  process.env.ROOT_BRIDGE_ADDRESS,
    childBridgeAddress: process.env.CHILD_BRIDGE_ADDRESS,
  }
}