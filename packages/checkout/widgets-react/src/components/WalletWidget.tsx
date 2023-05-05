import React from 'react';

import { ConnectionProviders, WidgetTheme } from '../definitions/constants';

export interface WalletWidgetReactProps {
  providerPreference?: ConnectionProviders;
}

export function WalletWidgetReact(props: WalletWidgetReactProps) {
  const { providerPreference } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-wallet
      providerPreference={providerPreference ?? ConnectionProviders.METAMASK}
      theme={config.theme ?? WidgetTheme.DARK}
    ></imtbl-wallet>
  );
}
