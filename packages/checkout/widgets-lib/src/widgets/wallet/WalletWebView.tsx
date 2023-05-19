import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function WalletWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-wallet
      providerPreference={WidgetConnectionProviders.METAMASK}
      widgetConfig={JSON.stringify(config)}
    />
  );
}

export default WalletWebView;
