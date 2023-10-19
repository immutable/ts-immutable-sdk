import React, { useEffect } from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '@imtbl/passport';
import { SetProvider } from './internal/SetProvider';
import { CheckoutWidgetTagNames } from '../definitions/types';
import { AddPassportOption } from './internal/AddPassportOption';

/**
 * Interface representing the props for the on-ramp Widget component.
 * @interface OnRampReactProps
 * @property {WalletProviderName | undefined} walletProvider - The name of the wallet provider.
 * @property {Web3Provider | undefined} provider - The Web3 provider.
 * @property {Passport | undefined} passport - The Passport instance to create a Web3Provider.
 * @property {string | undefined} amount - The amount.
 * @property {string | undefined} contractAddress - The contract address of the token to on ramp
 */
export interface OnRampReactProps {
  walletProvider?: WalletProviderName;
  provider?: Web3Provider;
  passport?: Passport;
  amount?: string;
  contractAddress?: string;
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
    passport,
    contractAddress,
  } = props;

  useEffect(() => {
    if (provider) {
      SetProvider(CheckoutWidgetTagNames.ONRAMP, provider);
    }
    if (passport) {
      AddPassportOption(CheckoutWidgetTagNames.ONRAMP, passport);
    }
  }, [provider, passport]);

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-onramp
      widgetConfig={config}
      walletProvider={walletProvider}
      amount={amount ?? ''}
      fromContractAddress={contractAddress ?? ''}
    />
  );
}
