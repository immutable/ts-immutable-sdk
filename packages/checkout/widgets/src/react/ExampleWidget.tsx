import React from 'react';
import { DEFAULT_PROVIDER } from '@imtbl/sdk';
import { Environment } from '@imtbl/config';
import {
  WidgetConnectionProviders,
  WidgetTheme,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    providerPreference,
    environment,
    theme,
  } = props;

  return (
    <imtbl-example
      environment={environment ?? Environment.SANDBOX}
      theme={theme ?? WidgetTheme.DARK}
      providerPreference={providerPreference ?? DEFAULT_PROVIDER}
    />
  );
}
