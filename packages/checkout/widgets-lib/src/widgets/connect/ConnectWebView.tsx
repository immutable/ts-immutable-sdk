import { Environment } from '@imtbl/config';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '../../lib';

function ConnectWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-connect
      providerName={WalletProviderName.METAMASK}
      widgetConfig={JSON.stringify(config)}
    />
  );
}

export default ConnectWebView;
