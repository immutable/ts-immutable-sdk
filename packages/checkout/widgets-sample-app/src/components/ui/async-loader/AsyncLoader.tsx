import {
  CheckoutWidgets,
  CheckoutWidgetsConfig,
  ConnectionProviders,
  WidgetTheme,
  // ConnectWidgetReact,
  UpdateConfig,
  CheckoutWidgetTagNames,
  WalletWidgetReact,
  SetProvider,
} from '@imtbl/checkout-widgets-react';

import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider } from '@ethersproject/providers';
import { useEffect } from 'react';

export function AsyncLoader() {
  const widgetsConfig: CheckoutWidgetsConfig = {
    theme: WidgetTheme.LIGHT,
  };

  CheckoutWidgets(widgetsConfig);

  const widgetsConfig2: CheckoutWidgetsConfig = {
    theme: WidgetTheme.DARK,
  };

  UpdateConfig(widgetsConfig2);

  useEffect(() => {
    (async () => {
      const provider: Web3Provider | null = await detectEthereumProvider();
      if (provider) {
        SetProvider(CheckoutWidgetTagNames.WALLET, provider);
      }
    })();
  });

  return (
    <div>
      <h1>Async Loader Test</h1>
      <WalletWidgetReact providerPreference={ConnectionProviders.METAMASK} />
    </div>
  );
}
