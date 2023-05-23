/* eslint-disable max-len */
import React from 'react';

/**
 * Interface representing the props for the Swap Widget component.
 * @property {string} providerPreference - The preferred provider for the Swap Widget (default: "metamask"}).
 * @property {string} fromContractAddress - The contract address to swap tokens from.
 * @property {string} amount - The amount of tokens to send.
 * @property {Network} toContractAddress - The contract address to swap tokens to.
 */
export interface SwapReactProps {
  providerPreference: string;
  fromContractAddress?: string;
  amount?: string;
  toContractAddress?: string;
}

/**
 * A React functional component that renders the Checkout Swap Widget.
 * @param {SwapReactProps} props - The props for the Swap Widget component.
 * @returns {JSX.Element} - The rendered Swap Widget component.
 */
export function SwapReact(props: SwapReactProps): JSX.Element {
  const {
    providerPreference,
    fromContractAddress,
    amount,
    toContractAddress,
  } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-swap
      widgetConfig={config}
      providerPreference={providerPreference}
      fromContractAddress={fromContractAddress ?? ''}
      toContractAddress={toContractAddress ?? ''}
      amount={amount ?? ''}
    />
  );
}
