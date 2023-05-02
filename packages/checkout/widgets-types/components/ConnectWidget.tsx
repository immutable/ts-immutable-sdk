import React from 'react';

import { ConnectionProviders, WidgetTheme } from '../definitions/constants';
import { ConnectWidgetReactProps } from '../definitions/props/connect';

export function ConnectWidgetReact(props: ConnectWidgetReactProps) {
  console.log('props', props);

  const config = window.ImtblCheckoutWidgetConfig;

  console.log(config);

  return (
    <imtbl-connect
      providerPreference={ConnectionProviders.METAMASK}
      theme={WidgetTheme.DARK}
    ></imtbl-connect>
  );
}
