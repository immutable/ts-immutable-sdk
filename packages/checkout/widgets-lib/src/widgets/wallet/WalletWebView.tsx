import { Environment } from '@imtbl/config';
import { WidgetTheme } from '../../lib';

function WalletWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-wallet widgetConfig={JSON.stringify(config)} walletProvider="metamask" />
  );
}

export default WalletWebView;
