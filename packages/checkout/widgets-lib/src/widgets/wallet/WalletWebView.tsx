import {
  WidgetTheme,
  WidgetConnectionProviders,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function WalletWebView() {
  return (
    <imtbl-wallet
      providerPreference={WidgetConnectionProviders.METAMASK}
      theme={WidgetTheme.DARK}
      environment={Environment.SANDBOX}
    />
  );
}

export default WalletWebView;
