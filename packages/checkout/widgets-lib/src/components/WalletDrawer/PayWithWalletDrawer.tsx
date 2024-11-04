import { EIP6963ProviderDetail, EIP6963ProviderInfo } from '@imtbl/checkout-sdk';
import { useContext, useMemo } from 'react';
import { MenuItem } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { ConnectWalletDrawer } from './ConnectWalletDrawer';
import { useProvidersContext } from '../../context/providers-context/ProvidersContext';
import { ConnectEIP6963ProviderError } from '../../lib/connectEIP6963Provider';
import { SharedViews, ViewActions, ViewContext } from '../../context/view-context/ViewContext';

type PayWithWalletDrawerProps = {
  visible: boolean;
  onClose: (fromAddress?: string) => void;
  onConnect: (providerType: 'from' | 'to', provider: Web3Provider, providerInfo: EIP6963ProviderInfo) => void;
  onPayWithCard?: () => void;
  walletOptions: EIP6963ProviderDetail[];
  insufficientBalance?: boolean;
  showOnRampOption?: boolean;
};

export function PayWithWalletDrawer({
  visible,
  onClose,
  onConnect,
  onPayWithCard,
  walletOptions,
  insufficientBalance,
  showOnRampOption = true,
}: PayWithWalletDrawerProps) {
  const { providersState: { fromProviderInfo } } = useProvidersContext();
  const { viewDispatch } = useContext(ViewContext);

  const disabledOptions = useMemo(() => {
    if (insufficientBalance && fromProviderInfo) {
      return [{
        label: 'insufficient funds',
        rdns: fromProviderInfo.rdns,
      }];
    }

    return [];
  }, [insufficientBalance, fromProviderInfo]);

  const handleOnConnect = (provider: Web3Provider, providerInfo: EIP6963ProviderInfo) => {
    onConnect('from', provider, providerInfo);
  };

  const handleOnError = (errorType: ConnectEIP6963ProviderError) => {
    if (errorType === ConnectEIP6963ProviderError.SANCTIONED_ADDRESS) {
      onClose();
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW,
            error: new Error(errorType),
          },
        },
      });
    }
  };

  const payWithCardItem = useMemo(
    () => {
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
          <MenuItem.Label>Pay with Card</MenuItem.Label>
        </MenuItem>
      );
    },
    [onClose, onPayWithCard],
  );

  return (
    <ConnectWalletDrawer
      heading={insufficientBalance ? 'Choose another option' : 'Send from'}
      visible={visible}
      onClose={onClose}
      providerType="from"
      walletOptions={walletOptions}
      disabledOptions={disabledOptions}
      bottomSlot={payWithCardItem}
      onConnect={handleOnConnect}
      onError={handleOnError}
    />
  );
}
