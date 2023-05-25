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
      amount="1"
      fromContractAddress="0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE"
      toContractAddress=""
    />
  );
}

export default SwapWebView;
