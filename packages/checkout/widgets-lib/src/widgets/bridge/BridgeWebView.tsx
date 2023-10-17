import { Environment } from '@imtbl/config';
import { WidgetTheme } from '@imtbl/checkout-sdk';

function BridgeWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-bridge widgetConfig={JSON.stringify(config)} />
  );
}

export default BridgeWebView;
