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
import { useProvidersContext } from '../../context/providers-context/ProvidersContext';

type DeliverToWalletDrawerProps = {
  visible: boolean;
  onClose: (toAddress?: string) => void;
  walletOptions: EIP6963ProviderDetail[];
  onConnect?: (
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
  const {
    providersState: { fromProviderInfo },
  } = useProvidersContext();

  const { viewDispatch } = useContext(ViewContext);

  const handleOnConnect = (
    provider: Web3Provider,
    providerInfo: EIP6963ProviderInfo,
  ) => {
    onConnect?.('to', provider, providerInfo);
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

  // Becuase wallets extensions don't support multiple wallet connections
  // UX decides to have the user use the same wallet type they selected to pay with
  // ie: Metamask to Metamsk, will send to same wallet address
  const selectedSameFromWalletType = (
    providerInfo: EIP6963ProviderInfo,
  ): boolean | undefined => (fromProviderInfo?.rdns !== providerInfo.rdns ? undefined : false);

  return (
    <ConnectWalletDrawer
      heading="Deliver To"
      visible={visible}
      onClose={onClose}
      providerType="to"
      walletOptions={walletOptions}
      onConnect={handleOnConnect}
      onError={handleOnError}
      getShouldRequestWalletPermissions={
        selectedSameFromWalletType
      }
    />
  );
}
