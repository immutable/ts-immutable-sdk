import {
  CheckoutWidgets,
  CheckoutWidgetsConfig,
  ConnectionProviders,
  WidgetTheme,
  ConnectWidgetReact,
  UpdateConfig,
  CheckoutWidgetTagNames,
  // SetProvider,
} from '@imtbl/checkout-widgets-react';

import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider } from '@ethersproject/providers';
import { useEffect } from 'react';

export function AsyncLoader() {
  const widgetsConfig: CheckoutWidgetsConfig = {
    theme: WidgetTheme.DARK,
  };

  CheckoutWidgets(widgetsConfig);

  const widgetsConfig2: CheckoutWidgetsConfig = {
    theme: WidgetTheme.LIGHT,
  };

  UpdateConfig(widgetsConfig2);

  useEffect(() => {
    async () => {
      const provider: Web3Provider | null = await detectEthereumProvider();
      if (provider) {
        // SetProvider(CheckoutWidgetTagNames.CONNECT, provider);
      }
    };
  });

  return (
    <div>
      <h1>Async Loader Test</h1>
      <ConnectWidgetReact providerPreference={ConnectionProviders.METAMASK} />
    </div>
  );
}
