import { Environment } from '@imtbl/config';
import { WidgetTheme } from '../../lib';

function SwapWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-swap
      widgetConfig={JSON.stringify(config)}
      walletProvider="metamask"
      amount=""
      fromContractAddress=""
      toContractAddress=""
    />
  );
}

export default SwapWebView;
