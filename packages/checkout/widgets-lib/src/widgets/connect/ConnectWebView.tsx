import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function ConnectWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-connect
      providerPreference={WidgetConnectionProviders.METAMASK}
      widgetConfig={JSON.stringify(config)}
    />
  );
}

export default ConnectWebView;
