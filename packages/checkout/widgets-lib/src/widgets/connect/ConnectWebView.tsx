import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function ConnectWebView() {
  return (
    <imtbl-connect
      providerPreference={WidgetConnectionProviders.METAMASK}
      theme={WidgetTheme.DARK}
      environment={Environment.SANDBOX}
    />
  );
}

export default ConnectWebView;
