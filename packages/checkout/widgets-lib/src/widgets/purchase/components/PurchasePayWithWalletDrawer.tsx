import { EIP6963ProviderDetail, EIP6963ProviderInfo } from '@imtbl/checkout-sdk';
import { useMemo } from 'react';
import { MenuItem } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { useTranslation } from 'react-i18next';
import { PurchaseConnectWalletDrawer } from './PurchaseConnectWalletDrawer';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';

type PurchasePayWithWalletDrawerProps = {
  visible: boolean;
  onClose: (fromAddress?: string) => void;
  onConnect: (providerType: 'from' | 'to', provider: Web3Provider, providerInfo: EIP6963ProviderInfo) => void;
  onPayWithCard?: () => void;
  walletOptions: EIP6963ProviderDetail[];
  insufficientBalance?: boolean;
  showOnRampOption?: boolean;
  isPayWithCard?: boolean;
};

export function PurchasePayWithWalletDrawer({
  visible,
  onClose,
  onConnect,
  onPayWithCard,
  walletOptions,
  insufficientBalance,
  showOnRampOption = true,
  isPayWithCard = false,
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

  const handleOnConnect = (provider: Web3Provider, providerInfo: EIP6963ProviderInfo) => {
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
      isPayWithCard={isPayWithCard}
    />
  );
}
