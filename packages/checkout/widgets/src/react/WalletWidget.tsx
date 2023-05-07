import React from 'react';

import {
  WidgetConnectionProviders,
  WidgetTheme,
} from '../definitions/constants';

/**
 * Interface representing the props for the Walley Widget component.
 * @property {WidgetConnectionProviders} providerPreference - The preferred provider for the Walley Widget (default: {@link WidgetConnectionProviders.METAMASK}).
 */
export interface WalletReactProps {
  providerPreference?: WidgetConnectionProviders;
}

/**
 * A React functional component that renders the Checkout Waller Widget.
 * @param {WallerReactProps} props - The props for the Waller Widget component.
 * @returns {JSX.Element} - The rendered Waller Widget component.
 */
export function WalletReact(props: WalletReactProps): JSX.Element {
  const { providerPreference } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-wallet
      providerPreference={
        providerPreference ?? WidgetConnectionProviders.METAMASK
      }
      theme={config.theme ?? WidgetTheme.DARK}
    ></imtbl-wallet>
  );
}
