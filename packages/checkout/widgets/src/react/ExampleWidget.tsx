import React from 'react';
import {
  WidgetConnectionProviders,
  DEFAULT_PROVIDER,
} from '../definitions/constants';
import { CheckoutWidgetsConfig } from '../definitions/config';
import { withDefaults } from '../lib/withDefaults';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    providerPreference,
    environment,
    theme,
  } = props;

  const config = withDefaults(window.ImtblCheckoutWidgetConfig);

  return (
    <imtbl-example
      environment={environment ?? config.environment}
      theme={theme ?? config.theme}
      providerPreference={providerPreference ?? DEFAULT_PROVIDER}
    />
  );
}
