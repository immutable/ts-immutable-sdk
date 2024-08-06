import { useEffect, useMemo } from "react";
import {
  Checkout,
  CheckoutFlowType,
  WidgetLanguage,
  WidgetTheme,
  WidgetType,
  WalletProviderName,
  SalePaymentTypes,
  CheckoutEventType,
  CheckoutSuccessEventType,
  CheckoutFailureEventType,
  CheckoutUserActionEventType,
} from "@imtbl/checkout-sdk";
import { Environment } from "@imtbl/config";
import { WidgetsFactory } from "@imtbl/checkout-widgets";
import { passport } from "../marketplace-orchestrator/passport";
import { Box } from "@biom3/react";

function CheckoutUI() {
  const checkout = useMemo(
    () =>
      new Checkout({
        baseConfig: {
          environment: Environment.SANDBOX,
        },
        publishableKey: "pk_imapik-test-gaDU8iOIIn-mLBc@Vvpm",
      }),
    []
  );
  const factory = useMemo(
    () =>
      new WidgetsFactory(checkout, { theme: WidgetTheme.DARK, language: "en" }),
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

  useEffect(() => {
    if (!checkoutWidget) return;

    checkoutWidget.addListener(CheckoutEventType.INITIALISED, (data) => {
      console.log("----------> INITIALISED", data);
    });

    checkoutWidget.addListener(CheckoutEventType.PROVIDER_UPDATED, (data) => {
      console.log("----------> PROVIDER_UPDATED", data);
    });

    checkoutWidget.addListener(CheckoutEventType.CLOSE, (data) => {
      console.log("----------> CLOSE", data);
    });

    checkoutWidget.addListener(CheckoutEventType.SUCCESS, (data) => {
      if (
        data.flow === CheckoutFlowType.SALE &&
        data.type === CheckoutSuccessEventType.SALE_SUCCESS
      ) {
        console.log("----------> SUCCESS SALE_SUCESS", data);
      }
      if (
        data.flow === CheckoutFlowType.SALE &&
        data.type === CheckoutSuccessEventType.SALE_TRANSACTION_SUCCESS
      ) {
        console.log("----------> SUCCESS SALE_TRANSACTION_SUCCESS", data);
      }
      if (data.flow === CheckoutFlowType.ONRAMP) {
        console.log("----------> SUCCESS ONRAMP", data);
      }
      if (
        data.flow === CheckoutFlowType.BRIDGE &&
        data.type === CheckoutSuccessEventType.BRIDGE_SUCCESS
      ) {
        console.log("----------> SUCCESS BRIDGE_SUCCESS", data);
      }
      if (
        data.flow === CheckoutFlowType.BRIDGE &&
        data.type === CheckoutSuccessEventType.BRIDGE_CLAIM_WITHDRAWAL_SUCCESS
      ) {
        console.log(
          "----------> SUCCESS BRIDGE_CLAIM_WITHDRAWAL_SUCCESS",
          data.data
        );
      }

      console.log("----------> SUCCESS", data);
    });

    checkoutWidget.addListener(CheckoutEventType.FAILURE, (data) => {
      if (
        data.flow === CheckoutFlowType.BRIDGE &&
        data.type === CheckoutFailureEventType.BRIDGE_FAILED
      ) {
        console.log("----------> FAILURE BRIDGE_FAILED", data);
      }
      if (
        data.flow === CheckoutFlowType.BRIDGE &&
        data.type === CheckoutFailureEventType.BRIDGE_CLAIM_WITHDRAWAL_FAILED
      ) {
        console.log(
          "----------> FAILURE BRIDGE_CLAIM_WITHDRAWAL_FAILED",
          data.data
        );
      }
      if (data.flow === CheckoutFlowType.CONNECT) {
        console.log("----------> FAILURE CONNECT", data);
      }
      if (data.flow === CheckoutFlowType.ONRAMP) {
        console.log("----------> FAILURE ONRAMP", data);
      }
      if (data.flow === CheckoutFlowType.SWAP) {
        console.log("----------> FAILURE SWAP", data);
      }
      if (data.flow === CheckoutFlowType.SALE) {
        console.log("----------> FAILURE SALE", data);
      }
      console.log("----------> FAILURE", data);
    });

    checkoutWidget.addListener(CheckoutEventType.DISCONNECTED, (data) => {
      console.log("----------> DISCONNECTED", data);
    });

    checkoutWidget.addListener(CheckoutEventType.USER_ACTION, (data) => {
      if (
        data.flow === CheckoutFlowType.SALE &&
        data.type === CheckoutUserActionEventType.PAYMENT_METHOD_SELECTED
      ) {
        console.log("----------> USER_ACTION PAYMENT_METHOD_SELECTED", data);
      }
      if (
        data.flow === CheckoutFlowType.SALE &&
        data.type === CheckoutUserActionEventType.PAYMENT_TOKEN_SELECTED
      ) {
        console.log("----------> USER_ACTION PAYMENT_TOKEN_SELECTED", data);
      }
      if (data.flow === CheckoutFlowType.WALLET) {
        console.log("----------> USER_ACTION WALLET", data);
      }
      console.log("----------> USER_ACTION", data);
    });
  }, [checkoutWidget]);

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
              // blocklistWalletRdns: ["io.metamask"],
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
              collectionName: "Lootboxes",
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
