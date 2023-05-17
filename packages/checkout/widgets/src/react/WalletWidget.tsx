import React from 'react';
import {
  DEFAULT_PROVIDER,
  WidgetConnectionProviders,
} from '../definitions/constants';
import { CheckoutWidgetsConfig } from '../definitions/config';
import { withDefaults } from '../lib/withDefaults';

/**
 * Interface representing the props for the Wallet Widget component.
 * @property {WidgetConnectionProviders} providerPreference - The preferred provider for the Wallet Widget
 * (default: {@link WidgetConnectionProviders.METAMASK}).
 */
export interface WalletReactProps extends CheckoutWidgetsConfig {
  providerPreference?: WidgetConnectionProviders;
  useConnectWidget?: boolean;
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
    useConnectWidget,
    isBridgeEnabled,
    isOnRampEnabled,
    isSwapEnabled,
    environment,
    theme,
  } = props;

  const config = withDefaults(window.ImtblCheckoutWidgetConfig);

  // isOnRampEnabled, isBridgeEnabled, isSwapEnabled is a boolean type for better devExp
  // converting them to string for compatible webComponent properties
  return (
    <imtbl-wallet
      environment={environment ?? config.environment}
      theme={theme ?? config.theme}
      providerPreference={providerPreference ?? DEFAULT_PROVIDER}
      useConnectWidget={useConnectWidget?.toString()}
      isBridgeEnabled={isBridgeEnabled?.toString()}
      isSwapEnabled={isSwapEnabled?.toString()}
      isOnRampEnabled={isOnRampEnabled?.toString()}
    />
  );
}
