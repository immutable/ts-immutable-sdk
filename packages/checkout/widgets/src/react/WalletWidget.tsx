import React from 'react';

/**
 * Interface representing the props for the Wallet Widget component.
 * @property {string} providerPreference - The preferred provider for the Wallet Widget
 * (default: "metamask").
 */
export interface WalletReactProps {
  providerPreference?: string;
  useConnectWidget?: boolean;
}

/**
 * A React functional component that renders the Checkout Wallet Widget.
 * @param {WalletReactProps} props - The props for the Wallet Widget component.
 * @returns {JSX.Element} - The rendered Wallet Widget component.
 */
export function WalletReact(props: WalletReactProps) {
  const {
    providerPreference,
    useConnectWidget,
  } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-wallet
      widgetConfig={config}
      useConnectWidget={useConnectWidget?.toString()}
      providerPreference={providerPreference ?? 'metamask'}
    />
  );
}
