import { Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import {
  CheckoutWidgets, SwapReact,
} from '@imtbl/checkout-widgets';
import { useEffect, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { WidgetTheme } from '../../lib';

function SwapWebView() {
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
    <SwapReact
      amount="0.1"
      fromContractAddress="0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE"
      toContractAddress="0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2"
      provider={provider}
    />
  );
}

export default SwapWebView;
