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
      walletProvider="metramask"
      amount="nah"
      fromContractAddress="0x2fa06c6672ddcc066ab04631192738799231de4a"
    />
  );
}

export default BridgeWebView;
