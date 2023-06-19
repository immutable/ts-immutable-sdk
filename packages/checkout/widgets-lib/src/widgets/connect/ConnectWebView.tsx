import { Environment } from '@imtbl/config';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { CheckoutWidgets, ConnectReact } from '@imtbl/checkout-widgets';
import { WidgetTheme } from '../../lib';

function ConnectWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  CheckoutWidgets(config);

  return (
    <div>
      <ConnectReact walletProvider={WalletProviderName.METAMASK} />
    </div>
  );
}

export default ConnectWebView;
