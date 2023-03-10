import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConnectWidget } from './modules/connect/ConnectWidget';
import { ConnectWidgetParams } from './types';
import {ConnectionProviders} from "@imtbl/checkout-sdk-web";

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

