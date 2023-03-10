import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConnectWidget } from './modules/connect/ConnectWidget';
import { ConnectionProviders, ConnectWidgetParams } from './types'

const element = document.getElementById('root') as HTMLElement

const root = ReactDOM.createRoot(element);

const params:ConnectWidgetParams = {
  providerPreference: ConnectionProviders.METAMASK,
}

root.render(
  <React.StrictMode>
    <ConnectWidget params={params} theme={'LIGHT'}  />
  </React.StrictMode>
);

