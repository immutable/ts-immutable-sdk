import {
  CheckoutWidgets,
  CheckoutWidgetsConfig,
  WidgetTheme,
  ConnectReact,
  UpdateConfig,
  CheckoutWidgetTagNames,
  SetProvider,
} from '@imtbl/checkout-widgets';

import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider } from '@ethersproject/providers';
import { useEffect } from 'react';
import { Environment } from '@imtbl/config';

export function AsyncLoader() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  });

  const widgetsConfig2: CheckoutWidgetsConfig = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  UpdateConfig(widgetsConfig2);

  useEffect(() => {
    (async () => {
      const provider: Web3Provider | null = await detectEthereumProvider();
      SetProvider(CheckoutWidgetTagNames.WALLET, provider);
    })();
  });

  return (
    <div>
      <h1>Async Loader Test</h1>
      <ConnectReact />
    </div>
  );
}
