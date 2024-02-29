import { EIP1193Provider } from 'mipd';
import { EIP6963ProviderDetail } from 'mipd/src/types';

export type WalletChangeEvent = {
  walletType: 'injected' | 'walletconnect';
  provider: EIP1193Provider;
  providerDetail: EIP6963ProviderDetail;
};
