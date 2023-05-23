import { ConnectionProviders } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { WidgetTheme } from '../../lib';

function SwapWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-swap
      providerPreference={ConnectionProviders.METAMASK}
      widgetConfig={JSON.stringify(config)}
      amount="50000000000000000000"
      fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
      toContractAddress=""
    />
  );
}

export default SwapWebView;
