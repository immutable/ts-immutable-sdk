import { EIP6963ProviderDetail } from '@imtbl/checkout-sdk';
import { ConnectWalletDrawer } from './ConnectWalletDrawer';

type DeliverToWalletDrawerProps = {
  visible: boolean;
  onClose: () => void;
  walletOptions: EIP6963ProviderDetail[];
};

export function DeliverToWalletDrawer({
  visible,
  onClose,
  walletOptions,
  // insufficientBalance,
}: DeliverToWalletDrawerProps) {
  // TODO: Implement pay with card option
  // TODO: Implement not available option with custom label when insufficient balance

  return (
    <ConnectWalletDrawer
      heading="Deliver To"
      visible={visible}
      onClose={onClose}
      providerType="to"
      walletOptions={walletOptions}
    />
  );
}
