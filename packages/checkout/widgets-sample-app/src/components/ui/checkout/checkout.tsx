import { useEffect, useMemo, useRef, useState } from "react";
import {
  AppHeaderBar,
  Body,
  Box,
  Button,
  Checkbox,
  FormControl,
  Heading,
  Link,
  MenuItem,
  Select,
  Stack,
  Sticker,
  Toggle,
} from "@biom3/react";

import {
  Checkout,
  WidgetLanguage,
  WidgetTheme,
  CreateProviderParams,
  CommerceWidgetParams,
  CommerceEventType,
  CommerceSuccessEventType,
  WidgetType,
  CommerceFlowType,
  WalletProviderName,
  Widget,
  SalePaymentTypes,
} from "@imtbl/checkout-sdk";
import { Passport } from "@imtbl/passport";
import { WidgetsFactory } from "@imtbl/checkout-widgets";
import { Environment, ImmutableConfiguration } from "@imtbl/config";

import { useAsyncMemo, usePrevState } from "../../../hooks";
import { Message } from "./components/messages";
import { Legend } from "./components/legend";
import { itemsMock } from "./items.mock";
import { WrappedBrowserProvider } from "@imtbl/checkout-sdk";

//
const ENVIRONMENT_DEV = "development" as Environment;

const publishableKey = "pk_imapik-test-Xdera@";

// create a base config
const getBaseConfig = (_environment: Environment) => {
  // skip DEV as its not technically supported by config
  const environment =
    _environment === ENVIRONMENT_DEV ? Environment.SANDBOX : _environment;

  return new ImmutableConfiguration({
    environment,
    publishableKey,
    // apiKey
    // rateLimitingKey
  });
};

// create a passport client
const getPassportClient = (environment: Environment) =>
  new Passport({
    baseConfig: getBaseConfig(environment),
    audience: "platform_api",
    scope: "openid offline_access email transact",
    clientId: "ViaYO6JWck4TZOiiojEak8mz6WvQh3wK",
    redirectUri: "http://localhost:3000/checkout?login=true",
    logoutRedirectUri: "http://localhost:3000/checkout?logout=true",
    logoutMode: "silent",
  });

// create Checkout SDK
const getCheckoutSdk = (passportClient: Passport, environment: Environment) =>
  new Checkout({
    publishableKey,
    passport: passportClient,
    baseConfig: getBaseConfig(environment),
    overrides: {
      // environment: "development" as Environment,
    },
    // swap: { enable: true }
    // bridge: { enable: true }
    // onRamp: { enable: true }
  });

// handle passport login
const usePassportLoginCallback = (passportClient: Passport) => {
  const params = new URLSearchParams(window.location.search);
  const loginParam = params.get("login");
  const logoutParam = params.get("logout");

  useEffect(() => {
    if (logoutParam === "true") {
      passportClient?.logoutSilentCallback('http://localhost:3000/checkout');
    }
  }, [logoutParam, passportClient]);


  useEffect(() => {
    if (loginParam === "true") {
      passportClient?.loginCallback();
    }
  }, [loginParam, passportClient]);
};

// handle creating and connecting a provider
const createBrowserProvider = async (
  checkoutSdk: Checkout,
  params: CreateProviderParams
): Promise<WrappedBrowserProvider> => {
  try {
    const { provider } = await checkoutSdk.createProvider({ ...params });
    const { isConnected } = await checkoutSdk.checkIsWalletConnected({
      provider,
    });

    if (isConnected) return provider;

    try {
      await checkoutSdk.connect({ provider, requestWalletPermissions: true });
    } catch (connectError) {
      console.error("Error connecting provider", connectError);
      throw new Error("Failed to connect the wallet. Please try again.");
    }

    return provider;
  } catch (error) {
    console.error("Error in creating provider", error);
    throw new Error("An error occurred while creating the provider.");
  }
};

// Commerce Widget flows
const flows: Array<CommerceFlowType> = [
  CommerceFlowType.CONNECT,
  CommerceFlowType.WALLET,
  CommerceFlowType.ONRAMP,
  CommerceFlowType.SWAP,
  CommerceFlowType.BRIDGE,
  CommerceFlowType.SALE,
  CommerceFlowType.ADD_TOKENS,
];

function CheckoutUI() {
  // avoid re mounting the widget
  const mounted = useRef<boolean>(false);

  //
  const [environment, prevEnvironment, setEnvironment] = usePrevState(
    Environment.SANDBOX
  );

  const configEnvironment = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get("environment") as Environment) || Environment.SANDBOX;
  }, []);

  // setup passport client
  const passportClient = useMemo(() => {
    return getPassportClient(configEnvironment);
  }, []);
  // handle passport login
  usePassportLoginCallback(passportClient);

  // setup checkout sdk
  const checkoutSdk = useMemo(
    () => getCheckoutSdk(passportClient, configEnvironment),
    [passportClient]
  );

  // set a state to keep widget params and configs
  const [params, setParams] = useState<CommerceWidgetParams | undefined>(
    undefined
  );

  const [flowParams, setFlowParams] = useState<
    Partial<Record<CommerceFlowType, CommerceWidgetParams>>
  >({
    CONNECT: {
      flow: CommerceFlowType.CONNECT,
      // blocklistWalletRdns: ["io.metamask"],
      // targetChainId: ChainId.SEPOLIA,
      // targetWalletRdns: "io.metamask",
      theme: WidgetTheme.LIGHT,
    },
    SALE: {
      flow: CommerceFlowType.SALE,
      items: itemsMock,
      environmentId: "4dfc4bec-1867-49aa-ad35-d8a13b206c94",
      collectionName: "Pixel Aussie Farm",
      excludePaymentTypes: [SalePaymentTypes.CREDIT],
      // preferredCurrency: 'USDC',
    },
    SWAP: {
      flow: CommerceFlowType.SWAP,
      amount: "10",
      fromTokenAddress: "native",
      toTokenAddress: "0x3B2d8A1931736Fc321C24864BceEe981B11c3c57",
    },
    WALLET: {
      flow: CommerceFlowType.WALLET,
    },
    ADD_TOKENS: {
      flow: CommerceFlowType.ADD_TOKENS,
      toAmount: "1",
      toTokenAddress: "native",
    },
  });

  // set a state to keep widget event results
  const [eventResults, setEventResults] = useState<unknown[]>([]);

  // set a state to keep app configs such language and theme
  const [language, prevLanguage, setLanguage] =
    usePrevState<WidgetLanguage>("en");
  const [theme, prevTheme, setTheme] = usePrevState<WidgetTheme>(
    WidgetTheme.DARK
  );

  // set a state to keep connected wallet browserProvider
  const [browserProvider, setBrowserProvider] = useState<WrappedBrowserProvider | undefined>(
    undefined
  );

  // setup widgets factory
  // ignore language or theme changes
  const widgetsFactory = useAsyncMemo(
    async () => new WidgetsFactory(checkoutSdk, { theme, language }),
    [checkoutSdk]
  );

  // setup widgets factory using a local widgets bundle, after building with build:local
  // see packages/checkout/widgets-lib/README.md
  // const widgetsFactory = useAsyncMemo(
  //   () => checkoutSdk?.widgets({ config: { theme, language } }),
  //   [checkoutSdk]
  // );

  // know connected wallet type
  const isMetamask = browserProvider?.ethereumProvider?.isMetaMask;
  const isPassport = browserProvider?.ethereumProvider?.isPassport;

  // handle removing widget
  const unmount = () => {
    mounted.current = false;
    widget?.unmount();
    setEventResults([]);
  };

  // handle rendering widget
  const mount = () => {
    unmount();
    mounted.current = true;
    widget?.mount("widget-root", params);
  };

  // should wait until browserProvider is set to render widget?
  const [renderAfterConnect, prevRenderAfterConnect, setRenderAfterConnect] =
    usePrevState(false);
  const toggleRenderAfterConnect = () => {
    setRenderAfterConnect((prev) => !prev);
  };

  // create the widget once factory is available
  // ignore language or theme changes
  const prevWidget = useRef<Widget<typeof WidgetType.IMMUTABLE_COMMERCE> | undefined>(
    undefined
  );
  const widget = useAsyncMemo(async () => {
    if (widgetsFactory === undefined) return undefined;
    if (renderAfterConnect && !browserProvider) return undefined;

    return widgetsFactory.create(WidgetType.IMMUTABLE_COMMERCE, {
      provider: browserProvider,
      config: {
        theme,
        language,
        // SWAP: {},
        // BRIDGE: {},
        // CONNECT: {},
        // ONRAMP: {},
        SALE: {
          hideExcludedPaymentTypes: true,
          waitFulfillmentSettlements: false,
        },
        WALLET: {
          showDisconnectButton: true,
          showNetworkMenu: true,
        },
      },
    });
  }, [widgetsFactory, browserProvider, renderAfterConnect]);

  // init, and add event listeners
  useEffect(() => {
    if (!widget || mounted.current) return;

    // add event listeners
    widget.addListener(CommerceEventType.INITIALISED, () => {
      setEventResults((prev) => [...prev, { initialised: true }]);
    });

    widget.addListener(CommerceEventType.DISCONNECTED, () => {
      setEventResults((prev) => [...prev, { disconnected: true }]);
    });
    // widget.addListener(
    //   checkout.CheckoutEventType.PROVIDER_UPDATED,
    //   ({ provider, ...data }) => {
    //     console.log('PROVIDER_UPDATED ---->', provider);
    //     setBrowserProvider(provider);
    //     setEventResults((prev) => [
    //       ...prev,
    //       { providerUpdated: true, ...data },
    //     ]);
    //   }
    // );
    widget.addListener(CommerceEventType.SUCCESS, (payload) => {
      if (payload.type === CommerceSuccessEventType.CONNECT_SUCCESS) {
        const { provider, ...data } = payload.data;
        console.log("SUCCESS ---->", provider);
        setBrowserProvider(provider);
        setEventResults((prev) => [...prev, { success: true, ...data }]);
      }
    });
    widget.addListener(CommerceEventType.USER_ACTION, (data) => {
      setEventResults((prev) => [...prev, { userAction: true, ...data }]);
    });
    widget.addListener(CommerceEventType.FAILURE, (data) => {
      setEventResults((prev) => [...prev, { failure: true, ...data }]);
    });
    widget.addListener(CommerceEventType.CLOSE, () => {
      setEventResults((prev) => [...prev, { closed: true }]);
      widget.unmount();
    });

    // // set initial flow to wallet
    // setParams({
    //   flow: checkout.CommerceFlowType.CONNECT,
    // });
  }, [widget]);

  // mount & re-render widget everytime params change
  useEffect(() => {
    if (params?.flow === undefined) return;
    if (renderAfterConnect && !browserProvider) return;

    mount();
  }, [params, renderAfterConnect, browserProvider]);

  // if language or theme change, notify widget
  useEffect(() => {
    if (widget === undefined) return;
    if (!(language !== prevLanguage || theme !== prevTheme)) return;

    widget.update({ config: { language, theme } });
  }, [language, prevLanguage, theme, prevTheme, widget]);

  // announce passport provider
  useEffect(() => {
    const connectEvm = async () => await passportClient.connectEvm({ announceProvider: true });

    connectEvm();
  }, []);

  // after this dApp creates a browserProvider recreate widget
  useEffect(() => {
    if (browserProvider === undefined || widgetsFactory === undefined) return;

    widgetsFactory.updateProvider(browserProvider);
  }, [browserProvider, widgetsFactory]);

  // if render after connect is switched on reset
  useEffect(() => {
    if (prevRenderAfterConnect === false && renderAfterConnect === true) {
      unmount();
    }
    if (prevRenderAfterConnect === true && renderAfterConnect === false) {
      setBrowserProvider(undefined);
    }
  }, [renderAfterConnect, prevRenderAfterConnect, unmount]);

  // unmount when environment changes
  useEffect(() => {
    if (environment !== prevEnvironment && prevEnvironment !== undefined) {
      const params = new URLSearchParams(window.location.search);
      params.set("environment", environment);
      window.location.href = `${window.location.href}?${params.toString()}`;

    }
  }, [environment, prevEnvironment]);

  // unmount when browserProvider is undefined
  useEffect(() => {
    if (browserProvider === undefined && widget && mounted.current) {
      unmount();
    }
  }, [browserProvider, widget]);

  return (
    <Box sx={{ p: "base.spacing.x4" }}>
      <Box sx={{ mb: "base.spacing.x4" }}>
        <AppHeaderBar>
          <AppHeaderBar.OverflowPopoverMenu variant="secondary">
            <MenuItem
              onClick={() => {
                setParams({
                  flow: CommerceFlowType.CONNECT,
                });
              }}
            >
              <MenuItem.Label>Connect</MenuItem.Label>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setParams({
                  flow: CommerceFlowType.WALLET,
                });
              }}
            >
              <MenuItem.Label>Wallet</MenuItem.Label>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setParams({
                  flow: CommerceFlowType.SWAP,
                  amount: "10",
                  fromTokenAddress: "native",
                });
              }}
            >
              <MenuItem.Label>Swap</MenuItem.Label>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setParams({
                  flow: CommerceFlowType.BRIDGE,
                });
              }}
            >
              <MenuItem.Label>Bridge</MenuItem.Label>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setParams({
                  flow: CommerceFlowType.ONRAMP,
                });
              }}
            >
              <MenuItem.Label>On Ramp</MenuItem.Label>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setParams({
                  flow: CommerceFlowType.SALE,
                  items: [
                    {
                      productId: "kangaroo",
                      qty: 1,
                      name: "Kangaroo",
                      image:
                        "https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-10-1.png",
                      description: "Pixel Art Kangaroo",
                    },
                  ],
                  environmentId: "249d9b0b-ee16-4dd5-91ee-96bece3b0473",
                  collectionName: "Pixel Aussie Farm",
                  // excludePaymentTypes: [checkout.SalePaymentTypes.CREDIT],
                  // preferredCurrency: 'USDC',
                });
              }}
            >
              <MenuItem.Label>Primary Sale</MenuItem.Label>
            </MenuItem>
          </AppHeaderBar.OverflowPopoverMenu>
          <AppHeaderBar.RightSlot gap="base.spacing.x4">
            <Box
              sx={{
                appearance: "none",
                borderWidth: "3px",
                px: "base.spacing.x4",
                py: "base.spacing.x1",
                borderColor: "base.color.brand.1",
                brad: "base.borderRadius.x25",
              }}
              rc={
                <select
                  onChange={(e) => {
                    const thm = e.target.value as WidgetTheme;
                    setTheme(thm);
                  }}
                />
              }
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </Box>
            <Box
              sx={{
                appearance: "none",
                borderWidth: "3px",
                px: "base.spacing.x4",
                py: "base.spacing.x1",
                borderColor: "base.color.brand.1",
                brad: "base.borderRadius.x25",
              }}
              rc={
                <select
                  onChange={(e) => {
                    const lang = e.target.value as WidgetLanguage;
                    setLanguage(lang);
                  }}
                />
              }
            >
              <option value="en">🇦🇺</option>
              <option value="ja">🇯🇵</option>
              <option value="ko">🇰🇷</option>
              <option value="zh">🇨🇳</option>
            </Box>
          </AppHeaderBar.RightSlot>
          <AppHeaderBar.LeftSlot gap="base.spacing.x4">
            <Heading>{params?.flow || ""}</Heading>
          </AppHeaderBar.LeftSlot>
        </AppHeaderBar>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Box sx={{ w: "75%", mr: "base.spacing.x4" }}>
          <Stack sx={{ flexWrap: "wrap", py: "base.spacing.x2" }}>
            {/* --- --- --- */}
            <Legend>Environment: {environment.toUpperCase()}</Legend>
            <Box
              sx={{
                display: "flex",
                gap: "base.spacing.x1",
              }}
            >
              <Checkbox
                checked={environment === ENVIRONMENT_DEV}
                onChange={() => setEnvironment(ENVIRONMENT_DEV)}
              />
              <Body>{ENVIRONMENT_DEV.toUpperCase()}</Body>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: "base.spacing.x1",
              }}
            >
              <Checkbox
                checked={environment === Environment.SANDBOX}
                onChange={() => setEnvironment(Environment.SANDBOX)}
              />
              <Body>{Environment.SANDBOX.toUpperCase()}</Body>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: "base.spacing.x1",
              }}
            >
              <Checkbox
                checked={environment === Environment.PRODUCTION}
                onChange={() => setEnvironment(Environment.PRODUCTION)}
              />
              <Body>{Environment.PRODUCTION.toUpperCase()}</Body>
            </Box>

            {/* --- --- --- */}
            <Legend>Flow: {params?.flow.toLocaleUpperCase()}</Legend>
            <FormControl sx={{ alignItems: "center", mb: "base.spacing.x4" }}>
              <FormControl.Label>Connect a provider first</FormControl.Label>
              <Toggle
                onChange={toggleRenderAfterConnect}
                checked={renderAfterConnect}
              />
            </FormControl>

            {(renderAfterConnect || browserProvider) && (
              <>
                <Heading size="xSmall">Connect a provider</Heading>
                <Stack direction="row" gap="base.spacing.x6">
                  <Sticker>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={async () => {
                        if (browserProvider) {
                          setBrowserProvider(undefined);
                          return;
                        }

                        setBrowserProvider(
                          await createBrowserProvider(checkoutSdk, {
                            walletProviderName: WalletProviderName.PASSPORT,
                          })
                        );
                      }}
                    >
                      Passport <Button.Logo logo="PassportSymbol" />
                    </Button>
                    {!isPassport && (
                      <Sticker.Badge variant="fatal" badgeContent="off" />
                    )}
                    {isPassport && (
                      <Sticker.Badge
                        variant="success"
                        isAnimated
                        badgeContent="on"
                      />
                    )}
                  </Sticker>
                  <Sticker>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={async () => {
                        if (browserProvider) {
                          setBrowserProvider(undefined);
                          return;
                        }

                        setBrowserProvider(
                          await createBrowserProvider(checkoutSdk, {
                            walletProviderName: WalletProviderName.METAMASK,
                          })
                        );
                      }}
                    >
                      MetaMask
                      <Button.Logo logo="MetaMaskSymbol" />
                    </Button>
                    {!isMetamask && (
                      <Sticker.Badge variant="fatal" badgeContent="off" />
                    )}
                    {isMetamask && (
                      <Sticker.Badge
                        variant="success"
                        isAnimated
                        badgeContent="on"
                      />
                    )}
                  </Sticker>
                </Stack>
              </>
            )}

            {((renderAfterConnect && browserProvider) || !renderAfterConnect) && (
              <>
                <Heading size="xSmall">Select a flow</Heading>
                <Select
                  defaultLabel="Select a Flow"
                  onSelectChange={(value) => {
                    const flow = value as CommerceFlowType;
                    setParams({
                      ...(flowParams[flow as keyof typeof flowParams] || {}),
                      flow,
                      // spread rest of params for given flow
                    });
                  }}
                >
                  {flows.map((flow) => (
                    <Select.Option key={flow} optionKey={flow}>
                      <Select.Option.Label>{flow}</Select.Option.Label>
                    </Select.Option>
                  ))}
                  <Select.Option key={"INVALID"} optionKey={"INVALID"}>
                    <Select.Option.Label>
                      {"INVALID FLOW TYPE"}
                    </Select.Option.Label>
                  </Select.Option>
                </Select>
              </>
            )}

            {/* --- --- --- */}
            <Legend>Params & Config:</Legend>
          </Stack>
        </Box>
        <Box
          id="widget-root"
          sx={{
            minw: "430px",
            minh: "650px",
            bg: "base.color.translucent.standard.300",
            brad: "base.borderRadius.x5",
          }}
        />
      </Box>
    </Box>
  );
}

export default CheckoutUI;
