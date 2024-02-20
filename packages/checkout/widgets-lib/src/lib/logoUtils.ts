import { WalletProviderName } from '@imtbl/checkout-sdk';

export function getWalletLogoByName(walletProviderName: WalletProviderName | string) {
  switch (walletProviderName) {
    case WalletProviderName.METAMASK: return 'MetaMaskSymbol';
    case WalletProviderName.PASSPORT: return 'PassportSymbolOutlined';
    case 'walletconnect': return 'WalletConnectSymbol';
    default: return 'MetaMaskSymbol';
  }
}

export function getWalletDisplayName(walletProviderName: WalletProviderName | string) {
  switch (walletProviderName) {
    case WalletProviderName.METAMASK: {
      return 'MetaMask';
    }
    case WalletProviderName.PASSPORT: {
      return 'Passport';
    }
    case 'WalletConnect': {
      return 'WalletConnect';
    }
    default:
      return 'Other';
  }
}