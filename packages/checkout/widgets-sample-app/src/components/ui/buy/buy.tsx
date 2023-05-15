import {
  WidgetTheme,
  WidgetConnectionProviders,
  CheckoutWidgets,
  BuyReact,
  CheckoutWidgetsConfig,
  UpdateConfig,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function BuyUI() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  });

  const widgetsConfig2: CheckoutWidgetsConfig = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  UpdateConfig(widgetsConfig2);

  return (
    <div className="Buy">
      <h1 className="sample-heading">Checkout Buy Order (Web Component)</h1>
      <BuyReact
        providerPreference={WidgetConnectionProviders.METAMASK}
        orderId={`1234`}
      />
    </div>
  );
}

export default BuyUI;
