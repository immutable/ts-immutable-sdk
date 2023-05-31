import { Environment } from '@imtbl/config';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '../../lib';

function BuyWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-buy
      providerPreference={ConnectionProviders.METAMASK}
      widgetConfig={JSON.stringify(config)}
      orderId="2345"
    />
  );
}

export default BuyWebView;
