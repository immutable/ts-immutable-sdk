import React from 'react';

import { Environment } from '@imtbl/config';
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
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    providerPreference, fromContractAddress, amount, fromNetwork,
  } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-example
      environment={config.environment ?? Environment.SANDBOX}
      providerPreference={
        providerPreference ?? WidgetConnectionProviders.METAMASK
      }
      theme={config.theme ?? WidgetTheme.DARK}
    />
  );
}
