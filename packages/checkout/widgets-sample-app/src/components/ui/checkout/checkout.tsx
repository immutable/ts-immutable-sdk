import { useEffect, useMemo, useState } from "react";
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
import { Web3Provider } from "@ethersproject/providers";

function CheckoutUI() {
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | undefined>(
    undefined
  );

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
      web3Provider
        ? new WidgetsFactory(checkout, {
            theme: WidgetTheme.DARK,
            language: "en",
          })
        : undefined,
    [checkout, web3Provider]
  );
  const checkoutWidget = useMemo(
    () =>
      factory
        ? factory.create(WidgetType.CHECKOUT, {
            config: {
              theme: WidgetTheme.LIGHT,
              wallet: { showNetworkMenu: false },
              sale: {
                hideExcludedPaymentTypes: true,
              },
            },
            provider: web3Provider,
          })
        : undefined,
    [factory]
  );

  // Case 1: with MM
  useEffect(() => {
    (async () => {
      const { provider: newProvider } = await checkout.createProvider({
        walletProviderName: WalletProviderName.METAMASK,
      });

      await checkout.connect({
        provider: newProvider,
      });

      const { isConnected } = await checkout.checkIsWalletConnected({
        provider: newProvider,
      });

      if (isConnected) {
        setWeb3Provider(newProvider);
      }
    })();
  }, []);

  // Case 1: with Passport
  // useEffect(() => {
  //   const passportProvider = passport.connectEvm();
  //   setWeb3Provider(new Web3Provider(passportProvider));
  // }, []);

  // Case 2: with MM
  // useEffect(() => {
  //   (async () => {
  //     const { provider: newProvider } = await checkout.createProvider({
  //       walletProviderName: WalletProviderName.METAMASK,
  //     });

  //     setWeb3Provider(newProvider);

  //     await checkout.connect({
  //       provider: newProvider,
  //     });
  //   })();
  // }, []);

  const unmount = () => {
    checkoutWidget?.unmount();
  };

  const update = (theme: WidgetTheme) => {
    checkoutWidget?.update({ config: { theme } });
  };

  useEffect(() => {
    if (!checkoutWidget) return;
    checkoutWidget?.mount("checkout", {
      flow: CheckoutFlowType.CONNECT,
    });
  }, [checkoutWidget]);

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

    checkoutWidget.addListener(CheckoutEventType.SUCCESS, (event) => {
      console.log("🐛 ~ event: ----->", event);

      if (event.type === CheckoutSuccessEventType.CONNECT_SUCCESS) {
        console.log("----------> SUCCESS CONNECT_SUCCESS", event);
        setWeb3Provider(event.data.provider);
      }
      if (event.type === CheckoutSuccessEventType.SALE_SUCCESS) {
        console.log("----------> SUCCESS SALE_SUCESS", event);
      }
      if (event.type === CheckoutSuccessEventType.SALE_TRANSACTION_SUCCESS) {
        console.log("----------> SUCCESS SALE_TRANSACTION_SUCCESS", event);
      }
      if (event.type === CheckoutSuccessEventType.ONRAMP_SUCCESS) {
        console.log("----------> SUCCESS ONRAMP", event);
      }
      if (event.type === CheckoutSuccessEventType.BRIDGE_SUCCESS) {
        console.log("----------> SUCCESS BRIDGE_SUCCESS", event);
      }
      if (
        event.type === CheckoutSuccessEventType.BRIDGE_CLAIM_WITHDRAWAL_SUCCESS
      ) {
        console.log(
          "----------> SUCCESS BRIDGE_CLAIM_WITHDRAWAL_SUCCESS",
          event.data
        );
      }
    });

    checkoutWidget.addListener(CheckoutEventType.FAILURE, (event) => {
      if (event.type === CheckoutFailureEventType.BRIDGE_FAILED) {
        console.log("----------> FAILURE BRIDGE_FAILED", event);
      }
      if (
        event.type === CheckoutFailureEventType.BRIDGE_CLAIM_WITHDRAWAL_FAILED
      ) {
        console.log(
          "----------> FAILURE BRIDGE_CLAIM_WITHDRAWAL_FAILED",
          event.data
        );
      }
      if (event.type === CheckoutFailureEventType.CONNECT_FAILED) {
        console.log("----------> FAILURE CONNECT", event);
      }
      if (event.type === CheckoutFailureEventType.ONRAMP_FAILED) {
        console.log("----------> FAILURE ONRAMP", event);
      }
      if (event.type === CheckoutFailureEventType.SWAP_FAILED) {
        console.log("----------> FAILURE SWAP", event);
      }
      if (event.type === CheckoutFailureEventType.SALE_FAILED) {
        console.log("----------> FAILURE SALE", event);
      }
      console.log("----------> FAILURE", event);
    });

    checkoutWidget.addListener(CheckoutEventType.DISCONNECTED, (event) => {
      console.log("----------> DISCONNECTED", event);
    });

    checkoutWidget.addListener(CheckoutEventType.USER_ACTION, (event) => {
      if (event.type === CheckoutUserActionEventType.PAYMENT_METHOD_SELECTED) {
        console.log(
          "----------> USER_ACTION PAYMENT_METHOD_SELECTED",
          event.data.paymentMethod
        );
      }
      if (event.type === CheckoutUserActionEventType.PAYMENT_TOKEN_SELECTED) {
        console.log("----------> USER_ACTION PAYMENT_TOKEN_SELECTED", event);
      }
      if (event.type === CheckoutUserActionEventType.NETWORK_SWITCH) {
        console.log("----------> USER_ACTION WALLET", event);
      }

      console.log("----------> USER_ACTION", event);
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
            checkoutWidget?.mount("checkout", {
              flow: CheckoutFlowType.CONNECT,
              // blocklistWalletRdns: ["io.metamask"],
            });
          }}
        >
          Mount Connect
        </button>
        <button
          onClick={() => {
            checkoutWidget?.mount("checkout", {
              flow: CheckoutFlowType.WALLET,
              walletProviderName: WalletProviderName.METAMASK,
            });
          }}
        >
          Mount Wallet
        </button>
        <button
          onClick={() => {
            checkoutWidget?.mount("checkout", {
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
            checkoutWidget?.mount("checkout", {
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
            checkoutWidget?.mount("checkout", {
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
            checkoutWidget?.mount("checkout", {
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
          checkoutWidget?.update({
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
