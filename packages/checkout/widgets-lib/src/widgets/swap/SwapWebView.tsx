import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import {
  CheckoutWidgetTagNames, CheckoutWidgets, SetProvider, SwapReact,
} from '@imtbl/checkout-widgets';
import { useEffect } from 'react';
import { WidgetTheme } from '../../lib';

function SwapWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  CheckoutWidgets(config);

  const checkout = new Checkout({ baseConfig: { environment: Environment.SANDBOX } });

  useEffect(() => {
    (async () => {
      const createProviderRes = await checkout.createProvider({ providerName: WalletProviderName.METAMASK });
      SetProvider(CheckoutWidgetTagNames.SWAP, createProviderRes.provider);
    })();
  });

  return (
    <SwapReact
      walletProvider={WalletProviderName.METAMASK}
      amount=""
      fromContractAddress="0xFEa9FF93DC0C6DC73F8Be009Fe7a22Bb9dcE8A2d"
      toContractAddress=""
    />
  );
}

export default SwapWebView;
