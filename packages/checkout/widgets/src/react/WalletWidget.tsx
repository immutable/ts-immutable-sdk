import React from 'react';

import {
  WidgetConnectionProviders,
  WidgetTheme,
} from '../definitions/constants';

export interface WalletReactProps {
  providerPreference?: WidgetConnectionProviders;
  isOnRampEnabled?: boolean;
  isSwapEnabled?: boolean;
  isBridgeEnabled?: boolean;
}

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
