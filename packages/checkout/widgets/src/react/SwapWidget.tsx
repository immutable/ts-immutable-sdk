/* eslint-disable max-len */
import { WalletProviderName } from '@imtbl/checkout-sdk';
import React, { useEffect } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '@imtbl/passport';
import { SetProvider } from './internal/SetProvider';
import { CheckoutWidgetTagNames } from '../definitions/types';
import { AddPassportOption } from './internal/AddPassportOption';

/**
 * Interface representing the props for the Swap Widget component.
 * @interface SwapReactProps
 * @property {WalletProviderName | undefined} walletProvider - The name of the wallet provider.
 * @property {Web3Provider | undefined} provider - The Web3 provider.
 * @property {string | undefined} fromContractAddress - The address of the contract swapping from. If the string is 'NATIVE' then the native token is used.
 * @property {string | undefined} amount - The amount.
 * @property {string | undefined} toContractAddress - The address of the contract swapping to. If the string is 'NATIVE' then the native token is used.
 */
export interface SwapReactProps {
  walletProvider?: WalletProviderName;
  provider?: Web3Provider;
  passport?: Passport;
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
    walletProvider,
    fromContractAddress,
    amount,
    toContractAddress,
    provider,
    passport,
  } = props;

  useEffect(() => {
    if (provider) {
      SetProvider(CheckoutWidgetTagNames.SWAP, provider);
    }
    if (passport) {
      AddPassportOption(CheckoutWidgetTagNames.SWAP, passport);
    }
  }, [provider, passport]);

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-swap
      widgetConfig={config}
      walletProvider={walletProvider}
      fromContractAddress={fromContractAddress ?? ''}
      toContractAddress={toContractAddress ?? ''}
      amount={amount ?? ''}
    />
  );
}
