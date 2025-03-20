import { useEffect, useMemo } from "react";
import {
  AddTokensEventType,
  Checkout,
  OnRampEventType,
  OrchestrationEventType,
  WalletEventType,
  WalletProviderName,
  WidgetTheme,
  WidgetType,
} from "@imtbl/checkout-sdk";
import { WidgetsFactory } from "@imtbl/checkout-widgets";
import { Environment } from "@imtbl/config";

function WalletUI() {
  const checkout = useMemo(
    () =>
      new Checkout({
        baseConfig: { environment: Environment.SANDBOX },
      }),
    []
  );
  const factory = useMemo(() => new WidgetsFactory(checkout, {
    walletConnect: {
      projectId: "938b553484e344b1e0b4bb80edf8c362",
      metadata: {
        name: "Checkout Marketplace",
        description: "Checkout Marketplace",
        url: "http://localhost:3000/marketplace-orchestrator",
        icons: [],
      },
    },
  }), [checkout]);
  const wallet = useMemo(() => factory.create(WidgetType.WALLET), [factory]);
  const addTokens = useMemo(
    () => factory.create(WidgetType.ADD_TOKENS),
    [factory]
  );
  const onRamp = useMemo(() => factory.create(WidgetType.ONRAMP), [factory]);

  // Use this to connect to a wallet and skip connect loader
  // useEffect(() => {
  //   if (!checkout) return;

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
  // }, [checkout]);

  const unmount = () => {
    wallet.unmount();
  };
  const mount = () => {
    wallet.mount("wallet");
  };
  const update = (theme: WidgetTheme) => {
    wallet.update({ config: { theme } });
    addTokens.update({ config: { theme } });
    onRamp.update({ config: { theme } });
  };
  const updateLanguage = (language: any) => {
    wallet.update({ config: { language } });
    addTokens.update({ config: { language } });
    onRamp.update({ config: { language } });
  };

  useEffect(() => {
    mount();
    wallet.addListener(WalletEventType.NETWORK_SWITCH, (data) => {
      console.log("NETWORK_SWITCH", data);
    });
    wallet.addListener(WalletEventType.CLOSE_WIDGET, () => {
      unmount();
    });
    wallet.addListener(OrchestrationEventType.REQUEST_ADD_TOKENS, (data) => {
      unmount();
      addTokens.mount("wallet", { ...data, showBackButton: true });
    });
    wallet.addListener(OrchestrationEventType.REQUEST_ONRAMP, (data) => {
      unmount();
      onRamp.mount("wallet", { ...data, showBackButton: true });
    });

    addTokens.addListener(OrchestrationEventType.REQUEST_GO_BACK, () => {
      addTokens.unmount();
      mount();
    });
    addTokens.addListener(AddTokensEventType.CLOSE_WIDGET, () => {
      addTokens.unmount();
    });

    onRamp.addListener(OrchestrationEventType.REQUEST_GO_BACK, () => {
      onRamp.unmount();
      mount();
    });
    onRamp.addListener(OnRampEventType.CLOSE_WIDGET, () => {
      onRamp.unmount();
    });
  }, []);

  return (
    <div>
      <h1 className="sample-heading">Checkout Wallet</h1>
      <div id="wallet"></div>
      <button onClick={unmount}>Unmount</button>
      <button onClick={mount}>Mount</button>
      <button onClick={() => update(WidgetTheme.LIGHT)}>Light theme</button>
      <button onClick={() => update(WidgetTheme.DARK)}>Dark theme</button>
      <button onClick={() => updateLanguage("en")}>EN</button>
      <button onClick={() => updateLanguage("ja")}>JA</button>
      <button onClick={() => updateLanguage("ko")}>KO</button>
      <button onClick={() => updateLanguage("zh")}>ZH</button>
    </div>
  );
}

export default WalletUI;
