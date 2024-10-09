import { EIP6963ProviderDetail, EIP6963ProviderInfo } from '@imtbl/checkout-sdk';
import { useMemo } from 'react';
import { MenuItem } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { ConnectWalletDrawer } from './ConnectWalletDrawer';
import { useProvidersContext } from '../../context/providers-context/ProvidersContext';

type PayWithWalletDrawerProps = {
  visible: boolean;
  onClose: () => void;
  onConnect: (providerType: 'from' | 'to', provider: Web3Provider, providerInfo: EIP6963ProviderInfo) => void;
  onPayWithCard: () => void;
  walletOptions: EIP6963ProviderDetail[];
  insufficientBalance?: boolean;
};

export function PayWithWalletDrawer({
  visible,
  onClose,
  onConnect,
  onPayWithCard,
  walletOptions,
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
      onConnect={(provider, providerInfo) => onConnect('from', provider, providerInfo)}
    />
  );
}
