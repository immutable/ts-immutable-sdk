import { Environment } from '@imtbl/config';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '../../lib';

function ConnectWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-connect
      providerPreference={ConnectionProviders.METAMASK}
      widgetConfig={JSON.stringify(config)}
    />
  );
}

export default ConnectWebView;
