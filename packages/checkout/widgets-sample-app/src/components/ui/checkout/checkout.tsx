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
import { Web3Provider, ExternalProvider } from "@ethersproject/providers";

import {
  Checkout,
  WidgetLanguage,
  WidgetTheme,
  CreateProviderParams,
  CheckoutWidgetParams,
  CheckoutEventType,
  CheckoutSuccessEventType,
  WidgetType,
  CheckoutFlowType,
  WalletProviderName,
  Widget,
} from "@imtbl/checkout-sdk";
import { Passport } from "@imtbl/passport";
import { WidgetsFactory } from "@imtbl/checkout-widgets";
import { Environment, ImmutableConfiguration } from "@imtbl/config";

import { useAsyncMemo, usePrevState } from "../../../hooks";
import { Message } from "./components/messages";
import { Legend } from "./components/legend";
import { itemsMock } from "./items.mock";

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
  });

// create Checkout SDK
const getCheckoutSdk = (passportClient: Passport, environment: Environment) =>
  new Checkout({
    publishableKey,
    passport: passportClient,
    baseConfig: getBaseConfig(environment),
    overrides: {
      // checkoutAppUrl: "http://localhost:3001",
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

  useEffect(() => {
    if (loginParam === "true") {
      passportClient?.loginCallback();
    }
  }, [loginParam, passportClient]);
};

// handle creating and connecting a provider
const createWeb3Provider = async (
  checkoutSdk: Checkout,
  params: CreateProviderParams
): Promise<Web3Provider> => {
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

// checkout widget flows
const flows: Array<CheckoutFlowType> = [
  CheckoutFlowType.CONNECT,
  CheckoutFlowType.WALLET,
  CheckoutFlowType.ONRAMP,
  CheckoutFlowType.SWAP,
  CheckoutFlowType.BRIDGE,
  CheckoutFlowType.SALE,
];

function CheckoutUI() {
  // avoid re mounting the widget
  const mounted = useRef<boolean>(false);

  //
  const [environment, prevEnvironment, setEnvironment] = usePrevState(
    Environment.SANDBOX
  );

  const [checkoutAppURL, setCheckoutAppURL] = useState("");

  // setup passport client
  const passportClient = useMemo(
    () => getPassportClient(environment),
    [environment]
  );
  // handle passport login
  usePassportLoginCallback(passportClient);

  // setup checkout sdk
  const checkoutSdk = useMemo(
    () => getCheckoutSdk(passportClient, environment),
    [passportClient, environment]
  );

  // set a state to keep widget params and configs
  const [params, setParams] = useState<CheckoutWidgetParams | undefined>(
    undefined
  );

  const [flowParams, setFlowParams] = useState<
    Partial<Record<CheckoutFlowType, CheckoutWidgetParams>>
  >({
    sale: {
      flow: CheckoutFlowType.SALE,
      items: itemsMock,
      environmentId: "249d9b0b-ee16-4dd5-91ee-96bece3b0473",
      collectionName: "Pixel Aussie Farm",
      // excludePaymentTypes: [checkout.SalePaymentTypes.CREDIT],
      // preferredCurrency: 'USDC',
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

  // set a state to keep connected wallet web3Provider
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | undefined>(
    undefined
  );

  // setup widgets factory
  // ignore language or theme changes
  const widgetsFactory = useAsyncMemo(
    async () => new WidgetsFactory(checkoutSdk, { theme, language }),
    []
  );

  // know connected wallet type
  const isMetamask = web3Provider?.provider?.isMetaMask;
  const isPassport = (
    web3Provider?.provider as unknown as ExternalProvider & {
      isPassport: boolean;
    }
  )?.isPassport;

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

  // should wait until web3Provider is set to render widget?
  const [renderAfterConnect, prevRenderAfterConnect, setRenderAfterConnect] =
    usePrevState(false);
  const toggleRenderAfterConnect = () => {
    setRenderAfterConnect((prev) => !prev);
  };

  // create the widget once factory is available
  // ignore language or theme changes
  const prevWidget = useRef<Widget<typeof WidgetType.CHECKOUT> | undefined>(
    undefined
  );
  const widget = useAsyncMemo(async () => {
    if (widgetsFactory === undefined) return undefined;
    if (renderAfterConnect && !web3Provider) return undefined;

    return widgetsFactory.create(WidgetType.CHECKOUT, {
      provider: web3Provider,
      config: {
        theme,
        language,
        // swap: {},
        // bridge: {},
        // connect: {},
        // onRamp: {},
        // sale: {
        //   hideExcludedPaymentTypes: false,
        //   waitFulfillmentSettlements: false,
        // },
        // wallet: {
        //   showDisconnectButton: true,
        //   showNetworkMenu: true,
        // }
      },
    });
  }, [widgetsFactory, web3Provider, renderAfterConnect]);

  // init, and add event listeners
  useEffect(() => {
    if (!widget || mounted.current) return;

    // add event listeners
    widget.addListener(CheckoutEventType.INITIALISED, () => {
      setEventResults((prev) => [...prev, { initialised: true }]);

      if (typeof window === "undefined") return;

      const checkoutAppIframe = document.getElementById(
        "checkout-app"
      ) as HTMLIFrameElement;

      if (checkoutAppIframe?.src) {
        setCheckoutAppURL(checkoutAppIframe.src);
      }
    });

    widget.addListener(CheckoutEventType.DISCONNECTED, () => {
      setEventResults((prev) => [...prev, { disconnected: true }]);
    });
    // widget.addListener(
    //   checkout.CheckoutEventType.PROVIDER_UPDATED,
    //   ({ provider, ...data }) => {
    //     console.log('PROVIDER_UPDATED ---->', provider);
    //     setWeb3Provider(provider);
    //     setEventResults((prev) => [
    //       ...prev,
    //       { providerUpdated: true, ...data },
    //     ]);
    //   }
    // );
    widget.addListener(CheckoutEventType.SUCCESS, (payload) => {
      if (payload.type === CheckoutSuccessEventType.CONNECT_SUCCESS) {
        const { provider, ...data } = payload.data;
        console.log("SUCCESS ---->", provider);
        setWeb3Provider(provider);
        setEventResults((prev) => [...prev, { success: true, ...data }]);
      }
    });
    widget.addListener(CheckoutEventType.USER_ACTION, (data) => {
      setEventResults((prev) => [...prev, { userAction: true, ...data }]);
    });
    widget.addListener(CheckoutEventType.FAILURE, (data) => {
      setEventResults((prev) => [...prev, { failure: true, ...data }]);
    });
    widget.addListener(CheckoutEventType.CLOSE, () => {
      setEventResults((prev) => [...prev, { closed: true }]);
      widget.unmount();
    });

    // // set initial flow to wallet
    // setParams({
    //   flow: checkout.CheckoutFlowType.CONNECT,
    // });
  }, [widget]);

  // mount & re-render widget everytime params change
  useEffect(() => {
    if (params == undefined) return;
    if (renderAfterConnect && !web3Provider) return;

    mount();
  }, [params, renderAfterConnect, web3Provider]);

  // if language or theme change, notify widget
  useEffect(() => {
    if (widget === undefined) return;
    if (!(language !== prevLanguage || theme !== prevTheme)) return;

    widget.update({ config: { language, theme } });
  }, [language, prevLanguage, theme, prevTheme, widget]);

  // announce passport provider
  useEffect(() => {
    passportClient.connectEvm({ announceProvider: true });
  }, []);

  // after this dApp creates a web3Provider recreate widget
  useEffect(() => {
    if (web3Provider === undefined || widgetsFactory === undefined) return;

    widgetsFactory.updateProvider(web3Provider);
  }, [web3Provider, widgetsFactory]);

  // if render after connect is switched on reset
  useEffect(() => {
    if (prevRenderAfterConnect === false && renderAfterConnect === true) {
      unmount();
    }
    if (prevRenderAfterConnect === true && renderAfterConnect === false) {
      setWeb3Provider(undefined);
    }
  }, [renderAfterConnect, prevRenderAfterConnect, unmount]);

  // unmount when environment changes
  useEffect(() => {
    if (environment !== prevEnvironment) {
      console.log("ENV", environment, prevEnvironment);
      unmount();
    }
  }, [environment, prevEnvironment]);

  // unmount when web3Provider is undefined
  useEffect(() => {
    if (web3Provider === undefined && widget && mounted.current) {
      unmount();
    }
  }, [web3Provider, widget]);

  return (
    <Box sx={{ p: "base.spacing.x4" }}>
      <Box sx={{ mb: "base.spacing.x4" }}>
        <AppHeaderBar>
          <AppHeaderBar.OverflowPopoverMenu variant="secondary">
            <MenuItem
              onClick={() => {
                setParams({
                  flow: CheckoutFlowType.CONNECT,
                });
              }}
            >
              <MenuItem.Label>Connect</MenuItem.Label>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setParams({
                  flow: CheckoutFlowType.WALLET,
                });
              }}
            >
              <MenuItem.Label>Wallet</MenuItem.Label>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setParams({
                  flow: CheckoutFlowType.SWAP,
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
                  flow: CheckoutFlowType.BRIDGE,
                });
              }}
            >
              <MenuItem.Label>Bridge</MenuItem.Label>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setParams({
                  flow: CheckoutFlowType.ONRAMP,
                });
              }}
            >
              <MenuItem.Label>On Ramp</MenuItem.Label>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setParams({
                  flow: CheckoutFlowType.SALE,
                  items: [
                    {
                      productId: "kangaroo",
                      qty: 1,
                      name: "Kangaroo",
                      image:
                        "https://iguanas.mystagingwebsite.com/wp-content/uploads/2024/05/character-image-10-1.png",
                      description: "Pixel Art Kangaroo"
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
            <AppHeaderBar.Title>{params?.flow || ""}</AppHeaderBar.Title>
          </AppHeaderBar.LeftSlot>
        </AppHeaderBar>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Box sx={{ w: "75%", mr: "base.spacing.x4" }}>
          <Stack sx={{ flexWrap: "wrap", py: "base.spacing.x2" }}>
            {/* --- --- --- */}
            <Legend>Environment: {environment.toUpperCase()}</Legend>
            {checkoutAppURL && new URL(checkoutAppURL).origin}
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

            {(renderAfterConnect || web3Provider) && (
              <>
                <Heading size="xSmall">Connect a provider</Heading>
                <Stack direction="row" gap="base.spacing.x6">
                  <Sticker>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={async () => {
                        if (web3Provider) {
                          setWeb3Provider(undefined);
                          return;
                        }

                        setWeb3Provider(
                          await createWeb3Provider(checkoutSdk, {
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
                        if (web3Provider) {
                          setWeb3Provider(undefined);
                          return;
                        }

                        setWeb3Provider(
                          await createWeb3Provider(checkoutSdk, {
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

            {((renderAfterConnect && web3Provider) || !renderAfterConnect) && (
              <>
                <Heading size="xSmall">Select a flow</Heading>
                <Select
                  defaultLabel="Select a Flow"
                  onSelectChange={(value) => {
                    const flow = value as CheckoutFlowType;
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
      <Box>
        {checkoutAppURL && (
          <Message type="success" title="Checkout App URL">
            <Link
              variant="secondary"
              weight="bold"
              onClick={() => {
                window.open(checkoutAppURL, "_blank", "noopener,noreferrer");
              }}
            >
              {checkoutAppURL}
              <Link.Icon icon="JumpTo" />
            </Link>
          </Message>
        )}
      </Box>
      <Box>
        <Heading>Events</Heading>
        {eventResults.map((result) => (
          <Box children={JSON.stringify(result, null, 2)} />
        ))}
      </Box>
    </Box>
  );
}

export default CheckoutUI;
