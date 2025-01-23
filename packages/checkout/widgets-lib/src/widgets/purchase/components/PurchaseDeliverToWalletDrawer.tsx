import {
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { useTranslation } from 'react-i18next';
import { PurchaseConnectWalletDrawer } from './PurchaseConnectWalletDrawer';

type PurchaseDeliverToWalletDrawerProps = {
  visible: boolean;
  onClose: (toAddress?: string) => void;
  walletOptions: EIP6963ProviderDetail[];
  onConnect?: (
    providerType: 'from' | 'to',
    provider: Web3Provider,
    providerInfo: EIP6963ProviderInfo
  ) => void;
};

export function PurchaseDeliverToWalletDrawer({
  visible,
  onClose,
  onConnect,
  walletOptions,
}: PurchaseDeliverToWalletDrawerProps) {
  const handleOnConnect = (
    provider: Web3Provider,
    providerInfo: EIP6963ProviderInfo,
  ) => {
    onConnect?.('to', provider, providerInfo);
  };

  const { t } = useTranslation();
  return (
    <PurchaseConnectWalletDrawer
      heading={t('drawers.wallet.deliverToHeading')}
      visible={visible}
      onClose={onClose}
      providerType="to"
      walletOptions={walletOptions}
      onConnect={handleOnConnect}
    />
  );
}
