import React from 'react';

import {
  ConnectionProviders,
  Network,
  WidgetTheme,
} from '../definitions/constants';

export interface ExampleWidgetReactProps {
  providerPreference: ConnectionProviders;
  fromContractAddress?: string;
  amount?: string;
  fromNetwork?: Network;
}

export function ExampleWidgetReact(props: ExampleWidgetReactProps) {
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
