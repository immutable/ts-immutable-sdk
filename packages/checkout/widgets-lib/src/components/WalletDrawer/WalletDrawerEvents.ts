import { EIP1193Provider, EIP6963ProviderDetail } from '@imtbl/checkout-sdk';

export type WalletChangeEvent = {
  walletType: 'injected' | 'walletconnect';
  provider: EIP1193Provider;
  providerDetail: EIP6963ProviderDetail;
};
