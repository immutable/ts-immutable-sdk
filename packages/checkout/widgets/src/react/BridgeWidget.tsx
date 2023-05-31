import React from 'react';
import {
  Network,
} from '../definitions/types';

/**
 * Interface representing the props for the Bridge Widget component.
 * @property {string} providerPreference - The preferred provider for the Bridge Widget
 * (default: "metamask").
 * @property {string} fromContractAddress - The contract address to send tokens from.
 * @property {string} amount - The amount of tokens to send.
 * @property {Network} fromNetwork - The network to send tokens from.
 */
export interface BridgeReactProps {
  providerPreference: string;
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
      providerPreference={providerPreference}
      fromContractAddress={fromContractAddress ?? ''}
      fromNetwork={fromNetwork ?? ''}
      amount={amount ?? ''}
    />
  );
}
