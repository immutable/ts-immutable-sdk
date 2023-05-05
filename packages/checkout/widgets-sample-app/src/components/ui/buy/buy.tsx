import {
  WidgetTheme,
  ConnectionProviders,
  CheckoutWidgets,
  BuyWidgetReact,
} from '@imtbl/checkout-widgets';

function BuyUI() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
  });
  return (
    <div className="Buy">
      <h1 className="sample-heading">Checkout Buy Order (Web Component)</h1>
      <BuyWidgetReact
        providerPreference={ConnectionProviders.METAMASK}
        orderId={`1234`}
      />
    </div>
  );
}

export default BuyUI;
