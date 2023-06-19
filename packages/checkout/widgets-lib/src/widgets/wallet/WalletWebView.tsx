import { Environment } from '@imtbl/config';
import { CheckoutWidgets, WalletReact } from '@imtbl/checkout-widgets';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '../../lib';

function WalletWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  CheckoutWidgets(config);

  return (
    <WalletReact walletProvider={WalletProviderName.METAMASK} />
  );
}

export default WalletWebView;
