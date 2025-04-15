import { useEffect, useState } from "react";
import {
  AddTokensEventType,
  Checkout,
  OnRampEventType,
  OrchestrationEventType,
  WalletEventType,
  WidgetTheme,
  WidgetType,
  Widget,
} from "@imtbl/checkout-sdk";
import { WidgetsFactory } from "@imtbl/checkout-widgets";
import { Environment } from "@imtbl/config";
import { passport } from "../../../utils/passport";

function WalletUI() {
  const [wallet, setWallet] = useState<Widget<WidgetType.WALLET> | null>(null);
  const [addTokens, setAddTokens] = useState<Widget<WidgetType.ADD_TOKENS> | null>(null);
  const [onRamp, setOnRamp] = useState<Widget<WidgetType.ONRAMP> | null>(null);

  useEffect(() => {
    passport.connectEvm().then(() => {
      const checkout = new Checkout({
        baseConfig: {
          environment: Environment.SANDBOX,
        },
        passport,
      });
      const factory = new WidgetsFactory(checkout, { theme: WidgetTheme.DARK });
      setWallet(factory.create(WidgetType.WALLET));
      setAddTokens(factory.create(WidgetType.ADD_TOKENS));
      setOnRamp(factory.create(WidgetType.ONRAMP));
    })
  }, []);
  

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
    wallet?.unmount();
  };
  const mount = () => {
    wallet?.mount("wallet");
  };
  const update = (theme: WidgetTheme) => {
    wallet?.update({ config: { theme } });
    addTokens?.update({ config: { theme } });
    onRamp?.update({ config: { theme } });
  };
  const updateLanguage = (language: any) => {
    wallet?.update({ config: { language } });
    addTokens?.update({ config: { language } });
    onRamp?.update({ config: { language } });
  };

  useEffect(() => {
    if (!wallet || !addTokens || !onRamp) return;
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
  }, [wallet, addTokens, onRamp]);

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
