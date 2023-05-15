import {
  WidgetTheme,
  WidgetConnectionProviders,
  SwapReact,
  CheckoutWidgets,
  CheckoutWidgetsConfig,
  UpdateConfig,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function SwapUI() {
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
    <div className="Swap">
      <h1 className="sample-heading">Checkout Swap (Web Component)</h1>
      <SwapReact
        providerPreference={WidgetConnectionProviders.METAMASK}
        amount="50000000000000000000"
        fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
        toContractAddress=""
      />
    </div>
  );
}

export default SwapUI;
