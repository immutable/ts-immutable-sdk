import { useEffect, useMemo, useState } from "react";
import { Environment } from "@imtbl/config";
import { config, passport } from "@imtbl/sdk";
import { WidgetsFactory } from "@imtbl/checkout-widgets";
import {
  BridgeEventType,
  OnRampEventType,
  SaleEventType,
  SaleItem,
  SalePaymentTypes,
  SwapEventType,
  WidgetLanguage,
  WidgetTheme,
  WidgetType,
} from "@imtbl/checkout-sdk";
import { Checkout } from "@imtbl/checkout-sdk";
import { Passport } from "@imtbl/passport";

const defaultPassportConfig = {
  environment: "sandbox",
  clientId: "q4gEET7vAKD5jsBWV6j8eoYNKEYpOOw1",
  redirectUri: "http://localhost:3000/sale?login=true",
  logoutRedirectUri: "http://localhost:3000/sale?logout=true",
  audience: "platform_api",
  scope: "openid offline_access email transact",
};

const defaultItems: SaleItem[] = [
  {
    productId: "kangaroo",
    qty: 1,
    name: "Kangaroo",
    image:
      "https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-10-1.png",
    description: "Kangaroo",
  },
  {
    productId: "kookaburra",
    qty: 3,
    name: "Kookaburra",
    image:
      "https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-4-1.png",
    description: "Kookaburra",
  },
  {
    productId: "quokka",
    qty: 2,
    name: "Quokka",
    image:
      "https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-8-1.png",
    description: "Quokka",
  },
  {
    productId: "ibis",
    qty: 1,
    name: "Ibis",
    image:
      "https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-1-1.png",
    description: "Ibis",
  },
  {
    productId: "emu",
    qty: 5,
    name: "Emu",
    image:
      "https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-5-1.png",
    description: "Emu",
  },
];

const useParams = () => {
  const urlParams = new URLSearchParams(window.location.search);

  const login = urlParams.get("login") as string;
  const environmentId = urlParams.get("environmentId") as string;
  const collectionName = urlParams.get("collectionName") as string;
  const excludePaymentTypes = urlParams
    .get("excludePaymentTypes")
    ?.split(",") as SalePaymentTypes[];

  const preferredCurrency = (urlParams.get("preferredCurrency") as string) ?? undefined;
  const excludeFiatCurrencies = (urlParams.get("excludeFiatCurrencies") as string) ?? undefined;
  const hideExcludedPaymentTypes = Boolean(
    urlParams.get("hideExcludedPaymentTypes")
  );

  return {
    login,
    environmentId,
    collectionName,
    excludePaymentTypes,
    preferredCurrency,
    hideExcludedPaymentTypes,
    excludeFiatCurrencies: excludeFiatCurrencies?.split(","),
  };
};

const usePassportInstance = (passportConfig: any) => {
  const {
    clientId,
    redirectUri,
    logoutRedirectUri,
    audience,
    scope,
    environment,
  } = passportConfig;

  if (!clientId || !redirectUri || !logoutRedirectUri || !audience || !scope) {
    return undefined;
  }

  const passportInstance = new passport.Passport({
    baseConfig: new config.ImmutableConfiguration({
      environment: environment || config.Environment.SANDBOX,
    }),
    clientId,
    redirectUri,
    logoutRedirectUri,
    audience,
    scope,
  });

  return passportInstance;
};

export function SaleUI() {
  const params = useParams();
  const {
    login,
    environmentId,
    collectionName,
    excludePaymentTypes,
    preferredCurrency,
    hideExcludedPaymentTypes,
    excludeFiatCurrencies,
  } = params;
  const [passportConfig, setPassportConfig] = useState(
    JSON.stringify(defaultPassportConfig, null, 2)
  );
  const [items, setItems] = useState(JSON.stringify(defaultItems, null, 2));

  const passportInstance = useMemo(
    () => usePassportInstance(JSON.parse(passportConfig)),
    []
  );
  const checkout = useMemo(
    () =>
      new Checkout({
        baseConfig: { environment: Environment.SANDBOX },
        passport: passportInstance as unknown as Passport,
      }),
    [passportInstance]
  );
  const factory = useMemo(
    () =>
      new WidgetsFactory(checkout, {
        theme: WidgetTheme.DARK,
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
  const saleWidget = useMemo(
    () =>
      factory.create(WidgetType.SALE, {
        config: { theme: WidgetTheme.DARK, hideExcludedPaymentTypes },
      }),
    [factory, environmentId, collectionName, defaultItems]
  );
  const bridgeWidget = useMemo(
    () =>
      factory.create(WidgetType.BRIDGE, {
        config: { theme: WidgetTheme.DARK },
      }),
    [factory, environmentId, collectionName, defaultItems]
  );
  const swapWidget = useMemo(
    () =>
      factory.create(WidgetType.SWAP, { config: { theme: WidgetTheme.DARK } }),
    [factory, environmentId, collectionName, defaultItems]
  );
  const onrampWidget = useMemo(
    () =>
      factory.create(WidgetType.ONRAMP, {
        config: { theme: WidgetTheme.DARK },
      }),
    [factory, environmentId, collectionName, defaultItems]
  );

  // mount sale widget and subscribe to close event
  useEffect(() => {
    saleWidget.mount("sale", {
      environmentId,
      collectionName,
      items: defaultItems,
      excludePaymentTypes,
      excludeFiatCurrencies,
      preferredCurrency,
    });
    saleWidget.addListener(SaleEventType.CLOSE_WIDGET, () => {
      saleWidget.unmount();
    });

    saleWidget.addListener(SaleEventType.REQUEST_BRIDGE, (event) => {
      saleWidget.unmount();

      bridgeWidget.mount("bridge");
      bridgeWidget.addListener(BridgeEventType.CLOSE_WIDGET, () => {
        bridgeWidget.unmount();
      });
      return;
    });
    saleWidget.addListener(SaleEventType.REQUEST_SWAP, (event) => {
      saleWidget.unmount();

      swapWidget.mount("swap");
      swapWidget.addListener(SwapEventType.CLOSE_WIDGET, () => {
        swapWidget.unmount();
      });
      return;
    });
    saleWidget.addListener(SaleEventType.REQUEST_ONRAMP, (event) => {
      saleWidget.unmount();

      onrampWidget.mount("onramp", event);
      onrampWidget.addListener(OnRampEventType.CLOSE_WIDGET, () => {
        onrampWidget.unmount();
      });
      return;
    });
  }, [saleWidget, swapWidget, bridgeWidget, onrampWidget]);

  const handlePassportConfigChange = (e: any) => {
    setPassportConfig(e.target.value);
  };

  const handlePassportConfigFormat = (e: any) => {
    let value;
    try {
      value = JSON.parse(e.target.value);
    } catch (error) {
      /** */
    }

    if (value) {
      setPassportConfig(JSON.stringify(value, null, 2));
      localStorage.setItem("imtbl/prw_passportConfig", JSON.stringify(value));
    }
  };

  const handleItemsChange = (e: any) => {
    setItems(e.target.value);
  };

  const handleItemsFormat = (e: any) => {
    let value;
    try {
      value = JSON.parse(e.target.value);
    } catch (error) {
      /** */
    }

    if (value) {
      setItems(JSON.stringify(value, null, 2));
      localStorage.setItem("imtbl/prw_items", JSON.stringify(value));
    }
  };

  useEffect(() => {
    if (passportInstance && login) {
      passportInstance.loginCallback();
    }
  }, [login, passportInstance]);

  useEffect(() => {
    const lsPassportConfig = localStorage.getItem("imtbl/prw_passportConfig");
    if (lsPassportConfig) {
      setPassportConfig(JSON.stringify(JSON.parse(lsPassportConfig), null, 2));
    }

    const lsItems = localStorage.getItem("imtbl/prw_items");
    if (lsItems) {
      setItems(JSON.stringify(JSON.parse(lsItems), null, 2));
    }
  }, []);

  return (
    <>
      <div id="sale"></div>
      <div id="bridge"></div>
      <div id="swap"></div>
      <div id="onramp"></div>
      <button
        onClick={() =>
          saleWidget.mount("sale", {
            environmentId,
            collectionName,
            items: defaultItems,
            excludePaymentTypes,
            preferredCurrency,
            excludeFiatCurrencies,
          })
        }
      >
        Mount
      </button>
      <button onClick={() => saleWidget.unmount()}>Unmount</button>
      <button
        onClick={() =>
          saleWidget.update({ config: { theme: WidgetTheme.LIGHT } })
        }
      >
        Update Config Light
      </button>
      <button
        onClick={() =>
          saleWidget.update({ config: { theme: WidgetTheme.DARK } })
        }
      >
        Update Config Dark
      </button>
      <select
        onChange={(e) =>
          saleWidget.update({
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
      <br />
      <h3>
        Passport Config{" "}
        <button
          onClick={() => {
            passportInstance?.logout();
          }}
        >
          Passport logout
        </button>
      </h3>
      <textarea
        rows={12}
        cols={80}
        value={passportConfig}
        onChange={handlePassportConfigChange}
        onBlur={handlePassportConfigFormat}
      />

      <br />
      <br />
      <h3>Items</h3>
      <textarea
        rows={20}
        cols={80}
        value={items}
        onChange={handleItemsChange}
        onBlur={handleItemsFormat}
      />
    </>
  );
}
