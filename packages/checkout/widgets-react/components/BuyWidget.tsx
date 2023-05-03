import React from 'react';

import { ConnectionProviders, WidgetTheme } from '../definitions/constants';

export interface BuyWidgetReactProps {
  providerPreference: ConnectionProviders;
  orderId: string;
}

export function BuyWidgetReact(props: BuyWidgetReactProps) {
  const { providerPreference, orderId } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-buy
      providerPreference={providerPreference ?? ConnectionProviders.METAMASK}
      theme={config.theme ?? WidgetTheme.DARK}
      orderId={orderId}
    ></imtbl-buy>
  );
}
