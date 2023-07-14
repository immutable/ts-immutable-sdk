import React from 'react';
import { BiomeCombinedProviders } from '@biom3/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { onDarkBase } from '@biom3/design-tokens';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ConnectUI from './components/ui/connect/connect';
import WalletUI from './components/ui/wallet/wallet';
import SwapUI from './components/ui/swap/swap';
import BridgeUI from './components/ui/bridge/bridge';
import { Marketplace } from './components/ui/marketplace-orchestrator';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/connect',
    element: <ConnectUI />,
  },
  {
    path: '/wallet',
    element: <WalletUI />,
  },
  {
    path: '/swap',
    element: <SwapUI />,
  },
  {
    path: '/bridge',
    element: <BridgeUI />,
  },
  {
    path: '/marketplace-orchestrator',
    element: <BiomeCombinedProviders theme={{ base: onDarkBase }}><Marketplace /></BiomeCombinedProviders>,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <BiomeCombinedProviders theme={{ base: onDarkBase }}>
      <RouterProvider router={router} />
    </BiomeCombinedProviders>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
