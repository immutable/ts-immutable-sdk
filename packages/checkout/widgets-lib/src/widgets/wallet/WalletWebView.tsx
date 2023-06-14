import { Environment } from '@imtbl/config';
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider } from '@ethersproject/providers';
// import { WalletProviderName } from '@imtbl/checkout-sdk';
import {
  CheckoutWidgetTagNames, CheckoutWidgets, SetProvider, WalletReact,
} from '@imtbl/checkout-widgets';
import { WidgetTheme } from '../../lib';

function WalletWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  CheckoutWidgets(config);

  (async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      SetProvider(CheckoutWidgetTagNames.WALLET, new Web3Provider(provider));
    }
  })();

  return (
    // <imtbl-wallet
    //   walletProvider={WalletProviderName.METAMASK}
    //   widgetConfig={JSON.stringify(config)}
    // />
    <WalletReact />
  );
}

export default WalletWebView;
