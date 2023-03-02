import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConnectWidget } from './ConnectWidget';
import { ProviderPreference, ConnectWidgetParams } from '@imtbl/checkout-ui-types'


const element = document.getElementById('root') as HTMLElement

const root = ReactDOM.createRoot(element);

const params:ConnectWidgetParams = {
  providerPreference: ProviderPreference.METAMASK,
}

root.render(
  <React.StrictMode>
    <ConnectWidget elementId='root' theme="LIGHT" params={params} />
  </React.StrictMode>
);

