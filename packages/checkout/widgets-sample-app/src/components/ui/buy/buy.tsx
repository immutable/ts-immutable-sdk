import {
  WidgetTheme,
  WidgetConnectionProviders,
  CheckoutWidgets,
  BuyReact,
} from '@imtbl/checkout-widgets';

function BuyUI() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
  });
  return (
    <div className="Buy">
      <h1 className="sample-heading">Checkout Buy Order (Web Component)</h1>
      <BuyReact
        providerPreference={WidgetConnectionProviders.METAMASK}
        orderId={`1234`}
      />
    </div>
  );
}

export default BuyUI;
