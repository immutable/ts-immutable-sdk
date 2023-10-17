import { Environment } from '@imtbl/config';
import { WidgetTheme } from '@imtbl/checkout-sdk';

function ConnectWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-connect widgetConfig={JSON.stringify(config)} />
  );
}

export default ConnectWebView;
