import React from 'react';

/**
 * Interface representing the props for the Buy Widget component.
 * @property {string} providerPreference - The preferred provider for the Buy Widget
 * (default: "metamask").
 * @property {string} orderId - The ID that identifies the open buy order associated to the assets to buy.
 */
export interface BuyReactProps {
  providerPreference: string;
  orderId: string;
}

/**
 * A React functional component that renders the Checkout Buy Widget.
 * @param {BuyReactProps} props - The props for the Buy Widget component.
 * @returns {JSX.Element} - The rendered Buy Widget component.
 */
export function BuyReact(props: BuyReactProps): JSX.Element {
  const {
    providerPreference, orderId,
  } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-buy
      widgetConfig={config}
      providerPreference={providerPreference}
      orderId={orderId}
    />
  );
}
