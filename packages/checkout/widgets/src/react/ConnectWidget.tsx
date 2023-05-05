import React from 'react';

import { ConnectionProviders, WidgetTheme } from '../definitions/constants';

export interface ConnectReactProps {
  providerPreference?: ConnectionProviders;
}

export function ConnectReact(props: ConnectReactProps) {
  const { providerPreference } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-connect
      providerPreference={providerPreference ?? ConnectionProviders.METAMASK}
      theme={config.theme ?? WidgetTheme.DARK}
    ></imtbl-connect>
  );
}
