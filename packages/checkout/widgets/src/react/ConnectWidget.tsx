import React from 'react';
import {
  DEFAULT_PROVIDER,
  WidgetConnectionProviders,
} from '../definitions/constants';
import { CheckoutWidgetsConfig } from '../definitions/config';
import { withDefaults } from '../lib/withDefaults';

/**
 * Interface representing the props for the Connect Widget component.
 * @property {WidgetConnectionProviders} providerPreference - The preferred provider for the Connect Widget
 * (default: {@link WidgetConnectionProviders.METAMASK}).
 */
export interface ConnectReactProps extends CheckoutWidgetsConfig {
  providerPreference?: WidgetConnectionProviders;
}

/**
 * A React functional component that renders the Checkout Connect Widget.
 * @param {ConnectReactProps} props - The props for the Connect Widget component.
 * @returns {JSX.Element} - The rendered Connect Widget component.
 */
export function ConnectReact(props: ConnectReactProps): JSX.Element {
  const { providerPreference, environment, theme } = props;

  const config = withDefaults(window.ImtblCheckoutWidgetConfig);

  return (
    <imtbl-connect
      environment={environment ?? config.environment}
      theme={theme ?? config.theme}
      providerPreference={providerPreference ?? DEFAULT_PROVIDER}
    />
  );
}
