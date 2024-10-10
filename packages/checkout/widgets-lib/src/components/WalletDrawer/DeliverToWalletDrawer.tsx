import {
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { ConnectWalletDrawer } from './ConnectWalletDrawer';

type DeliverToWalletDrawerProps = {
  visible: boolean;
  onClose: () => void;
  walletOptions: EIP6963ProviderDetail[];
  onConnect: (
    providerType: 'from' | 'to',
    provider: Web3Provider,
    providerInfo: EIP6963ProviderInfo
  ) => void;
};

export function DeliverToWalletDrawer({
  visible,
  onClose,
  onConnect,
  walletOptions,
}: DeliverToWalletDrawerProps) {
  return (
    <ConnectWalletDrawer
      heading="Deliver To"
      visible={visible}
      onClose={onClose}
      providerType="to"
      walletOptions={walletOptions}
      onConnect={(provider, providerInfo) => onConnect('to', provider, providerInfo)}
    />
  );
}
