import {
  AddTokensEventType,
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
import { WrappedBrowserProvider } from "@imtbl/checkout-sdk";

const ADD_TOKENS_TARGET_ID = "add-tokens-widget-target";

function AddTokensUI() {
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

  const getPersistedToPresetProvider = () => localStorage.getItem('imtbl/addtokens_presetToProvider') === 'true';
  const [presetToProvider, setPresetToProvider] = useState<boolean>(getPersistedToPresetProvider());
  const [toProvider, setToProvider] = useState<WrappedBrowserProvider | undefined>(undefined);

  const [toTokenAddress, setToTokenAddress] = useState<string | undefined>(undefined);
  const [toAmount, setToAmount] = useState<string | undefined>(undefined);

  const addTokens = useMemo(
    () =>
      factory.create(WidgetType.ADD_TOKENS, {
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
    addTokens.mount(ADD_TOKENS_TARGET_ID, {
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
    const presetToProviderValue = getPersistedToPresetProvider();

    if (presetToProviderValue !== presetToProvider) {
      localStorage.setItem('imtbl/addtokens_presetToProvider', presetToProvider.toString());
    }

    if (!checkout || !factory) return;
    if (!presetToProvider) {
      toProvider && addTokens.unmount();
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
    addTokens.addListener(AddTokensEventType.CLOSE_WIDGET, (data: any) => {
      console.log("CLOSE_WIDGET", data);
      addTokens.unmount();
    });
    addTokens.addListener(OrchestrationEventType.REQUEST_ONRAMP, (data: any) => {
      console.log("REQUEST_ONRAMP", data);
      factory.updateProvider(data.provider);
      addTokens.unmount();
      onRamp.addListener(OnRampEventType.CLOSE_WIDGET, (data: any) => {
        console.log("CLOSE_WIDGET", data);
        onRamp.unmount();
      });
      onRamp.mount(ADD_TOKENS_TARGET_ID, {
        ...data,
        showBackButton: true,
      });
    });
    addTokens.addListener(AddTokensEventType.CONNECT_SUCCESS, (data: any) => {
      console.log("CONNECT_SUCCESS", data);
    });
    addTokens.addListener(OrchestrationEventType.REQUEST_BRIDGE, (data: any) => {
      console.log("REQUEST_BRIDGE", data);
      addTokens.unmount();
      bridge.addListener(BridgeEventType.CLOSE_WIDGET, (data: any) => {
        console.log("CLOSE_WIDGET", data);
        bridge.unmount();
      });
      bridge.mount(ADD_TOKENS_TARGET_ID, {
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
      addTokens.removeListener(AddTokensEventType.CLOSE_WIDGET);
      addTokens.removeListener(OrchestrationEventType.REQUEST_ONRAMP);
      addTokens.removeListener(AddTokensEventType.CONNECT_SUCCESS);
      onRamp.removeListener(OnRampEventType.CLOSE_WIDGET);
      onRamp.removeListener(OrchestrationEventType.REQUEST_GO_BACK);
      bridge.removeListener(BridgeEventType.CLOSE_WIDGET);
      bridge.removeListener(OrchestrationEventType.REQUEST_GO_BACK);
    }
  }, [addTokens, toProvider, toTokenAddress, toAmount]);

  return (
    <div>
      <h1 className="sample-heading">Checkout Add Tokens</h1>
      <div id={ADD_TOKENS_TARGET_ID}></div>
      <button onClick={() => mount()}>Mount</button>
      <button onClick={() => addTokens.unmount()}>Unmount</button>
      <button
        onClick={() =>
          addTokens.update({ config: { theme: WidgetTheme.LIGHT } })
        }
      >
        Update Config Light
      </button>
      <button
        onClick={() => addTokens.update({ config: { theme: WidgetTheme.DARK } })}
      >
        Update Config Dark
      </button>
      <select
        onChange={(e) =>
          addTokens.update({
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

export default AddTokensUI;
