import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ConnectUI from "./components/ui/connect/connect";
import WalletUI from "./components/ui/wallet/wallet";
import SwapUI from "./components/ui/swap/swap";
import BridgeUI from "./components/ui/bridge/bridge";
import OnRampUI from "./components/ui/on-ramp/onRamp";
import { PassportLoginCallback } from "./components/ui/marketplace-orchestrator/PassportLoginCallback";
import {
  Marketplace,
  Checkout,
} from "./components/ui/marketplace-orchestrator";
import { SaleUI } from "./components/ui/sale/sale";
import AddTokensUI from "./components/ui/add-tokens/addTokens";
import { AddTokensPassportLogin } from "./components/ui/login/login";
import { AddTokensPassportLogout } from "./components/ui/logout/logout";
import PurchaseUI from './components/ui/purchase/purchase';
import { PurchasePassportLogin } from "./components/ui/purchase/login";
import { PurchasePassportLogout } from "./components/ui/purchase/logout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/connect",
    element: <ConnectUI />,
  },
  {
    path: "/wallet",
    element: <WalletUI />,
  },
  {
    path: "/swap",
    element: <SwapUI />,
  },
  {
    path: "/bridge",
    element: <BridgeUI />,
  },
  {
    path: "/on-ramp",
    element: <OnRampUI />,
  },
  {
    path: "/sale",
    element: <SaleUI />,
  },
  {
    path: "/checkout",
    element: <Checkout />,
  },
  {
    path: "/purchase",
    element: <PurchaseUI />,
  },
  {
    path: "/purchase/login",
    element: <PurchasePassportLogin />,
  },
  {
    path: "/purchase/logout",
    element: <PurchasePassportLogout />,
  },
  {
    path: "/add-tokens",
    element: <AddTokensUI />,
  },
  {
    path: "/login",
    element: <AddTokensPassportLogin />,
  },
  {
    path: "/logout",
    element: <AddTokensPassportLogout />,
  },
  {
    path: "/marketplace-orchestrator",
    element: <Marketplace />,
  },
  {
    path: "/marketplace-orchestrator/login/callback",
    element: <PassportLoginCallback />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
