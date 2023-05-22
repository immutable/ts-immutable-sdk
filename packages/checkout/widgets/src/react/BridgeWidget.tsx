import React from 'react';
import { DEFAULT_PROVIDER } from '@imtbl/sdk';
import {
  WidgetConnectionProviders,
  Network,
} from '../definitions/constants';

/**
 * Interface representing the props for the Bridge Widget component.
 * @property {WidgetConnectionProviders} providerPreference - The preferred provider for the Bridge Widget
 * (default: {@link WidgetConnectionProviders.METAMASK}).
 * @property {string} fromContractAddress - The contract address to send tokens from.
 * @property {string} amount - The amount of tokens to send.
 * @property {Network} fromNetwork - The network to send tokens from.
 */
export interface BridgeReactProps {
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
  } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-bridge
      widgetConfig={config}
      providerPreference={providerPreference ?? DEFAULT_PROVIDER}
      fromContractAddress={fromContractAddress ?? ''}
      fromNetwork={fromNetwork ?? ''}
      amount={amount ?? ''}
    />
  );
}
