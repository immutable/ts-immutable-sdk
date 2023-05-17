import React from 'react';
import {
  WidgetConnectionProviders,
  Network,
  DEFAULT_PROVIDER,
} from '../definitions/constants';
import { CheckoutWidgetsConfig } from '../definitions/config';
import { withDefaults } from '../lib/withDefaults';

/**
 * Interface representing the props for the Bridge Widget component.
 * @property {WidgetConnectionProviders} providerPreference - The preferred provider for the Bridge Widget
 * (default: {@link WidgetConnectionProviders.METAMASK}).
 * @property {string} fromContractAddress - The contract address to send tokens from.
 * @property {string} amount - The amount of tokens to send.
 * @property {Network} fromNetwork - The network to send tokens from.
 */
export interface BridgeReactProps extends CheckoutWidgetsConfig {
  providerPreference: WidgetConnectionProviders;
  fromContractAddress?: string;
  amount?: string;
  fromNetwork?: Network;
}

/**
 * A React functional component that renders the Checkout Bridge Widget.
 * @param {BridgeReactProps} props - The props for the Bridge Widget component.
 * @returns {JSX.Element} - The rendered Bridge Widget component.
 */
export function BridgeReact(props: BridgeReactProps): JSX.Element {
  const {
    providerPreference,
    fromContractAddress,
    amount,
    fromNetwork,
    environment,
    theme,
  } = props;

  const config = withDefaults(window.ImtblCheckoutWidgetConfig);

  return (
    <imtbl-bridge
      environment={environment ?? config.environment}
      theme={theme ?? config.theme}
      providerPreference={providerPreference ?? DEFAULT_PROVIDER}
      fromContractAddress={fromContractAddress ?? ''}
      fromNetwork={fromNetwork ?? ''}
      amount={amount ?? ''}
    />
  );
}
