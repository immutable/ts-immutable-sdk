// Export main wallet provider
export { ZkEvmProvider } from './zkEvm/zkEvmProvider';

// Export configuration
export { WalletConfiguration } from './config';

// Export types
export * from './types';

// Export errors
export { WalletError, WalletErrorType } from './errors';
export { JsonRpcError, ProviderErrorCode, RpcErrorCode } from './zkEvm/JsonRpcError';

// Export zkEvm utilities
export { RelayerClient } from './zkEvm/relayerClient';
export * as walletHelpers from './zkEvm/walletHelpers';

// Export guardian and magic
export { default as GuardianClient } from './guardian';
export { default as MagicTEESigner } from './magic/magicTEESigner';

// Export utilities
export { default as TypedEventEmitter } from './utils/typedEventEmitter';
export { retryWithDelay } from './network/retry';

// Export EIP-6963 provider announcement
export { announceProvider, passportProviderInfo } from './provider/eip6963';
