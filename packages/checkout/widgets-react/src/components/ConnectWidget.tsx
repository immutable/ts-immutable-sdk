import React from 'react';

import { ConnectionProviders, WidgetTheme } from '../definitions/constants';

export interface ConnectWidgetReactProps {
  providerPreference?: ConnectionProviders;
}

export function ConnectWidgetReact(props: ConnectWidgetReactProps) {
  const { providerPreference } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-connect
      providerPreference={providerPreference ?? ConnectionProviders.METAMASK}
      theme={config.theme ?? WidgetTheme.DARK}
    ></imtbl-connect>
  );
}
