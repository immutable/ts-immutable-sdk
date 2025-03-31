import { EIP6963ProviderDetail, EIP6963ProviderInfo, WrappedBrowserProvider } from '@imtbl/checkout-sdk';
import { useMemo } from 'react';
import { MenuItem } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { PurchaseConnectWalletDrawer } from './PurchaseConnectWalletDrawer';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';

type PurchasePayWithWalletDrawerProps = {
  visible: boolean;
  onClose: (fromAddress?: string) => void;
  onConnect: (providerType: 'from' | 'to', provider: WrappedBrowserProvider, providerInfo: EIP6963ProviderInfo) => void;
  onPayWithCard?: () => void;
  walletOptions: EIP6963ProviderDetail[];
  insufficientBalance?: boolean;
  showOnRampOption?: boolean;
};

export function PurchasePayWithWalletDrawer({
  visible,
  onClose,
  onConnect,
  onPayWithCard,
  walletOptions,
  insufficientBalance,
  showOnRampOption = true,
}: PurchasePayWithWalletDrawerProps) {
  const { t } = useTranslation();
  const { providersState: { fromProviderInfo } } = useProvidersContext();

  const disabledOptions = useMemo(() => {
    if (insufficientBalance && fromProviderInfo) {
      return [{
        label: t('drawers.wallet.insufficientFunds'),
        rdns: fromProviderInfo.rdns,
      }];
    }

    return [];
  }, [t, insufficientBalance, fromProviderInfo]);

  const handleOnConnect = (provider: WrappedBrowserProvider, providerInfo: EIP6963ProviderInfo) => {
    onConnect('from', provider, providerInfo);
  };

  const payWithCardItem = useMemo(() => {
    if (!showOnRampOption) return null;

    return (
      <MenuItem
        size="small"
        emphasized
        onClick={() => {
          onClose();
          onPayWithCard?.();
        }}
      >
        <MenuItem.FramedIcon
          icon="BankCard"
          variant="bold"
          emphasized={false}
        />
        <MenuItem.Label>{t('drawers.wallet.payWithCard')}</MenuItem.Label>
      </MenuItem>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, onPayWithCard]);

  return (
    <PurchaseConnectWalletDrawer
      heading={
        insufficientBalance
          ? t('drawers.wallet.payWithHeadingInsufficientBalance')
          : t('drawers.wallet.payWithHeading')
      }
      visible={visible}
      onClose={onClose}
      providerType="from"
      walletOptions={walletOptions}
      disabledOptions={disabledOptions}
      bottomSlot={payWithCardItem}
      onConnect={handleOnConnect}
      shouldIdentifyUser={false}
    />
  );
}
