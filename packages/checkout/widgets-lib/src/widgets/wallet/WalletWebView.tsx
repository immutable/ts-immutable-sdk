import { Environment } from '@imtbl/config';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '../../lib';

function WalletWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-wallet
      providerPreference={ConnectionProviders.METAMASK}
      widgetConfig={JSON.stringify(config)}
    />
  );
}

export default WalletWebView;
