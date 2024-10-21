import { useEffect, useMemo } from "react";
import {
  AddFundsEventType,
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
        baseConfig: { environment: Environment.PRODUCTION },
      }),
    []
  );
  const factory = useMemo(() => new WidgetsFactory(checkout, {}), [checkout]);
  const wallet = useMemo(() => factory.create(WidgetType.WALLET), [factory]);
  const addFunds = useMemo(
    () => factory.create(WidgetType.ADD_FUNDS),
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
    addFunds.update({ config: { theme } });
    onRamp.update({ config: { theme } });
  };
  const updateLanguage = (language: any) => {
    wallet.update({ config: { language } });
    addFunds.update({ config: { language } });
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
    wallet.addListener(OrchestrationEventType.REQUEST_ADD_FUNDS, (data) => {
      unmount();
      addFunds.mount("wallet", { ...data, showBackButton: true });
    });
    wallet.addListener(OrchestrationEventType.REQUEST_ONRAMP, (data) => {
      unmount();
      onRamp.mount("wallet", { ...data, showBackButton: true });
    });

    addFunds.addListener(OrchestrationEventType.REQUEST_GO_BACK, () => {
      addFunds.unmount();
      mount();
    });
    addFunds.addListener(AddFundsEventType.CLOSE_WIDGET, () => {
      addFunds.unmount();
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
