import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function BuyWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-buy
      providerPreference={WidgetConnectionProviders.METAMASK}
      widgetConfig={JSON.stringify(config)}
      orderId="2345"
    />
  );
}

export default BuyWebView;
