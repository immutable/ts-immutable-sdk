import React from 'react';

import {
  WidgetConnectionProviders,
  Network,
  WidgetTheme,
} from '../definitions/constants';

/**
 * Interface representing the props for the Example Widget component.
 * @experimental
 */
export interface ExampleReactProps {
  providerPreference: WidgetConnectionProviders;
  fromContractAddress?: string;
  amount?: string;
  fromNetwork?: Network;
}

/**
 * A React functional component that renders the Checkout Example Widget.
 * @experimental
 */
export function ExampleReact(props: ExampleReactProps) {
  const { providerPreference, fromContractAddress, amount, fromNetwork } =
    props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-example
      providerPreference={
        providerPreference ?? WidgetConnectionProviders.METAMASK
      }
      theme={config.theme ?? WidgetTheme.DARK}
    ></imtbl-example>
  );
}
