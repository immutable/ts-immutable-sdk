import {
  Checkout,
  CheckoutFlowType,
  WidgetLanguage,
  WidgetTheme,
  WidgetType,
  WalletProviderName
} from "@imtbl/checkout-sdk";
import { WidgetsFactory } from "@imtbl/checkout-widgets";
import { useMemo } from "react";
import { Environment } from "@imtbl/config";

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
        config: { wallet: { showNetworkMenu: false } },
      }),
    [checkout]
  );

  const unmount = () => {
    checkoutWidget.unmount();
  };
  const update = (theme: WidgetTheme) => {
    checkoutWidget.update({ config: { theme } });
  };

  return (
    <div>
      <h1 className="sample-heading">Checkout Widget</h1>
      <div id="checkout"></div>
      <button onClick={unmount}>Unmount</button>
      <button
        onClick={() => {
          checkoutWidget.mount("checkout", {
            flow: CheckoutFlowType.CONNECT,
            blocklistWalletRdns: ["com.metamask.io"],
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
      <button onClick={() => update(WidgetTheme.LIGHT)}>Light theme</button>
      <button onClick={() => update(WidgetTheme.DARK)}>Dark theme</button>
      <select
        onChange={(e) =>
          checkoutWidget.update({
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

export default CheckoutUI;
