import React from 'react';
import {
  WidgetConnectionProviders,
  DEFAULT_PROVIDER,
} from '../definitions/constants';
import { CheckoutWidgetsConfig } from '../definitions/config';

/**
 * Interface representing the props for the Example Widget component.
 * @experimental
 */
export interface ExampleReactProps extends CheckoutWidgetsConfig {
  providerPreference: WidgetConnectionProviders;
}

/**
 * A React functional component that renders the Checkout Example Widget.
 * @experimental
 */
export function ExampleReact(props: ExampleReactProps) {
  const {
    providerPreference,
  } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-example
      widgetConfig={config}
      providerPreference={providerPreference ?? DEFAULT_PROVIDER}
    />
  );
}
