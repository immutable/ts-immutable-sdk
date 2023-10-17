import { WidgetTheme } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';

function SwapWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-swap widgetConfig={JSON.stringify(config)} />
  );
}

export default SwapWebView;
