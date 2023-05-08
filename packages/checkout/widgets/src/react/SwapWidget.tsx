import React from 'react';

import {
  WidgetConnectionProviders,
  WidgetTheme,
} from '../definitions/constants';

/**
 * Interface representing the props for the Swap Widget component.
 * @property {WidgetConnectionProviders} providerPreference - The preferred provider for the Swap Widget (default: {@link WidgetConnectionProviders.METAMASK}).
 * @property {string} fromContractAddress - The contract address to swap tokens from.
 * @property {string} amount - The amount of tokens to send.
 * @property {Network} toContractAddress - The contract address to swap tokens to.
 */
export interface SwapReactProps {
  providerPreference: WidgetConnectionProviders;
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
  const { providerPreference, fromContractAddress, amount, toContractAddress } =
    props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-swap
      providerPreference={
        providerPreference ?? WidgetConnectionProviders.METAMASK
      }
      theme={config.theme ?? WidgetTheme.DARK}
      fromContractAddress={fromContractAddress ?? ''}
      toContractAddress={toContractAddress ?? ''}
      amount={amount ?? ''}
    ></imtbl-swap>
  );
}
