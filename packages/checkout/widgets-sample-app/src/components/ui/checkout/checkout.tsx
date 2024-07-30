import { useEffect, useMemo } from "react";
import {
  Checkout,
  CheckoutFlowType,
  WidgetLanguage,
  WidgetTheme,
  WidgetType,
  WalletProviderName,
  SalePaymentTypes,
} from "@imtbl/checkout-sdk";
import { Environment } from "@imtbl/config";
import { WidgetsFactory } from "@imtbl/checkout-widgets";
import { passport } from "../marketplace-orchestrator/passport";
import { Box } from "@biom3/react";

function CheckoutUI() {
  const checkout = useMemo(
    () => new Checkout({ baseConfig: { environment: Environment.SANDBOX } }),
    []
  );
  const factory = useMemo(
    () => new WidgetsFactory(checkout, { theme: WidgetTheme.DARK }),
    [checkout]
  );
  const checkoutWidget = useMemo(
    () =>
      factory.create(WidgetType.CHECKOUT, {
        config: {
          theme: WidgetTheme.LIGHT,
          wallet: { showNetworkMenu: false },
          sale: {
            hideExcludedPaymentTypes: true,
          },
        },
      }),
    [checkout]
  );

  const unmount = () => {
    checkoutWidget.unmount();
  };

  const update = (theme: WidgetTheme) => {
    checkoutWidget.update({ config: { theme } });
  };

  useEffect(() => {
    passport.connectEvm();
  }, []);

  return (
    <div>
      <h1 className="sample-heading">Checkout Widget</h1>
      <div id="checkout"></div>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          onClick={() => {
            checkoutWidget.mount("checkout", {
              flow: CheckoutFlowType.CONNECT,
              blocklistWalletRdns: [],
            });
          }}
        >
          Mount Connect
        </button>
        <button
          onClick={() => {
            checkoutWidget.mount("checkout", {
              flow: CheckoutFlowType.WALLET,
              walletProviderName: WalletProviderName.METAMASK,
            });
          }}
        >
          Mount Wallet
        </button>
        <button
          onClick={() => {
            checkoutWidget.mount("checkout", {
              flow: CheckoutFlowType.SWAP,
              amount: "0.1",
              fromTokenAddress: "0x3B2d8A1931736Fc321C24864BceEe981B11c3c57", // usdc
              toTokenAddress: "native",
            });
          }}
        >
          Mount Swap
        </button>
        <button
          onClick={() => {
            checkoutWidget.mount("checkout", {
              flow: CheckoutFlowType.BRIDGE,
              amount: "0.2",
              tokenAddress: "native",
            });
          }}
        >
          Mount Bridge
        </button>
        <button
          onClick={() => {
            checkoutWidget.mount("checkout", {
              flow: CheckoutFlowType.ONRAMP,
              amount: "10",
              tokenAddress: "native",
            });
          }}
        >
          Mount On-Ramp
        </button>
        <button
          onClick={() => {
            checkoutWidget.mount("checkout", {
              flow: CheckoutFlowType.SALE,
              items: [
                {
                  productId: "chromium-stack",
                  qty: 2,
                  name: "Chromium Box",
                  image:
                    "https://metalcore-sandbox.mystagingwebsite.com/wp-content/uploads/2024/03/MC_Store_Lv1a.jpg",
                  description: "Chromium Box",
                },
              ],
              environmentId: "4dfc4bec-1867-49aa-ad35-d8a13b206c94",
              collectionName: "Metalcoree",
              excludePaymentTypes: [SalePaymentTypes.CREDIT],
              preferredCurrency: "USDC",
            });
          }}
        >
          Mount Sale
        </button>
      </Box>
      <button onClick={unmount}>Unmount</button>
      <button onClick={() => update(WidgetTheme.LIGHT)}>Light theme</button>
      <button onClick={() => update(WidgetTheme.DARK)}>Dark theme</button>
      <select
        onChange={(e) => {
          console.log("change language");
          checkoutWidget.update({
            config: { language: e.target.value as WidgetLanguage },
          });
        }}
      >
        <option value="en">EN</option>
        <option value="ja">JA</option>
        <option value="ko">KO</option>
        <option value="zh">ZH</option>
      </select>
    </div>
  );
}

export default CheckoutUI;
