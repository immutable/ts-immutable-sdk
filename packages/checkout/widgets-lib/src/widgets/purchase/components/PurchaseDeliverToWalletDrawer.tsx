import {
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
} from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { BrowserProvider } from 'ethers';
import { PurchaseConnectWalletDrawer } from './PurchaseConnectWalletDrawer';

type PurchaseDeliverToWalletDrawerProps = {
  visible: boolean;
  onClose: (toAddress?: string) => void;
  walletOptions: EIP6963ProviderDetail[];
  onConnect?: (
    providerType: 'from' | 'to',
    provider: BrowserProvider,
    providerInfo: EIP6963ProviderInfo
  ) => void;
  drawerBackground: string | undefined;
};

export function PurchaseDeliverToWalletDrawer({
  visible,
  onClose,
  onConnect,
  walletOptions,
  drawerBackground,
}: PurchaseDeliverToWalletDrawerProps) {
  const handleOnConnect = (
    provider: BrowserProvider,
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
      drawerBackground={drawerBackground}
    />
  );
}
