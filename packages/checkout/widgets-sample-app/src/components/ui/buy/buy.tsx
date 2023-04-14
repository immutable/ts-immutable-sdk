import {
  WidgetTheme,
  ConnectionProviders,
  Network,
} from '@imtbl/checkout-ui-types';

function BuyUI() {
  return (
    <div className="Buy">
      <h1 className="sample-heading">Checkout Buy Order (Web Component)</h1>
      <imtbl-buy
        providerPreference={ConnectionProviders.METAMASK}
        theme={WidgetTheme.DARK}
        orderId={`1234`}
      ></imtbl-buy>
    </div>
  );
}

export default BuyUI;
