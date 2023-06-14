import { Environment } from '@imtbl/config';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '../../lib';

function WalletWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-wallet
      walletProvider={WalletProviderName.METAMASK}
      widgetConfig={JSON.stringify(config)}
    />
  );
}

export default WalletWebView;
