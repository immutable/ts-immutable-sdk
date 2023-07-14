/* eslint-disable */ 
import React from 'react';

import { WalletProviderName } from '@imtbl/checkout-sdk';
import {
  WidgetTheme,
  BridgeReact,
  CheckoutWidgets,
  CheckoutWidgetsConfig,
  UpdateConfig,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function BridgeUI() {
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
      <BridgeReact
        walletProvider={WalletProviderName.METAMASK}
      />
    </div>
  );
}

export default BridgeUI;
