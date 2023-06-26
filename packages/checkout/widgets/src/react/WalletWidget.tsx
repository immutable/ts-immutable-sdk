import React, { useEffect } from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { SetProvider } from './internal/SetProvider';
import { CheckoutWidgetTagNames } from '../definitions/types';

/**
 * Interface representing the props for the Wallet Widget component.
 * @property {string} walletProvider - The preferred provider for the Wallet Widget
 * (default: "metamask").
 */
export interface WalletReactProps {
  walletProvider?: WalletProviderName;
  provider?: Web3Provider;
}

/**
 * A React functional component that renders the Checkout Wallet Widget.
 * @param {WalletReactProps} props - The props for the Wallet Widget component.
 * @returns {JSX.Element} - The rendered Wallet Widget component.
 */
export function WalletReact(props: WalletReactProps) {
  const {
    walletProvider,
    provider,
  } = props;

  useEffect(() => {
    if (provider) {
      SetProvider(CheckoutWidgetTagNames.WALLET, provider);
    }
  }, [provider]);

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-wallet
      widgetConfig={config}
      walletProvider={walletProvider}
    />
  );
}
