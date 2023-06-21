import { WalletProviderName } from '@imtbl/checkout-sdk';
import {
  WidgetTheme,
  Network,
  BridgeReact,
  CheckoutWidgets,
  CheckoutWidgetsConfig,
  UpdateConfig,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';

function BridgeUI() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  });

  const widgetsConfig2: CheckoutWidgetsConfig = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  UpdateConfig(widgetsConfig2);

  return (
    <div className="Swap">
      <h1 className="sample-heading">Checkout Bridge (Web Component)</h1>

      <BridgeReact
        walletProvider={WalletProviderName.METAMASK}
        amount="50"
        fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
        fromNetwork={Network.ETHEREUM}
      />
    </div>
  );
}

export default BridgeUI;
