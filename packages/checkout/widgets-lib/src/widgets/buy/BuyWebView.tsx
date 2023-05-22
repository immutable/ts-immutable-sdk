import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function BuyWebView() {
  return (
    <imtbl-buy
      providerPreference={WidgetConnectionProviders.METAMASK}
      theme={WidgetTheme.DARK}
      environment={Environment.SANDBOX}
      orderId="2345"
    />
  );
}

export default BuyWebView;
