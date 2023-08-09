import React, { useEffect } from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { SetProvider } from './internal/SetProvider';
import { CheckoutWidgetTagNames } from '../definitions/types';
import { SetPassport } from './internal/SetPassport';

/**
 * Interface representing the props for the Bridge Widget component.
 * @interface BridgeReactProps
 * @property {WalletProviderName | undefined} walletProvider - The name of the wallet provider.
 * @property {Web3Provider | undefined} provider - The Web3 provider.
 * @property {string | undefined} fromContractAddress - The address of the contract.
 * @property {string | undefined} amount - The amount.
 */
export interface BridgeReactProps {
  walletProvider?: WalletProviderName;
  provider?: Web3Provider;
  fromContractAddress?: string;
  amount?: string;
  passport?: any;
}

/**
 * A React functional component that renders the Checkout Bridge Widget.
 * @param {BridgeReactProps} props - The props for the Bridge Widget component.
 * @returns {JSX.Element} - The rendered Bridge Widget component.
 */
export function BridgeReact(props: BridgeReactProps): JSX.Element {
  const {
    walletProvider,
    fromContractAddress,
    amount,
    provider,
    passport,
  } = props;

  useEffect(() => {
    if (provider) {
      SetProvider(CheckoutWidgetTagNames.BRIDGE, provider);
    }
    if (passport) {
      SetPassport(CheckoutWidgetTagNames.BRIDGE, passport);
    }
  }, [provider, passport]);

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-bridge
      widgetConfig={config}
      walletProvider={walletProvider}
      fromContractAddress={fromContractAddress ?? ''}
      amount={amount ?? ''}
    />
  );
}
