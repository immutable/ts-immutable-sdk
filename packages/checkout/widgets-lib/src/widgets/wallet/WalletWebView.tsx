import { Environment } from '@imtbl/config';
import {
  CheckoutWidgets, WalletReact,
} from '@imtbl/checkout-widgets';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import { useEffect, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { WidgetTheme } from '../../lib';

function WalletWebView() {
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
    <WalletReact provider={provider} />
  );
}

export default WalletWebView;
