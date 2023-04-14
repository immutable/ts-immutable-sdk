import {
  WidgetTheme,
  ConnectionProviders,
  Network,
} from '@imtbl/checkout-ui-types';

function BridgeUI() {
  return (
    <div className="Swap">
      <h1 className="sample-heading">Checkout Bridge (Web Component)</h1>
      <imtbl-bridge
        providerPreference={ConnectionProviders.METAMASK}
        theme={WidgetTheme.DARK}
        amount="50"
        fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
        fromNetwork={Network.ETHEREUM}
      ></imtbl-bridge>
    </div>
  );
}

export default BridgeUI;
