/* eslint-disable no-console */
import React, { useEffect } from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { SetProvider } from './internal/SetProvider';
import { CheckoutWidgetTagNames } from '../definitions/types';

/**
 * Interface representing the props for the on-ramp Widget component.
 * @interface OnRampReactProps
 * @property {WalletProviderName | undefined} walletProvider - The name of the wallet provider.
 * @property {Web3Provider | undefined} provider - The Web3 provider.
 * @property {string | undefined} amount - The amount.
 */
export interface OnRampReactProps {
  walletProvider?: WalletProviderName;
  provider?: Web3Provider;
  amount?: string;
}

/**
 * A React functional component that renders the Checkout on-ramp Widget.
 * @param {OnRampReactProps} props - The props for the On-ramp Widget component.
 * @returns {JSX.Element} - The rendered Bridge Widget component.
 */
export function OnRampReact(props: OnRampReactProps): JSX.Element {
  const {
    walletProvider,
    amount,
    provider,
  } = props;

  console.log('in react component');

  useEffect(() => {
    if (provider) {
      SetProvider(CheckoutWidgetTagNames.ONRAMP, provider);
    }
  }, [provider]);

  const config = window.ImtblCheckoutWidgetConfig;

  console.log('config:', config);

  return (
    <imtbl-onramp
      widgetConfig={config}
      walletProvider={walletProvider}
      amount={amount ?? ''}
    />
  );
}
