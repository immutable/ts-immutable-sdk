import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function BridgeWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-bridge
      providerPreference={WidgetConnectionProviders.METAMASK}
      widgetConfig={JSON.stringify(config)}
      amount="50"
      fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
      fromNetwork="Sepolia"
    />
  );
}

export default BridgeWebView;
