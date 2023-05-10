import React from 'react';

import {
  WidgetConnectionProviders,
  WidgetTheme,
} from '../definitions/constants';
import { Environment } from '@imtbl/config';

/**
 * Interface representing the props for the Buy Widget component.
 * @property {WidgetConnectionProviders} providerPreference - The preferred provider for the Buy Widget (default: {@link WidgetConnectionProviders.METAMASK}).
 * @property {string} orderId - The ID that identifies the open buy order associated to the assets to buy.
 */
export interface BuyReactProps {
  providerPreference: WidgetConnectionProviders;
  orderId: string;
}

/**
 * A React functional component that renders the Checkout Buy Widget.
 * @param {BuyReactProps} props - The props for the Buy Widget component.
 * @returns {JSX.Element} - The rendered Buy Widget component.
 */
export function BuyReact(props: BuyReactProps): JSX.Element {
  const { providerPreference, orderId } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-buy
      environment={Environment.SANDBOX}
      providerPreference={
        providerPreference ?? WidgetConnectionProviders.METAMASK
      }
      theme={config.theme ?? WidgetTheme.DARK}
      orderId={orderId}
    ></imtbl-buy>
  );
}
