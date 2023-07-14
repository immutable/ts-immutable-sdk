/* eslint-disable */ 

import { WalletProviderName } from '@imtbl/checkout-sdk';
import {
  WidgetTheme,
  SwapReact,
  CheckoutWidgets,
  CheckoutWidgetsConfig,
  UpdateConfig,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function SwapUI() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  });

  const widgetsConfig2: CheckoutWidgetsConfig = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  UpdateConfig(widgetsConfig2);

  return (
    <div className="Swap">
      <SwapReact
        walletProvider={WalletProviderName.METAMASK}
      />
    </div>
  );
}

export default SwapUI;
