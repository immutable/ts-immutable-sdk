import React from 'react';
import {
  DEFAULT_PROVIDER,
  WidgetConnectionProviders,
} from '../definitions/constants';
import { CheckoutWidgetsConfig } from '../definitions/config';
import { withDefaults } from '../lib/withDefaults';

/**
 * Interface representing the props for the Buy Widget component.
 * @property {WidgetConnectionProviders} providerPreference - The preferred provider for the Buy Widget
 * (default: {@link WidgetConnectionProviders.METAMASK}).
 * @property {string} orderId - The ID that identifies the open buy order associated to the assets to buy.
 */
export interface BuyReactProps extends CheckoutWidgetsConfig {
  providerPreference: WidgetConnectionProviders;
  orderId: string;
}

/**
 * A React functional component that renders the Checkout Buy Widget.
 * @param {BuyReactProps} props - The props for the Buy Widget component.
 * @returns {JSX.Element} - The rendered Buy Widget component.
 */
export function BuyReact(props: BuyReactProps): JSX.Element {
  const {
    providerPreference, orderId, environment, theme,
  } = props;

  const config = withDefaults(window.ImtblCheckoutWidgetConfig);

  return (
    <imtbl-buy
      environment={environment ?? config.environment}
      theme={theme ?? config.theme}
      providerPreference={providerPreference ?? DEFAULT_PROVIDER}
      orderId={orderId}
    />
  );
}
