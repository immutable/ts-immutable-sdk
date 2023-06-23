import { Environment } from '@imtbl/config';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import {
  CheckoutWidgets, SetProvider, CheckoutWidgetTagNames, BridgeReact,
} from '@imtbl/checkout-widgets';
import { useEffect } from 'react';

import { WidgetTheme } from '../../lib';

function BridgeWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  CheckoutWidgets(config);

  const checkout = new Checkout({ baseConfig: { environment: Environment.SANDBOX } });

  useEffect(() => {
    (async () => {
      const createProviderRes = await checkout.createProvider({ walletProvider: WalletProviderName.METAMASK });
      SetProvider(CheckoutWidgetTagNames.BRIDGE, createProviderRes.provider);
    })();
  });

  return (
    <BridgeReact
      walletProvider={WalletProviderName.METAMASK}
      fromContractAddress="0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE"
      amount="0.1"
    />
  );
}

export default BridgeWebView;
