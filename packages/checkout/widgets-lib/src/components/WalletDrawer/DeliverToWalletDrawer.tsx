import {
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { useContext } from 'react';
import { ConnectWalletDrawer } from './ConnectWalletDrawer';
import { ConnectEIP6963ProviderError } from '../../lib/connectEIP6963Provider';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../context/view-context/ViewContext';

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
  const { viewDispatch } = useContext(ViewContext);

  const handleOnConnect = (provider: Web3Provider, providerInfo: EIP6963ProviderInfo) => {
    onConnect('to', provider, providerInfo);
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

  return (
    <ConnectWalletDrawer
      heading="Deliver To"
      visible={visible}
      onClose={onClose}
      providerType="to"
      walletOptions={walletOptions}
      onConnect={handleOnConnect}
      onError={handleOnError}
    />
  );
}
