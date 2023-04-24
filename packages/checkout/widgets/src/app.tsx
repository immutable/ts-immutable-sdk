import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ExampleWebView from './widgets/example/ExampleWebView';
import BuyWebView from './widgets/buy/BuyWebView';
import ConnectWebView from './widgets/connect/ConnectWebView';
import SwapWebView from './widgets/swap/SwapWebView';
import BridgeWebView from './widgets/bridge/BridgeWebView';
import WalletWebView from './widgets/wallet/WalletWebView';
import TransitionExampleWebView from './widgets/transition-example/TransitionExampleWebView';

require('./build.tsx')

function App() {
  return(
    <div>
      <h1>Checkout Widgets</h1>
      <br />
      <h2><a href="/connect">Connect Widget</a></h2>
      <br />
      <h2><a href="/wallet">Wallet Widget</a></h2>
      <br />
      <h2><a href="/swap">Swap Widget</a></h2>
      <br />
      <h2><a href="/bridge">Bridge Widget</a></h2>
      <br />
      <h2><a href="/buy">Buy Widget</a></h2>
      <br />
      <h2><a href="/example">Example Widget</a></h2>
      <br />
      <h2><a href="/transition-example">Transition Example Widget</a></h2>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "/example",
    element: <ExampleWebView />,
  },
  {
    path: "/transition-example",
    element: <TransitionExampleWebView />,
  },
  {
    path: "/connect",
    element: <ConnectWebView />,
  },
  {
    path: "/swap",
    element: <SwapWebView />,
  },
  {
    path: "/bridge",
    element: <BridgeWebView />,
  },
  {
    path: "/wallet",
    element: <WalletWebView />,
  },
  {
    path: "/buy",
    element: <BuyWebView />,
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
