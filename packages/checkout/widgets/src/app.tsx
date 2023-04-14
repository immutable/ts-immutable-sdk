import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ExampleWebView from './widgets/example/ExampleWebView';
import BuyWebView from './widgets/buy/BuyWebView';

require('./build.tsx')

function App() {
  return(
    <div>
      <imtbl-connect theme="DARK" providerPreference="metamask"></imtbl-connect>
      <br />
      <imtbl-wallet theme="DARK" providerPreference="metamask"></imtbl-wallet>
      <br />
      <imtbl-swap theme="DARK" providerPreference="metamask" amount="50000000000000000000" fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0" toContractAddress=""></imtbl-swap>
      <br />
      <imtbl-bridge theme="DARK" providerPreference="metamask" amount="50" fromContractAddress="0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0" fromNetwork="Goerli"></imtbl-bridge>
      <br />
      <imtbl-buy theme="dark" providerPreference="metamask" orderId="1234"></imtbl-buy>
      <br />
      <imtbl-example theme="light" providerPreference="metamask"></imtbl-example>
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
