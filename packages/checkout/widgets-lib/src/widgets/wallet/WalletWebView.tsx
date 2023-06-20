import { Environment } from '@imtbl/config';
import {
  CheckoutWidgets, WalletReact, SetProvider, CheckoutWidgetTagNames,
} from '@imtbl/checkout-widgets';
import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import { useEffect } from 'react';
import { WidgetTheme } from '../../lib';

function WalletWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  CheckoutWidgets(config);

  const checkout = new Checkout({ baseConfig: { environment: Environment.SANDBOX } });

  useEffect(() => {
    (async () => {
      const createProviderRes = await checkout.createProvider({ walletProvider: WalletProviderName.METAMASK });
      SetProvider(CheckoutWidgetTagNames.WALLET, createProviderRes.provider);
    })();
  });

  return (
    <WalletReact walletProvider={WalletProviderName.METAMASK} />
  );
}

export default WalletWebView;
