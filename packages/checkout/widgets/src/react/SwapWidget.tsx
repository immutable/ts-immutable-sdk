import React from 'react';

import {
  WidgetConnectionProviders,
  WidgetTheme,
} from '../definitions/constants';

export interface SwapReactProps {
  providerPreference: WidgetConnectionProviders;
  fromContractAddress?: string;
  amount?: string;
  toContractAddress?: string;
}

export function SwapReact(props: SwapReactProps) {
  const { providerPreference, fromContractAddress, amount, toContractAddress } =
    props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-swap
      providerPreference={
        providerPreference ?? WidgetConnectionProviders.METAMASK
      }
      theme={config.theme ?? WidgetTheme.DARK}
      fromContractAddress={fromContractAddress ?? ''}
      toContractAddress={toContractAddress ?? ''}
      amount={amount ?? ''}
    ></imtbl-swap>
  );
}
