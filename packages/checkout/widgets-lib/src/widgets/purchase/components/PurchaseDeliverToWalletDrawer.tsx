import {
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { useTranslation } from 'react-i18next';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';
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
  const {
    providersState: { fromProviderInfo },
  } = useProvidersContext();

  const handleOnConnect = (
    provider: Web3Provider,
    providerInfo: EIP6963ProviderInfo,
  ) => {
    onConnect?.('to', provider, providerInfo);
  };

  // Because wallets extensions don't support multiple wallet connections
  // UX decides to have the user use the same wallet type they selected to pay with
  // ie: Metamask to Metamsk, will send to same wallet address
  const selectedSameFromWalletType = (
    providerInfo: EIP6963ProviderInfo,
  ): boolean | undefined => (fromProviderInfo?.rdns !== providerInfo.rdns ? undefined : false);
  const { t } = useTranslation();
  return (
    <PurchaseConnectWalletDrawer
      heading={t('drawers.wallet.deliverToHeading')}
      visible={visible}
      onClose={onClose}
      providerType="to"
      walletOptions={walletOptions}
      onConnect={handleOnConnect}
      getShouldRequestWalletPermissions={
        selectedSameFromWalletType
      }
    />
  );
}
