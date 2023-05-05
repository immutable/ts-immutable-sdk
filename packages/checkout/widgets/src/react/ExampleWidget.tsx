import React from 'react';

import {
  ConnectionProviders,
  Network,
  WidgetTheme,
} from '../definitions/constants';

export interface ExampleReactProps {
  providerPreference: ConnectionProviders;
  fromContractAddress?: string;
  amount?: string;
  fromNetwork?: Network;
}

export function ExampleReact(props: ExampleReactProps) {
  const { providerPreference, fromContractAddress, amount, fromNetwork } =
    props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-example
      providerPreference={providerPreference ?? ConnectionProviders.METAMASK}
      theme={config.theme ?? WidgetTheme.DARK}
    ></imtbl-example>
  );
}
