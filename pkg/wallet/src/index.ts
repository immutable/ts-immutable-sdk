/**
 * @imtbl/wallet - Minimal wallet package
 * 
 * Provides EIP-1193 compatible wallet provider for Immutable zkEVM.
 * Can be used standalone or with authenticated user for enhanced functionality.
 */

import type { Auth } from '@imtbl/auth';
import type { Provider, ChainConfig } from './provider';

/**
 * Wallet configuration (optional)
 */
export interface WalletConfig {
  /** Chain configurations - if omitted, uses default Immutable chains */
  chains?: ChainConfig[];
  /** Initial chain ID (defaults to first chain) */
  initialChainId?: number;
  /** Optional auth client - login/getUser handled automatically */
  auth?: Auth;
  /** Optional popup overlay options */
  popupOverlayOptions?: {
    disableGenericPopupOverlay?: boolean;
    disableBlockedPopupOverlay?: boolean;
  };
  /** Announce provider via EIP-6963 (default: true) */
  announceProvider?: boolean;
}

/**
 * Signer interface - library agnostic
 * Compatible with ethers Signer, viem WalletClient, or custom implementations
 */
export type { Signer } from './signer/signer';


/**
 * Connects to Immutable Passport wallet and returns an EIP-1193 compatible provider.
 * 
 * Returns provider directly - use with any EIP-1193 compatible library.
 * Signer is handled automatically internally when user is authenticated.
 * 
 * @example
 * ```typescript
 * // Standalone (zero config - uses default Immutable chains)
 * import { connectWallet } from '@imtbl/wallet';
 * 
 * const provider = await connectWallet();
 * 
 * // With custom chain configuration
 * const provider = await connectWallet({
 *   chains: [{
 *     chainId: 13371,
 *     rpcUrl: 'https://rpc.immutable.com',
 *     relayerUrl: 'https://api.immutable.com/relayer-mr',
 *     apiUrl: 'https://api.immutable.com',
 *     name: 'Immutable zkEVM',
 *   }],
 * });
 * 
 * // Use with viem
 * import { createWalletClient, custom } from 'viem';
 * const client = createWalletClient({
 *   transport: custom(provider),
 * });
 * 
 * // Request accounts
 * const accounts = await provider.request({ method: 'eth_requestAccounts' });
 * 
 * // With authentication (enhanced features)
 * // Login/getUser handled automatically under the hood
 * import { Auth } from '@imtbl/auth';
 * 
 * const auth = new Auth({ clientId: '...', redirectUri: '...' });
 * const provider = await connectWallet({ auth });
 * // Auth client handles login/getUser automatically when needed
 * // Signer is automatically initialized internally
 * ```
 */
import { PassportEVMProvider } from './provider';
import { announceProvider, passportProviderInfo } from './eip6963';

export async function connectWallet(
  config?: WalletConfig
): Promise<Provider> {
  // Use provided chains or default Immutable chains
  const chains = config?.chains || getDefaultChains();
  
  const provider = new PassportEVMProvider({
    chains,
    initialChainId: config?.initialChainId,
    authenticatedUser: undefined, // Will be set automatically when login is triggered
    auth: config?.auth, // Pass auth client for automatic login
    popupOverlayOptions: config?.popupOverlayOptions,
  });

  // Announce provider via EIP-6963 if requested
  if (config?.announceProvider !== false) {
    announceProvider({
      info: passportProviderInfo,
      provider,
    });
  }

  return provider;
}

/**
 * Gets default Immutable chain configurations
 */
function getDefaultChains(): ChainConfig[] {
  return [
    {
      chainId: 13473,
      rpcUrl: 'https://rpc.testnet.immutable.com',
      relayerUrl: 'https://api.sandbox.immutable.com/relayer-mr',
      apiUrl: 'https://api.sandbox.immutable.com',
      name: 'Immutable zkEVM Testnet',
    },
    {
      chainId: 13371,
      rpcUrl: 'https://rpc.immutable.com',
      relayerUrl: 'https://api.immutable.com/relayer-mr',
      apiUrl: 'https://api.immutable.com',
      name: 'Immutable zkEVM',
    },
  ];
}

