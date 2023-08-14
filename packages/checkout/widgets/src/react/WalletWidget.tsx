import React, { useEffect } from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '@imtbl/passport';
import { SetProvider } from './internal/SetProvider';
import { CheckoutWidgetTagNames } from '../definitions/types';
import { AddPassportOption } from './internal/AddPassportOption';

/**
 * Interface representing the props for the Wallet Widget component.
 * @interface WalletReactProps
 * @property {WalletProviderName | undefined} walletProvider - The name of the wallet provider.
 * @property {Web3Provider | undefined} provider - The Web3 provider.
 */
export interface WalletReactProps {
  walletProvider?: WalletProviderName;
  provider?: Web3Provider;
  passport?: Passport;
}

/**
 * A React functional component that renders the Checkout Wallet Widget.
 * @param {WalletReactProps} props - The props for the Wallet Widget component.
 * @returns {JSX.Element} - The rendered Wallet Widget component.
 */
export function WalletReact(props: WalletReactProps): JSX.Element {
  const {
    walletProvider,
    provider,
    passport,
  } = props;

  useEffect(() => {
    if (provider) {
      SetProvider(CheckoutWidgetTagNames.WALLET, provider);
    }
    if (passport) {
      AddPassportOption(CheckoutWidgetTagNames.WALLET, passport);
    }
  }, [provider, passport]);

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-wallet
      widgetConfig={config}
      walletProvider={walletProvider}
    />
  );
}
