import { Environment } from '@imtbl/config';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '../../lib';

function BridgeWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-bridge
      providerPreference={ConnectionProviders.METAMASK}
      widgetConfig={JSON.stringify(config)}
      amount=""
      fromContractAddress=""
      fromNetwork="Sepolia"
    />
  );
}

export default BridgeWebView;
