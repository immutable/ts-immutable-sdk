import {
  CheckoutWidgets,
  CheckoutWidgetsConfig,
  WidgetConnectionProviders,
  WidgetTheme,
  ConnectReact,
  UpdateConfig,
  CheckoutWidgetTagNames,
  SetProvider,
} from '@imtbl/checkout-widgets';

import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider } from '@ethersproject/providers';
import { useEffect } from 'react';

export function AsyncLoader() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
  });

  const widgetsConfig2: CheckoutWidgetsConfig = {
    theme: WidgetTheme.DARK,
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
      <ConnectReact providerPreference={WidgetConnectionProviders.METAMASK} />
    </div>
  );
}
