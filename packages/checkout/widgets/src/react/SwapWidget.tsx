/* eslint-disable max-len */
import React from 'react';
import {
  DEFAULT_PROVIDER,
  WidgetConnectionProviders,
} from '../definitions/constants';
import { CheckoutWidgetsConfig } from '../definitions/config';

/**
 * Interface representing the props for the Swap Widget component.
 * @property {WidgetConnectionProviders} providerPreference - The preferred provider for the Swap Widget (default: {@link WidgetConnectionProviders.METAMASK}).
 * @property {string} fromContractAddress - The contract address to swap tokens from.
 * @property {string} amount - The amount of tokens to send.
 * @property {Network} toContractAddress - The contract address to swap tokens to.
 */
export interface SwapReactProps extends CheckoutWidgetsConfig {
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
      providerPreference={providerPreference ?? DEFAULT_PROVIDER}
      fromContractAddress={fromContractAddress ?? ''}
      toContractAddress={toContractAddress ?? ''}
      amount={amount ?? ''}
    />
  );
}
