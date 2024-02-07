import { WalletProviderName } from '@imtbl/checkout-sdk';

export function getWalletLogoByName(walletProviderName: WalletProviderName) {
  switch (walletProviderName) {
    case WalletProviderName.METAMASK: return 'MetaMaskSymbol';
    case WalletProviderName.PASSPORT: return 'PassportSymbolOutlined';
    case WalletProviderName.WALLET_CONNECT: return 'WalletConnectSymbol';
    default: return 'MetaMaskSymbol';
  }
}

export function getWalletDisplayName(walletProviderName: WalletProviderName) {
  switch (walletProviderName) {
    case WalletProviderName.METAMASK: {
      return 'MetaMask';
    }
    case WalletProviderName.PASSPORT: {
      return 'Passport';
    }
    case WalletProviderName.WALLET_CONNECT: {
      return 'WalletConnect';
    }
    default:
      return 'Other';
  }
}
