import React from 'react';

import {
  WidgetConnectionProviders,
  WidgetTheme,
} from '../definitions/constants';

/**
 * Interface representing the props for the Wallet Widget component.
 * @property {WidgetConnectionProviders} providerPreference - The preferred provider for the Wallet Widget (default: {@link WidgetConnectionProviders.METAMASK}).
 */
export interface WalletReactProps {
  providerPreference?: WidgetConnectionProviders;
  isOnRampEnabled?: boolean;
  isSwapEnabled?: boolean;
  isBridgeEnabled?: boolean;
}

/**
 * A React functional component that renders the Checkout Wallet Widget.
 * @param {WalletReactProps} props - The props for the Wallet Widget component.
 * @returns {JSX.Element} - The rendered Wallet Widget component.
 */
export function WalletReact(props: WalletReactProps) {
  const {
    providerPreference,
    isBridgeEnabled,
    isOnRampEnabled,
    isSwapEnabled,
  } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  // isOnRampEnabled, isBridgeEnabled, isSwapEnabled is a boolean type for better devExp
  // converting them to string for compatible webComponent properties
  return (
    <imtbl-wallet
      providerPreference={
        providerPreference ?? WidgetConnectionProviders.METAMASK
      }
      theme={config.theme ?? WidgetTheme.DARK}
      isBridgeEnabled={isBridgeEnabled?.toString()}
      isSwapEnabled={isSwapEnabled?.toString()}
      isOnRampEnabled={isOnRampEnabled?.toString()}
    ></imtbl-wallet>
  );
}
