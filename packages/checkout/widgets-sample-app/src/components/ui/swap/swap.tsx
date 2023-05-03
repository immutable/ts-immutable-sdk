import { WidgetTheme, ConnectionProviders } from '@imtbl/checkout-ui-types';

function SwapUI() {
  return (
    <div className="Swap">
      <h1 className="sample-heading">Checkout Swap (Web Component)</h1>
      <imtbl-swap
        providerPreference={ConnectionProviders.METAMASK}
        theme={WidgetTheme.DARK}
        amount="50000000000000000000"
        fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
        toContractAddress=""
      ></imtbl-swap>
    </div>
  );
}

export default SwapUI;
