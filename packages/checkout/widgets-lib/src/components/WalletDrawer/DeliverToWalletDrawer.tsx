import {
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { ConnectWalletDrawer } from './ConnectWalletDrawer';
import { useProvidersContext } from '../../context/providers-context/ProvidersContext';

type DeliverToWalletDrawerProps = {
  visible: boolean;
  onClose: (toAddress?: string) => void;
  walletOptions: EIP6963ProviderDetail[];
  onConnect?: (
    providerType: 'from' | 'to',
    provider: WrappedBrowserProvider,
    providerInfo: EIP6963ProviderInfo
  ) => void;
};

export function DeliverToWalletDrawer({
  visible,
  onClose,
  onConnect,
  walletOptions,
}: DeliverToWalletDrawerProps) {
  const {
    providersState: { fromProviderInfo },
  } = useProvidersContext();

  const handleOnConnect = (
    provider: WrappedBrowserProvider,
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
    <ConnectWalletDrawer
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
