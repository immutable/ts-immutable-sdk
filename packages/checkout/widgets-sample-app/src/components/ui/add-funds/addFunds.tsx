import {
  Checkout,
  WidgetTheme,
  WidgetType,
  WidgetLanguage,
  AddFundsEventType,
  OnRampEventType,
  OrchestrationEventType,
} from "@imtbl/checkout-sdk";
import { WidgetsFactory } from "@imtbl/checkout-widgets";
import { Environment } from "@imtbl/config";
import { useMemo, useEffect } from "react";

import { passport } from "../marketplace-orchestrator/passport";

const ADD_FUNDS_TARGET_ID = "add-funds-widget-target";

function AddFundsUI() {
  const checkout = useMemo(
    () =>
      new Checkout({
        baseConfig: {
          environment: Environment.PRODUCTION,
        },
        passport,
      }),
    []
  );
  const factory = useMemo(
    () =>
      new WidgetsFactory(checkout, {
        walletConnect: {
          projectId: "938b553484e344b1e0b4bb80edf8c362",
          metadata: {
            name: "Checkout Marketplace",
            description: "Checkout Marketplace",
            url: "http://localhost:3000/marketplace-orchestrator",
            icons: [],
          },
        },
      }),
    [checkout]
  );

  const addFunds = useMemo(
    () =>
      factory.create(WidgetType.ADD_FUNDS, {
        config: {
          theme: WidgetTheme.DARK,
        },
      }),
    [factory]
  );
  const onRamp = useMemo(() => factory.create(WidgetType.ONRAMP), [factory]);
  const swap = useMemo(() => factory.create(WidgetType.SWAP), [factory]);
  const bridge = useMemo(() => factory.create(WidgetType.BRIDGE), [factory]);

  useEffect(() => {
    passport.connectEvm();
  }, []);

  // useEffect(() => {
  //   if (!checkout || !factory) return;

  //   (async () => {
  //     const { provider } = await checkout.createProvider({
  //       walletProviderName: WalletProviderName.METAMASK,
  //     });

  //     await checkout.connect({ provider, requestWalletPermissions: false });

  //     const { isConnected } = await checkout.checkIsWalletConnected({
  //       provider,
  //     });

  //     if (isConnected) {
  //       factory.updateProvider(provider);
  //     }
  //   })();
  // }, [checkout, factory]);

  const goBack = () => {
    addFunds.unmount();
    addFunds.mount(ADD_FUNDS_TARGET_ID, {
      showOnrampOption: true,
      showSwapOption: false,
      showBridgeOption: false,
      // toAmount: "1",
      // toTokenAddress: "native",
    });
  };

  useEffect(() => {
    addFunds.mount(ADD_FUNDS_TARGET_ID, {
      showOnrampOption: true,
      showSwapOption: false,
      showBridgeOption: false,
      // toAmount: "1",
      // toTokenAddress: "native",
    });
    addFunds.addListener(AddFundsEventType.CLOSE_WIDGET, (data: any) => {
      console.log("CLOSE_WIDGET", data);
      addFunds.unmount();
    });
    addFunds.addListener(OrchestrationEventType.REQUEST_ONRAMP, (data: any) => {
      console.log("REQUEST_ONRAMP", data);
      addFunds.unmount();
      onRamp.addListener(OnRampEventType.CLOSE_WIDGET, (data: any) => {
        console.log("CLOSE_WIDGET", data);
        onRamp.unmount();
      });
      onRamp.mount(ADD_FUNDS_TARGET_ID, {
        ...data,
        showBackButton: true,
      });
    });
    addFunds.addListener(AddFundsEventType.CONNECT_SUCCESS, (data: any) => {
      console.log("CONNECT_SUCCESS", data);
    });
    onRamp.addListener(OrchestrationEventType.REQUEST_GO_BACK, () => {
      goBack();
    });
  }, [addFunds]);

  return (
    <div>
      <h1 className="sample-heading">Checkout Add Funds</h1>
      <div id={ADD_FUNDS_TARGET_ID}></div>
      <button onClick={() => addFunds.mount(ADD_FUNDS_TARGET_ID)}>Mount</button>
      <button onClick={() => addFunds.unmount()}>Unmount</button>
      <button
        onClick={() =>
          addFunds.update({ config: { theme: WidgetTheme.LIGHT } })
        }
      >
        Update Config Light
      </button>
      <button
        onClick={() => addFunds.update({ config: { theme: WidgetTheme.DARK } })}
      >
        Update Config Dark
      </button>
      <select
        onChange={(e) =>
          addFunds.update({
            config: { language: e.target.value as WidgetLanguage },
          })
        }
      >
        <option value="en">EN</option>
        <option value="ja">JA</option>
        <option value="ko">KO</option>
        <option value="zh">ZH</option>
      </select>
    </div>
  );
}

export default AddFundsUI;
