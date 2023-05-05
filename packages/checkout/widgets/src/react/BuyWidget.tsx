import React from 'react';

import {
  WidgetConnectionProviders,
  WidgetTheme,
} from '../definitions/constants';

export interface BuyReactProps {
  providerPreference: WidgetConnectionProviders;
  orderId: string;
}

export function BuyReact(props: BuyReactProps) {
  const { providerPreference, orderId } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-buy
      providerPreference={
        providerPreference ?? WidgetConnectionProviders.METAMASK
      }
      theme={config.theme ?? WidgetTheme.DARK}
      orderId={orderId}
    ></imtbl-buy>
  );
}
