import {
  WidgetTheme,
  ConnectionProviders,
  SwapWidgetReact,
  CheckoutWidgets,
} from '@imtbl/checkout-widgets-react';

function SwapUI() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
  });
  return (
    <div className="Swap">
      <h1 className="sample-heading">Checkout Swap (Web Component)</h1>
      <SwapWidgetReact
        providerPreference={ConnectionProviders.METAMASK}
        amount="50000000000000000000"
        fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
        toContractAddress=""
      />
    </div>
  );
}

export default SwapUI;
