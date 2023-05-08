import {
  WidgetTheme,
  WidgetConnectionProviders,
  Network,
  BridgeReact,
  CheckoutWidgets,
} from '@imtbl/checkout-widgets';

function BridgeUI() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
  });

  return (
    <div className="Swap">
      <h1 className="sample-heading">Checkout Bridge (Web Component)</h1>

      <BridgeReact
        providerPreference={WidgetConnectionProviders.METAMASK}
        amount="50"
        fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
        fromNetwork={Network.ETHEREUM}
      />
    </div>
  );
}

export default BridgeUI;
