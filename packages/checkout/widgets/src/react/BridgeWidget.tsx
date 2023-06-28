import React, { useEffect } from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { SetProvider } from './internal/SetProvider';
import { CheckoutWidgetTagNames } from '../definitions/types';

/**
 * Interface representing the props for the Bridge Widget component.
 * @property {string} walletProvider - The preferred provider for the Bridge Widget
 * (default: "metamask").
 * @property {string} fromContractAddress - The contract address to send tokens from.
 * @property {string} amount - The amount of tokens to send.
 */
export interface BridgeReactProps {
  walletProvider?: WalletProviderName;
  provider?: Web3Provider;
  fromContractAddress?: string;
  amount?: string;
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
  } = props;

  useEffect(() => {
    if (provider) {
      SetProvider(CheckoutWidgetTagNames.BRIDGE, provider);
    }
  }, [provider]);

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
