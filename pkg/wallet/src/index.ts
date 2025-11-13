import type { Auth } from '@imtbl/auth';
import type { Provider, ChainConfig } from './provider';

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

export type { Signer } from './signer/signer';

import { PassportEVMProvider } from './provider';
import { announceProvider, passportProviderInfo } from './eip6963';

export async function connectWallet(
  config?: WalletConfig
): Promise<Provider> {
  const chains = config?.chains || getDefaultChains();

  const provider = new PassportEVMProvider({
    chains,
    initialChainId: config?.initialChainId,
    authenticatedUser: undefined,
    auth: config?.auth,
    popupOverlayOptions: config?.popupOverlayOptions,
  });

  if (config?.announceProvider !== false) {
    announceProvider({
      info: passportProviderInfo,
      provider,
    });
  }

  return provider;
}

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

