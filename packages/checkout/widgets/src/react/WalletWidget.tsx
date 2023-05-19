import React from 'react';
import {
  DEFAULT_PROVIDER,
  WidgetConnectionProviders,
} from '../definitions/constants';

/**
 * Interface representing the props for the Wallet Widget component.
 * @property {WidgetConnectionProviders} providerPreference - The preferred provider for the Wallet Widget
 * (default: {@link WidgetConnectionProviders.METAMASK}).
 */
export interface WalletReactProps {
  providerPreference?: WidgetConnectionProviders;
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
      providerPreference={providerPreference || DEFAULT_PROVIDER}
    />
  );
}
