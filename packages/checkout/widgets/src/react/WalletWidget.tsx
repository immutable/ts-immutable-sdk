import React from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';

/**
 * Interface representing the props for the Wallet Widget component.
 * @property {string} providerPreference - The preferred provider for the Wallet Widget
 * (default: "metamask").
 */
export interface WalletReactProps {
  walletProvider?: WalletProviderName;
}

/**
 * A React functional component that renders the Checkout Wallet Widget.
 * @param {WalletReactProps} props - The props for the Wallet Widget component.
 * @returns {JSX.Element} - The rendered Wallet Widget component.
 */
export function WalletReact(props: WalletReactProps) {
  const {
    walletProvider,
  } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-wallet
      widgetConfig={config}
      walletProvider={walletProvider}
      injectedProvider
    />
  );
}
