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
      fromContractAddress="0xb95b75b4e4c09f04d5da6349861bf1b6f163d78c"
      toContractAddress="0xac953a0d7b67fae17c87abf79f09d0f818ac66a2"
      amount="12"
    />
  );
}

export default SwapWebView;
