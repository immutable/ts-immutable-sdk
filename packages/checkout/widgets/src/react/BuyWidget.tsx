import React from 'react';

import { ConnectionProviders, WidgetTheme } from '../definitions/constants';

export interface BuyReactProps {
  providerPreference: ConnectionProviders;
  orderId: string;
}

export function BuyReact(props: BuyReactProps) {
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
