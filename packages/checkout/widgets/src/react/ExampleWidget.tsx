import React from 'react';
import { Environment } from '@imtbl/config';
import { CheckoutWidgetsConfig } from '../definitions/config';

/**
 * Interface representing the props for the Example Widget component.
 * @experimental
 */
export interface ExampleReactProps extends CheckoutWidgetsConfig {
  providerPreference: string;
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
      theme={theme ?? 'dark'}
      providerPreference={providerPreference}
    />
  );
}
