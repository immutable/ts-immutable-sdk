import { Environment } from '@imtbl/config';
import { WidgetTheme } from '../../lib';

function SmartWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-smart-checkout widgetConfig={JSON.stringify(config)} walletProvider="metamask" />
  );
}

export default SmartWebView;
