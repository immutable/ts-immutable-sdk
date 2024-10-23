import {
  AddFundsEventType,
  BridgeEventType,
  Checkout,
  OnRampEventType,
  OrchestrationEventType,
  WalletProviderName,
  WidgetLanguage,
  WidgetTheme,
  WidgetType,
} from "@imtbl/checkout-sdk";
import { WidgetsFactory } from "@imtbl/checkout-widgets";
import { Environment } from "@imtbl/config";
import { useMemo, useEffect, useState } from "react";

import { passport } from "./passport";
import { Web3Provider } from "@ethersproject/providers";

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

  const [presetToProvider, setPresetToProvider] = useState<boolean>(false);
  const [toProvider, setToProvider] = useState<Web3Provider | undefined>(undefined);

  const [toTokenAddress, setToTokenAddress] = useState<string | undefined>(undefined);
  const [toAmount, setToAmount] = useState<string | undefined>(undefined);

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


  const mount = () => {
    addFunds.mount(ADD_FUNDS_TARGET_ID, {
      showOnrampOption: true,
      showSwapOption: false,
      showBridgeOption: false,
      toProvider,
      toTokenAddress,
      toAmount,
    });
  };

  useEffect(() => {
    passport.connectEvm();
  }, []);

  useEffect(() => {
    if (!checkout || !factory) return;
    if (!presetToProvider) {
      toProvider && addFunds.unmount();
      setToProvider(undefined);
      return;
    }

    (async () => {
      const { provider } = await checkout.createProvider({
        walletProviderName: WalletProviderName.METAMASK,
      });

      await checkout.connect({ provider, requestWalletPermissions: false });

      const { isConnected } = await checkout.checkIsWalletConnected({
        provider,
      });

      if (isConnected) {
        setToProvider(provider);
      }
    })();
  }, [checkout, factory, presetToProvider]);

  const goBack = () => {
    mount();
  };


  useEffect(() => {
    mount();
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
    addFunds.addListener(OrchestrationEventType.REQUEST_BRIDGE, (data: any) => {
      console.log("REQUEST_BRIDGE", data);
      addFunds.unmount();
      bridge.addListener(BridgeEventType.CLOSE_WIDGET, (data: any) => {
        console.log("CLOSE_WIDGET", data);
        bridge.unmount();
      });
      bridge.mount(ADD_FUNDS_TARGET_ID, {
        ...data,
        showBackButton: true,
      });
    });
    onRamp.addListener(OrchestrationEventType.REQUEST_GO_BACK, () => {
      goBack();
    });
    bridge.addListener(OrchestrationEventType.REQUEST_GO_BACK, () => {
      goBack();
    });

    return () => {
      addFunds.removeListener(AddFundsEventType.CLOSE_WIDGET);
      addFunds.removeListener(OrchestrationEventType.REQUEST_ONRAMP);
      addFunds.removeListener(AddFundsEventType.CONNECT_SUCCESS);
      onRamp.removeListener(OnRampEventType.CLOSE_WIDGET);
      onRamp.removeListener(OrchestrationEventType.REQUEST_GO_BACK);
      bridge.removeListener(BridgeEventType.CLOSE_WIDGET);
      bridge.removeListener(OrchestrationEventType.REQUEST_GO_BACK);
    }
  }, [addFunds, toProvider, toTokenAddress, toAmount]);

  return (
    <div>
      <h1 className="sample-heading">Checkout Add Funds</h1>
      <div id={ADD_FUNDS_TARGET_ID}></div>
      <button onClick={() => mount()}>Mount</button>
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
      <br />
      <br />
      <h2>Params</h2>
      <div>
        <b>address</b>
        <input type="text" value={toTokenAddress} onChange={(e) => setToTokenAddress(e.target.value)} placeholder="native | 0x1234" />
        <b>amount</b>
        <input type="text" value={toAmount} onChange={(e) => setToAmount(e.target.value)} placeholder="0" />
      </div>
      <br />
      <b>Deliver to wallet</b><br />
      <button onClick={() => setPresetToProvider(prev => !prev)}>
        {presetToProvider ? 'Disconnect destination wallet' : 'Connect destination wallet'}
      </button>

    </div>
  );
}

export default AddFundsUI;
