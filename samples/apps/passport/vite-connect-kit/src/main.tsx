import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { config, passport } from '@imtbl/sdk';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import PassportRedirect from './components/PassportRedirect.tsx';

const PUBLISHABLE_KEY = 'PUBLISHABLE_KEY';
const CLIENT_ID = 'CLIENT_ID';

export const PASSPORT_CONNECTOR_ID = 'com.immutable.passport';

export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.PRODUCTION,
    publishableKey: PUBLISHABLE_KEY,
  },
  clientId: CLIENT_ID,
  redirectUri: 'http://localhost:5173/redirect',
  logoutRedirectUri: 'http://localhost:5173/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/redirect",
    element: <PassportRedirect passportInstance={passportInstance} />,
  },
  {
    path: "/logout",
    element: <Navigate to="/" replace />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
