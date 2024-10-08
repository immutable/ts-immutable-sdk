import { EIP6963ProviderDetail } from '@imtbl/checkout-sdk';
import { useMemo } from 'react';
import { MenuItem } from '@biom3/react';
import { ConnectWalletDrawer } from './ConnectWalletDrawer';
import { useProvidersContext } from '../../context/providers-context/ProvidersContext';

type PayWithWalletDrawerProps = {
  visible: boolean;
  onClose: () => void;
  onPayWithCard: () => void;
  walletOptions: EIP6963ProviderDetail[];
  insufficientBalance?: boolean;
};

export function PayWithWalletDrawer({
  visible,
  onClose,
  walletOptions,
  onPayWithCard,
  insufficientBalance,
}: PayWithWalletDrawerProps) {
  // TODO: Implement pay with card option
  // TODO: Implement not available option with custom label when insufficient balance

  const { providersState: { fromProviderInfo } } = useProvidersContext();

  const disabledOptions = useMemo(() => {
    if (insufficientBalance && fromProviderInfo) {
      return [{
        label: 'insufficient funds',
        rdns: fromProviderInfo.rdns,
      }];
    }

    return [];
  }, [insufficientBalance, fromProviderInfo]);

  const payWithCardItem = useMemo(
    () => (
      <MenuItem
        size="small"
        emphasized
        onClick={() => {
          onClose();
          onPayWithCard();
        }}
      >
        <MenuItem.FramedIcon
          icon="BankCard"
          variant="bold"
          emphasized={false}
        />
        <MenuItem.Label>Pay with Card</MenuItem.Label>
      </MenuItem>
    ),
    [onClose, onPayWithCard],
  );

  return (
    <ConnectWalletDrawer
      heading={insufficientBalance ? 'Choose another option' : 'Pay With'}
      visible={visible}
      onClose={onClose}
      providerType="from"
      walletOptions={walletOptions}
      disabledOptions={disabledOptions}
      bottomSlot={payWithCardItem}
    />
  );
}
