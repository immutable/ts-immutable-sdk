import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ConnectWidget from './pages/ConnectWidget';
import { onLightBase } from '@biom3/design-tokens';
import { BiomeCombinedProviders, Box } from '@biom3/react';
import SmartCheckout from './pages/SmartCheckout';
import {
  PassportLoginCallback
} from "./components/PassportLoginCallback";

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/connect',
    element: <ConnectWidget />,
  },
  {
    path: '/smart-checkout',
    element: <SmartCheckout />,
  },
  {
    path: '/login/callback',
    element: <PassportLoginCallback />
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BiomeCombinedProviders theme={{ base: onLightBase }}>
      <Box
        sx={{
          m: 'auto',
          padding: 'base.spacing.x10',
        }}
      >
        <RouterProvider router={router} />
      </Box>
    </BiomeCombinedProviders>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
