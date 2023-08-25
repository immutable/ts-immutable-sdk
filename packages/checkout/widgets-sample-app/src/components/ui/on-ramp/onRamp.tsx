import { WalletProviderName } from '@imtbl/checkout-sdk';
import {
  WidgetTheme,
  OnRampReact,
  CheckoutWidgets,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function OnRampUI() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  });

  return (
    <div className="Swap">
      <h1 className="sample-heading">Checkout OnRamp (Web Component)</h1>

      <OnRampReact
        walletProvider={WalletProviderName.METAMASK}
        amount="50"
      />
    </div>
  );
}

export default OnRampUI;
