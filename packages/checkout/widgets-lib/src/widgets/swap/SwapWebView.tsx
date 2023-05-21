import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function SwapWebView() {
  return (
    <imtbl-swap
      providerPreference={WidgetConnectionProviders.METAMASK}
      theme={WidgetTheme.DARK}
      environment={Environment.SANDBOX}
      amount="50000000000000000000"
      fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
      toContractAddress=""
    />
  );
}

export default SwapWebView;
