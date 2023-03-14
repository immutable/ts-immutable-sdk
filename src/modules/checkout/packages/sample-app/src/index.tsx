import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Widgets from './Widgets';
import SDK from './SDK';
import ConnectUI from './components/ui/connect/connect';
import WalletUI from './components/ui/wallet/wallet';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "/widgets",
    element: <Widgets/>,
  },
  {
    path: "/widgets/connect",
    element: <ConnectUI/>,
  },
  {
    path: "/widgets/wallet",
    element: <WalletUI/>,
  },
  {
    path: "/sdk",
    element: <SDK/>,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
