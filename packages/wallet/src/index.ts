// Export main connection function (public API)
export { connectWallet } from './connectWallet';

// Export chain ID constants (public API)
export {
  IMMUTABLE_ZKEVM_MAINNET_CHAIN_ID,
  IMMUTABLE_ZKEVM_TESTNET_CHAIN_ID,
} from './constants';

// Export presets (public API)
export {
  IMMUTABLE_ZKEVM_MAINNET,
  IMMUTABLE_ZKEVM_TESTNET,
  IMMUTABLE_ZKEVM_MULTICHAIN,
  IMMUTABLE_ZKEVM_MAINNET_CHAIN,
  IMMUTABLE_ZKEVM_TESTNET_CHAIN,
  DEFAULT_CHAINS,
} from './presets';

// Export main wallet provider
export { ZkEvmProvider } from './zkEvm/zkEvmProvider';

// Export internal configuration (for Passport/advanced usage)
export { WalletConfiguration } from './config';

// Export types
export * from './types';

// Export errors
export { WalletError, WalletErrorType } from './errors';
export { JsonRpcError, ProviderErrorCode, RpcErrorCode } from './zkEvm/JsonRpcError';

// Export zkEvm utilities
export { RelayerClient } from './zkEvm/relayerClient';
export * as walletHelpers from './zkEvm/walletHelpers';

// Export guardian and magic (for advanced usage)
export { default as GuardianClient } from './guardian';
export { default as MagicTEESigner } from './magic/magicTEESigner';

// Export utilities
export { TypedEventEmitter } from '@imtbl/auth';
export { retryWithDelay } from './network/retry';

// Export EIP-6963 provider announcement
export { announceProvider, passportProviderInfo } from './provider/eip6963';

// Export confirmation screen (for transaction confirmations)
export { default as ConfirmationScreen } from './confirmation/confirmation';

// Export wallet linking
export { linkExternalWallet, getLinkedAddresses } from './linkExternalWallet';
export type { LinkWalletParams, LinkedWallet } from './linkExternalWallet';
