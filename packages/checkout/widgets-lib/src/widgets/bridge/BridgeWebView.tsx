import { Environment } from '@imtbl/config';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import {
  CheckoutWidgets, BridgeReact,
} from '@imtbl/checkout-widgets';
import { useEffect, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { WidgetTheme } from '../../lib';

function BridgeWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  const [provider, setProvider] = useState<Web3Provider>();

  CheckoutWidgets(config);

  const checkout = new Checkout({ baseConfig: { environment: Environment.SANDBOX } });

  useEffect(() => {
    (async () => {
      if (!provider) {
        const createProviderRes = await checkout.createProvider({ walletProvider: WalletProviderName.METAMASK });
        setProvider(createProviderRes.provider);
      }
    })();
  });

  return (
    <BridgeReact provider={provider} />
  );
}

export default BridgeWebView;
