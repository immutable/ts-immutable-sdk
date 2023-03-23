import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConnectWidget } from './widgets/connect/ConnectWidget';
import { ConnectWidgetParams, WalletWidgetParams } from './types';
import {ConnectionProviders} from "@imtbl/checkout-sdk-web";
import { WalletWidget } from './widgets/wallet/WalletWidget';

const element = document.getElementById('root') as HTMLElement

const root = ReactDOM.createRoot(element);

const connectParams:ConnectWidgetParams = {
  providerPreference: ConnectionProviders.METAMASK,
}

const walletParams:WalletWidgetParams = {
  providerPreference: ConnectionProviders.METAMASK,
}

root.render(
  <React.StrictMode>
    <ConnectWidget params={connectParams} theme={'DARK'}></ConnectWidget>
    <br />
    <WalletWidget params={walletParams} theme={'DARK'}></WalletWidget>
  </React.StrictMode>
);

