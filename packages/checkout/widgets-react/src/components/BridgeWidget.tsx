import React from 'react';

import {
  ConnectionProviders,
  Network,
  WidgetTheme,
} from '../definitions/constants';

export interface BridgeWidgetReactProps {
  providerPreference: ConnectionProviders;
  fromContractAddress?: string;
  amount?: string;
  fromNetwork?: Network;
}

export function BridgeWidgetReact(props: BridgeWidgetReactProps) {
  const { providerPreference, fromContractAddress, amount, fromNetwork } =
    props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-bridge
      providerPreference={providerPreference ?? ConnectionProviders.METAMASK}
      theme={config.theme ?? WidgetTheme.DARK}
      fromContractAddress={fromContractAddress ?? ''}
      fromNetwork={fromNetwork ?? ''}
      amount={amount ?? ''}
    ></imtbl-bridge>
  );
}
