import { Environment } from '@imtbl/config';
import { WidgetTheme } from '../../lib';

function BridgeWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-bridge
      widgetConfig={JSON.stringify(config)}
      walletProvider="metamask"
    />
  );
}

export default BridgeWebView;
