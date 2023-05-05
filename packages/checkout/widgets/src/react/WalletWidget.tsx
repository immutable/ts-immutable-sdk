import React from 'react';

import {
  WidgetConnectionProviders,
  WidgetTheme,
} from '../definitions/constants';

export interface WalletReactProps {
  providerPreference?: WidgetConnectionProviders;
}

export function WalletReact(props: WalletReactProps) {
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
