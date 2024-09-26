import { v as ButtCon, _ as _objectWithoutProperties, w as useTheme, x as getStartingSize, D as DEFAULT_BUTTON_SIZE, y as merge, r as reactExports, z as flattenChildren, j as jsx, A as isChildSubcomponent, F as SmartClone, G as Box, H as getResponsiveSx, J as BUTTON_SIZES, K as setDefaultSxBackgroundColor, M as ClassNames, N as Button, Q as ButtonIcon, R as ButtonLogo, T as _defineProperty, U as TokenFilterTypes, l as useTranslation, X as ViewContext, o as jsxs, Y as Body, V as ViewActions, Z as ConnectLoaderContext, $ as useAnalytics, a0 as formatZeroAmount, a1 as EventTargetContext, a2 as isPassportProvider, h as getL2ChainId, i as getL1ChainId, a3 as Environment, a4 as MenuItem, a5 as tokenValueFormat, a6 as UserJourney, a7 as orchestrationEvents, I as IMTBLWidgetEvents, a8 as ZERO_BALANCE_STRING, a9 as isNativeToken, aa as sendNetworkSwitchEvent, ab as CheckoutErrorType, p as SharedViews, ac as NetworkFilterTypes, ad as sortNetworksCompareFn, ae as FramedImage, af as getChainImage, ag as DEFAULT_BALANCE_RETRY_POLICY, ah as sortTokensByAmount, ai as getTokenImageByAddress, aj as calculateCryptoToFiat, ak as HeaderNavigation, al as ButtonNavigationStyles, am as sendWalletWidgetCloseEvent, an as FooterLogo, ao as SimpleLayout, ap as WalletProviderName, aq as getWalletProviderNameByProvider, ar as abbreviateWalletAddress, as as Heading, at as Drawer, au as useWalletConnect, av as sendDisconnectWalletEvent, aw as isWalletConnectProvider, ax as heroBackGroundStyles, ay as heroImageStyles, az as heroImageBottomAlign, aA as SimpleTextBody, aB as FAQS_LINK, aC as Link, aD as viewReducer, aE as initialViewState, L as LoadingView, E as ErrorView } from './index-Ae2juTF3.js';
import { C as CryptoFiatContext, a as CryptoFiatActions, b as CryptoFiatProvider, T as TopUpView } from './TopUpView-BinG-jkK.js';
import { T as TokenImage, r as retry, u as useInterval } from './retry-CDK--oGi.js';

var horizontalMenuSxProps = {
  justifyContent: "stretch",
  bg: "base.color.translucent.standard.100",
  position: "relative",
  d: "flex",
  w: "100%"
};
function getContainerStyles(_ref) {
  var size = _ref.size,
    theme = _ref.theme;
  var paddingAndGap = /large|medium/.test(size) ? theme.base.spacing.x2 : theme.base.spacing.x1;
  return {
    gap: paddingAndGap,
    padding: paddingAndGap,
    borderRadius: /large|medium/.test(size) ? theme.base.borderRadius.x8 : theme.base.borderRadius.x4
  };
}
var renderResponsiveContainerStyles = function renderResponsiveContainerStyles(_ref2) {
  var size = _ref2.size,
    theme = _ref2.theme;
  return getResponsiveSx({
    size: size,
    theme: theme,
    renderSxAtSize: getContainerStyles
  });
};
var buttonBaseSxProps = {
  flex: 1,
  paddingX: "base.spacing.x4",
  transitionProperty: "background, color, box-shadow",
  transitionDuration: "base.motion.normal.fast.cssDuration",
  transitionTimingFunction: "base.motion.normal.fast.cssEase",
  "& > span": {
    textAlign: "left",
    whiteSpace: "nowrap"
  },
  // @NOTE: make some minor style overrides for the Button and ButtCon components:
  "&.HorizontalMenuButton, &.HorizontalMenuButtCon": {
    "&:hover:not([disabled])::before": {
      content: "unset"
    },
    "&:hover:not([disabled])": {
      bg: "base.color.translucent.emphasis.200",
      boxShadow: function boxShadow(_ref3) {
        var base = _ref3.base;
        return "inset 0 0 0 ".concat(base.border.size[100], " ").concat(base.color.translucent.standard[1000]);
      }
    },
    "&:active:not([disabled])": {
      bg: "base.color.translucent.emphasis.100"
    },
    "&.selected": {
      bg: "base.color.translucent.inverse.500"
    },
    "&.selected, &:active:not([disabled])": {
      boxShadow: function boxShadow(_ref4) {
        var base = _ref4.base;
        return "inset 0 0 0 ".concat(base.border.size[200], " ").concat(base.color.translucent.standard[1000]);
      }
    }
  }
};
function getButtonStyles(_ref5) {
  var size = _ref5.size,
    theme = _ref5.theme;
  return {
    borderRadius: /large|medium/.test(size) ? theme.base.borderRadius.x4 : theme.base.spacing.x2
  };
}
var renderResponsiveButtonStyles = function renderResponsiveButtonStyles(_ref6) {
  var size = _ref6.size,
    theme = _ref6.theme;
  return getResponsiveSx({
    size: size,
    theme: theme,
    renderSxAtSize: getButtonStyles
  });
};

var _excluded$2 = ["sx", "size", "selected", "className"];
function ownKeys$2(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$2(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$2(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$2(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function HorizontalMenuButtCon(_ref) {
  var _ref$sx = _ref.sx,
    sx = _ref$sx === void 0 ? {} : _ref$sx,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? "medium" : _ref$size,
    selected = _ref.selected,
    className = _ref.className,
    props = _objectWithoutProperties(_ref, _excluded$2);
  var theme = useTheme();
  var startingSize = getStartingSize(size, DEFAULT_BUTTON_SIZE, BUTTON_SIZES);
  var mergedSx = reactExports.useMemo(function () {
    return merge(buttonBaseSxProps, getButtonStyles({
      size: startingSize,
      theme: theme
    }), renderResponsiveButtonStyles({
      size: size,
      theme: theme
    }), setDefaultSxBackgroundColor(sx, "base.color.translucent.emphasis.100"), sx);
  }, [sx, startingSize, size, theme]);
  return jsx(ClassNames, {
    children: function children(_ref2) {
      var cx = _ref2.cx;
      return jsx(ButtCon, _objectSpread$2(_objectSpread$2({}, props), {}, {
        size: size,
        variant: "tertiary",
        sx: mergedSx,
        className: cx(className, "HorizontalMenuButtCon", {
          selected: selected
        })
      }));
    }
  });
}
HorizontalMenuButtCon.displayName = "HorizontalMenuButtCon";
HorizontalMenuButtCon.SvgIcon = ButtCon.SvgIcon;

var _excluded$1 = ["children", "sx", "size", "selected", "className"];
function ownKeys$1(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$1(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$1(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function HorizontalMenuButton(_ref) {
  var _children = _ref.children,
    _ref$sx = _ref.sx,
    sx = _ref$sx === void 0 ? {} : _ref$sx,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? "medium" : _ref$size,
    selected = _ref.selected,
    className = _ref.className,
    props = _objectWithoutProperties(_ref, _excluded$1);
  var theme = useTheme();
  var startingSize = getStartingSize(size, DEFAULT_BUTTON_SIZE, BUTTON_SIZES);
  var mergedSx = reactExports.useMemo(function () {
    return merge(buttonBaseSxProps, getButtonStyles({
      size: startingSize,
      theme: theme
    }), renderResponsiveButtonStyles({
      size: size,
      theme: theme
    }), setDefaultSxBackgroundColor(sx, "base.color.translucent.emphasis.100"), sx);
  }, [sx, startingSize, size, theme]);
  return jsx(ClassNames, {
    children: function children(_ref2) {
      var cx = _ref2.cx;
      return jsx(Button, _objectSpread$1(_objectSpread$1({}, props), {}, {
        size: size,
        variant: "tertiary",
        className: cx(className, "HorizontalMenuButton", {
          selected: selected
        }),
        sx: mergedSx,
        children: _children
      }));
    }
  });
}
HorizontalMenuButton.displayName = "HorizontalMenuButton";
HorizontalMenuButton.Icon = ButtonIcon;
HorizontalMenuButton.Logo = ButtonLogo;

var _excluded = ["children", "sx", "size", "className"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function HorizontalMenu(_ref) {
  var children = _ref.children,
    _ref$sx = _ref.sx,
    sx = _ref$sx === void 0 ? {} : _ref$sx,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? "medium" : _ref$size,
    className = _ref.className,
    props = _objectWithoutProperties(_ref, _excluded);
  var theme = useTheme();
  var startingSize = getStartingSize(size, DEFAULT_BUTTON_SIZE, BUTTON_SIZES);
  var containerSx = merge(horizontalMenuSxProps, getContainerStyles({
    size: startingSize,
    theme: theme
  }), renderResponsiveContainerStyles({
    size: size,
    theme: theme
  }), sx);
  var flattenedChildren = reactExports.useMemo(function () {
    return flattenChildren(children);
  }, [children]);
  return jsx(Box, _objectSpread(_objectSpread({}, props), {}, {
    sx: containerSx,
    className: "".concat(className !== null && className !== void 0 ? className : "", " HorizontalMenu"),
    children: reactExports.Children.map(flattenedChildren, function (child) {
      if (isChildSubcomponent(child, HorizontalMenuButtCon) || isChildSubcomponent(child, HorizontalMenuButton)) {
        return jsx(SmartClone, {
          size: child.props.size ? child.props.size : size,
          children: child
        });
      }
      return child;
    })
  }));
}
HorizontalMenu.displayName = "HorizontalMenu";
HorizontalMenu.Button = HorizontalMenuButton;
HorizontalMenu.ButtCon = HorizontalMenuButtCon;

const initialWalletState = {
    walletProviderName: null,
    network: null,
    tokenBalances: [],
    supportedTopUps: null,
    /** initial state gets overriden when reducer set up in WalletWidget.tsx */
    walletConfig: {
        showDisconnectButton: true,
        showNetworkMenu: true,
    },
};
var WalletActions;
(function (WalletActions) {
    WalletActions["SET_WALLET_PROVIDER_NAME"] = "SET_WALLET_PROVIDER_NAME";
    WalletActions["SET_NETWORK"] = "SET_NETWORK";
    WalletActions["SET_TOKEN_BALANCES"] = "SET_TOKEN_BALANCES";
    WalletActions["SET_SUPPORTED_TOP_UPS"] = "SUPPORTED_TOP_UPS";
})(WalletActions || (WalletActions = {}));
// eslint-disable-next-line @typescript-eslint/naming-convention
const WalletContext = reactExports.createContext({
    walletState: initialWalletState,
    walletDispatch: () => { },
});
WalletContext.displayName = 'WalletContext'; // help with debugging Context in browser
const walletReducer = (state, action) => {
    switch (action.payload.type) {
        case WalletActions.SET_WALLET_PROVIDER_NAME:
            return {
                ...state,
                walletProviderName: action.payload.walletProviderName,
            };
        case WalletActions.SET_NETWORK:
            return {
                ...state,
                network: action.payload.network,
            };
        case WalletActions.SET_TOKEN_BALANCES:
            return {
                ...state,
                tokenBalances: action.payload.tokenBalances,
            };
        case WalletActions.SET_SUPPORTED_TOP_UPS:
            return {
                ...state,
                supportedTopUps: {
                    isSwapEnabled: action.payload.supportedTopUps.isSwapEnabled ?? true,
                    isOnRampEnabled: action.payload.supportedTopUps.isOnRampEnabled ?? true,
                    isBridgeEnabled: action.payload.supportedTopUps.isBridgeEnabled ?? true,
                    isSwapAvailable: action.payload.supportedTopUps.isSwapAvailable ?? true,
                },
            };
        default:
            return state;
    }
};

const fetchTokenSymbols = async (checkout, chainId) => {
    const tokenAllowList = await checkout.getTokenAllowList({
        type: TokenFilterTypes.ALL,
        chainId,
    });
    const symbolSet = new Set();
    tokenAllowList.tokens.forEach((token) => {
        symbolSet.add(token.symbol);
    });
    return Array.from(symbolSet);
};

const totalTokenBalanceStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingX: 'base.spacing.x3',
    paddingY: 'base.spacing.x2',
};
const totalTokenBalanceValueStyle = {
    display: 'flex',
    direction: 'row',
    columnGap: 'base.spacing.x1',
    alignItems: 'center',
};
const coinInfoButtonStyle = {
    height: 'base.icon.size.250',
    width: 'base.icon.size.250',
    minWidth: 'base.icon.size.250',
    fill: 'base.color.accent.4',
    cursor: 'pointer',
};

var WalletWidgetViews;
(function (WalletWidgetViews) {
    WalletWidgetViews["WALLET_BALANCES"] = "WALLET_BALANCES";
    WalletWidgetViews["SETTINGS"] = "SETTINGS";
    WalletWidgetViews["COIN_INFO"] = "COIN_INFO";
    WalletWidgetViews["SUCCESS"] = "SUCCESS";
    WalletWidgetViews["FAIL"] = "FAIL";
})(WalletWidgetViews || (WalletWidgetViews = {}));

function TotalTokenBalance(props) {
    const { t } = useTranslation();
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { totalBalance, loading } = props;
    return (jsxs(Box, { sx: totalTokenBalanceStyle, children: [jsxs(Box, { sx: totalTokenBalanceValueStyle, children: [jsx(Body, { size: "medium", children: t('views.WALLET_BALANCES.totalTokenBalance.heading') }), jsx(Box, { sx: { pl: 'base.spacing.x1' }, children: jsx(ButtCon, { testId: "coin-info-icon", variant: "tertiary", icon: "Information", sx: coinInfoButtonStyle, onClick: () => viewDispatch({
                                payload: {
                                    type: ViewActions.UPDATE_VIEW,
                                    view: { type: WalletWidgetViews.COIN_INFO },
                                },
                            }) }) })] }), jsxs(Box, { sx: totalTokenBalanceValueStyle, children: [jsx(Body, { testId: "total-token-balance-value", weight: "bold", shimmer: loading ? 1 : 0, shimmerSx: { minw: '100px' }, children: t('views.WALLET_BALANCES.totalTokenBalance.totalHeading') }), !loading && (jsxs(Body, { testId: "total-token-balance", weight: "bold", children: ["\u2248 USD $", totalBalance.toFixed(2)] }))] })] }));
}

const ShowMenuItem = (show) => ({
    display: show ? '' : 'none',
});

function BalanceItem({ balanceInfo, theme, bridgeToL2OnClick, }) {
    const { connectLoaderState } = reactExports.useContext(ConnectLoaderContext);
    const { track } = useAnalytics();
    const { checkout, provider } = connectLoaderState;
    const fiatAmount = `≈ USD $${formatZeroAmount(balanceInfo.fiatAmount)}`;
    const { walletState } = reactExports.useContext(WalletContext);
    const { supportedTopUps, network } = walletState;
    const [isOnRampEnabled, setIsOnRampEnabled] = reactExports.useState();
    const [isBridgeEnabled, setIsBridgeEnabled] = reactExports.useState();
    const [isSwapEnabled, setIsSwapEnabled] = reactExports.useState();
    const { eventTargetState: { eventTarget }, } = reactExports.useContext(EventTargetContext);
    const [onRampAllowedTokens, setOnRampAllowedTokens] = reactExports.useState([]);
    const isPassport = isPassportProvider(provider);
    reactExports.useEffect(() => {
        const getOnRampAllowedTokens = async () => {
            if (!checkout)
                return;
            const onRampAllowedTokensResult = await checkout.getTokenAllowList({
                type: TokenFilterTypes.ONRAMP,
                chainId: getL2ChainId(checkout.config),
            });
            setOnRampAllowedTokens(onRampAllowedTokensResult.tokens);
        };
        getOnRampAllowedTokens();
    }, [checkout]);
    reactExports.useEffect(() => {
        if (!network || !supportedTopUps || !checkout)
            return;
        const enableAddCoin = network.chainId === getL2ChainId(checkout.config)
            && (supportedTopUps?.isOnRampEnabled ?? true);
        setIsOnRampEnabled(enableAddCoin);
        const enableMoveCoin = (network.chainId === getL1ChainId(checkout.config)
            || network.chainId === getL2ChainId(checkout.config))
            && (supportedTopUps?.isBridgeEnabled ?? true);
        setIsBridgeEnabled(enableMoveCoin);
        const enableSwapCoin = network.chainId === getL2ChainId(checkout.config)
            && (supportedTopUps?.isSwapEnabled ?? true)
            && (supportedTopUps?.isSwapAvailable ?? true);
        setIsSwapEnabled(enableSwapCoin);
    }, [network, supportedTopUps, checkout, isPassport]);
    const showAddMenuItem = reactExports.useMemo(() => Boolean(isOnRampEnabled
        && onRampAllowedTokens.length > 0
        && onRampAllowedTokens.find((token) => token.address?.toLowerCase() === balanceInfo.address?.toLowerCase())), [isOnRampEnabled, onRampAllowedTokens]);
    return (jsxs(MenuItem, { testId: `balance-item-${balanceInfo.symbol}`, emphasized: true, children: [jsx(MenuItem.FramedImage, { use: (jsx(TokenImage, { theme: theme, src: balanceInfo.icon, name: balanceInfo.symbol, environment: checkout?.config.environment ?? Environment.PRODUCTION })), circularFrame: true }), jsx(MenuItem.Label, { children: balanceInfo.symbol }), jsx(MenuItem.Caption, { children: balanceInfo.description }), jsx(MenuItem.PriceDisplay, { testId: `balance-item-${balanceInfo.symbol}`, price: tokenValueFormat(balanceInfo.balance), fiatAmount: fiatAmount }), (isOnRampEnabled || isSwapEnabled || isBridgeEnabled) && (jsxs(MenuItem.OverflowPopoverMenu, { size: "small", testId: "token-menu", onClick: () => {
                    track({
                        userJourney: UserJourney.WALLET,
                        screen: 'WalletBalances',
                        control: 'BalanceItem',
                        controlType: 'Button',
                        extras: {
                            tokenSymbol: balanceInfo.symbol,
                            tokenAddress: balanceInfo.address,
                        },
                    });
                }, children: [jsxs(MenuItem, { testId: "balance-item-add-option", sx: ShowMenuItem(showAddMenuItem), onClick: () => {
                            track({
                                userJourney: UserJourney.WALLET,
                                screen: 'WalletBalances',
                                control: 'AddTokens',
                                controlType: 'Button',
                                extras: {
                                    tokenSymbol: balanceInfo.symbol,
                                    tokenAddress: balanceInfo.address,
                                },
                            });
                            orchestrationEvents.sendRequestOnrampEvent(eventTarget, IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
                                tokenAddress: balanceInfo.address ?? '',
                                amount: '',
                            });
                        }, children: [jsx(MenuItem.Icon, { icon: "Add" }), jsx(MenuItem.Label, { children: `Add ${balanceInfo.symbol}` })] }), jsxs(MenuItem, { testId: "balance-item-swap-option", sx: ShowMenuItem(isSwapEnabled), onClick: () => {
                            track({
                                userJourney: UserJourney.WALLET,
                                screen: 'WalletBalances',
                                control: 'SwapTokens',
                                controlType: 'Button',
                                extras: {
                                    tokenSymbol: balanceInfo.symbol,
                                    tokenAddress: balanceInfo.address,
                                },
                            });
                            orchestrationEvents.sendRequestSwapEvent(eventTarget, IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
                                fromTokenAddress: balanceInfo.address ?? '',
                                toTokenAddress: '',
                                amount: '',
                            });
                        }, children: [jsx(MenuItem.Icon, { icon: "Exchange" }), jsx(MenuItem.Label, { children: `Swap ${balanceInfo.symbol}` })] }), jsxs(MenuItem, { testId: "balance-item-move-option", sx: ShowMenuItem(isBridgeEnabled), onClick: () => {
                            track({
                                userJourney: UserJourney.WALLET,
                                screen: 'WalletBalances',
                                control: 'MoveTokens',
                                controlType: 'Button',
                                extras: {
                                    tokenSymbol: balanceInfo.symbol,
                                    tokenAddress: balanceInfo.address,
                                },
                            });
                            bridgeToL2OnClick(balanceInfo.address);
                        }, children: [jsx(MenuItem.Icon, { icon: "Minting" }), jsx(MenuItem.Label, { children: `Move ${balanceInfo.symbol}` })] })] }))] }));
}

const tokenBalanceListStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    rowGap: 'base.spacing.x2',
};
const noTokensStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const filterZeroBalances = (balanceInfoItems) => balanceInfoItems.filter((balance) => balance.balance !== ZERO_BALANCE_STRING || isNativeToken(balance.address));
function TokenBalanceList({ balanceInfoItems, theme, bridgeToL2OnClick, }) {
    const { t } = useTranslation();
    const filteredBalances = filterZeroBalances(balanceInfoItems);
    return (jsxs(Box, { sx: tokenBalanceListStyle, children: [filteredBalances.length === 0
                && (jsx(Box, { sx: noTokensStyle, children: jsx(Body, { testId: "no-tokens-found", children: t('views.WALLET_BALANCES.tokenBalancesList.noTokensFound') }) })), filteredBalances.map((balance) => (jsx(BalanceItem, { balanceInfo: balance, bridgeToL2OnClick: bridgeToL2OnClick, theme: theme }, balance.id)))] }));
}

const networkMenuStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingTop: 'base.spacing.x4',
};
const activeNetworkButtonStyle = {
    fontWeight: 'base.text.caption.small.bold.fontWeight',
    borderColor: 'base.color.translucent.emphasis.1000',
    borderStyle: 'solid',
    borderWidth: 'base.border.size.200',
};
const networkButtonStyle = {
    fontWeight: 'base.text.caption.small.bold.fontWeight',
};
const logoStyle = (isActive) => ({
    width: '22px',
    filter: isActive ? undefined : 'grayscale(1)',
});
const networkHeadingStyle = {
    paddingX: 'base.spacing.x3',
    paddingY: 'base.spacing.x2',
};

function NetworkMenu() {
    const { t } = useTranslation();
    const { connectLoaderState } = reactExports.useContext(ConnectLoaderContext);
    const { eventTargetState: { eventTarget } } = reactExports.useContext(EventTargetContext);
    const { checkout, provider } = connectLoaderState;
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { walletState, walletDispatch } = reactExports.useContext(WalletContext);
    const { network } = walletState;
    const [allowedNetworks, setNetworks] = reactExports.useState([]);
    const { track } = useAnalytics();
    const switchNetwork = reactExports.useCallback(async (chainId) => {
        if (!checkout || !provider || !network || network.chainId === chainId)
            return;
        track({
            userJourney: UserJourney.WALLET,
            screen: 'WalletBalances',
            control: 'SwitchNetwork',
            controlType: 'Button',
            extras: {
                chainId,
            },
        });
        try {
            const switchNetworkResult = await checkout.switchNetwork({
                provider,
                chainId,
            });
            sendNetworkSwitchEvent(eventTarget, switchNetworkResult.provider, switchNetworkResult.network);
        }
        catch (err) {
            if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) ;
            else {
                viewDispatch({
                    payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: { type: SharedViews.ERROR_VIEW, error: err },
                    },
                });
            }
        }
    }, [checkout, provider, network, walletDispatch, viewDispatch]);
    reactExports.useEffect(() => {
        (async () => {
            if (checkout) {
                const allowedNetworksResponse = await checkout.getNetworkAllowList({
                    type: NetworkFilterTypes.ALL,
                });
                setNetworks(allowedNetworksResponse?.networks ?? []);
            }
            else {
                setNetworks([]);
            }
        })();
    }, [checkout]);
    return (jsxs(Box, { testId: "network-menu", sx: networkMenuStyles, children: [jsx(Body, { testId: "network-heading", size: "medium", sx: networkHeadingStyle, children: t('views.WALLET_BALANCES.networkStatus.heading') }), jsx(HorizontalMenu, { children: checkout
                    && allowedNetworks
                        ?.sort((a, b) => sortNetworksCompareFn(a, b, checkout.config))
                        .map((networkItem) => (jsxs(HorizontalMenu.Button, { testId: `${networkItem.name}-network-button`, sx: networkItem.chainId === network?.chainId
                            ? activeNetworkButtonStyle
                            : networkButtonStyle, size: "small", onClick: () => switchNetwork(networkItem.chainId), children: [jsx(FramedImage, { sx: logoStyle(networkItem.chainId === network?.chainId), use: (jsx("img", { src: getChainImage(checkout?.config.environment, networkItem.chainId), alt: networkItem.name })) }), networkItem.name] }, networkItem.chainId))) })] }));
}

const walletBalanceOuterContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 'base.spacing.x2',
    paddingX: 'base.spacing.x2',
    flex: 1,
};
const walletBalanceContainerStyles = {
    backgroundColor: 'base.color.neutral.800',
    paddingX: 'base.spacing.x1',
    borderRadius: 'base.borderRadius.x6',
    flex: 1,
};
const walletBalanceLoadingIconStyles = {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 'base.spacing.x2',
};
const walletBalanceListContainerStyles = (showNetworkMenu, showAddCoins) => {
    /**
     * Need fixed height set to enable vertical scrolling within div
     * */
    let height = 460;
    if (showNetworkMenu) {
        height -= 104; // - network menu height
    }
    if (showAddCoins) {
        height -= 98; // - add coins button height
    }
    const heightpx = `${height}px`;
    return {
        height: heightpx,
        overflowY: 'auto',
        borderRadius: 'base.borderRadius.x6',
    };
};

const getTokenBalances = async (checkout, provider, chainId) => {
    if (!checkout || !provider || !chainId)
        return [];
    const walletAddress = await provider.getSigner().getAddress();
    // Do not catch the error so that the caller can decide
    // how to handle the experience.
    const getAllBalancesResult = await retry(() => checkout.getAllBalances({
        provider,
        walletAddress,
        chainId,
    }), DEFAULT_BALANCE_RETRY_POLICY);
    if (!getAllBalancesResult)
        return [];
    const sortedTokens = sortTokensByAmount(checkout.config, getAllBalancesResult.balances, chainId).map((balanceResult) => ({
        ...balanceResult,
        token: {
            ...balanceResult.token,
            icon: balanceResult.token.icon
                ?? getTokenImageByAddress(checkout.config.environment, isNativeToken(balanceResult.token.address)
                    ? balanceResult.token.symbol
                    : balanceResult.token.address ?? ''),
        },
    }));
    return sortedTokens;
};
const formatTokenId = (chainId, symbol, address) => {
    if (!address)
        return `${chainId.toString()}-${symbol.toLowerCase()}`;
    return `${chainId.toString()}-${symbol.toLowerCase()}-${address.toLowerCase()}`;
};
const mapTokenBalancesWithConversions = (chainId, balances, conversions) => balances.map((balance) => ({
    id: formatTokenId(chainId, balance.token.symbol, balance.token.address),
    balance: balance.formattedBalance,
    fiatAmount: calculateCryptoToFiat(balance.formattedBalance, balance.token.symbol, conversions),
    symbol: balance.token.symbol,
    address: balance.token.address,
    description: balance.token.name,
    icon: balance.token.icon,
}));

function WalletBalances({ balancesLoading, theme, showNetworkMenu, }) {
    const { t } = useTranslation();
    const { connectLoaderState } = reactExports.useContext(ConnectLoaderContext);
    const { checkout, provider } = connectLoaderState;
    const { cryptoFiatState, cryptoFiatDispatch } = reactExports.useContext(CryptoFiatContext);
    const { walletState } = reactExports.useContext(WalletContext);
    const { eventTargetState: { eventTarget } } = reactExports.useContext(EventTargetContext);
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const [totalFiatAmount, setTotalFiatAmount] = reactExports.useState(0.0);
    const { network, supportedTopUps, tokenBalances, } = walletState;
    const { conversions } = cryptoFiatState;
    const isPassport = isPassportProvider(provider);
    const enableNetworkMenu = !isPassport && showNetworkMenu;
    const { track, page } = useAnalytics();
    const balanceInfos = reactExports.useMemo(() => mapTokenBalancesWithConversions(network?.chainId, tokenBalances, conversions), [tokenBalances, conversions, network?.chainId]);
    reactExports.useEffect(() => {
        page({
            userJourney: UserJourney.WALLET,
            screen: 'WalletBalances',
        });
    }, []);
    reactExports.useEffect(() => {
        (async () => {
            if (!checkout)
                return;
            if (!cryptoFiatDispatch)
                return;
            if (!network)
                return;
            const tokenSymbols = await fetchTokenSymbols(checkout, network.chainId);
            cryptoFiatDispatch({
                payload: {
                    type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
                    tokenSymbols,
                },
            });
        })();
    }, [checkout, cryptoFiatDispatch, network?.chainId]);
    reactExports.useEffect(() => {
        let totalAmount = 0.0;
        balanceInfos.forEach((balance) => {
            const fiatAmount = parseFloat(balance.fiatAmount);
            if (!Number.isNaN(fiatAmount))
                totalAmount += fiatAmount;
        });
        setTotalFiatAmount(totalAmount);
    }, [balanceInfos]);
    const showAddCoins = reactExports.useMemo(() => {
        if (!checkout || !network)
            return false;
        return (network.chainId === getL2ChainId(checkout.config)
            && Boolean(supportedTopUps?.isBridgeEnabled
                || supportedTopUps?.isSwapEnabled
                || supportedTopUps?.isOnRampEnabled));
    }, [checkout, network, supportedTopUps]);
    const handleAddCoinsClick = () => {
        track({
            userJourney: UserJourney.WALLET,
            screen: 'WalletBalances',
            control: 'AddCoins',
            controlType: 'Button',
        });
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: { type: SharedViews.TOP_UP_VIEW },
            },
        });
    };
    const handleBridgeToL2OnClick = (address) => {
        orchestrationEvents.sendRequestBridgeEvent(eventTarget, IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
            tokenAddress: address ?? '',
            amount: '',
        });
    };
    return (jsx(SimpleLayout, { testId: "wallet-balances", header: (jsx(HeaderNavigation, { title: t('views.WALLET_BALANCES.header.title'), rightActions: (jsx(ButtCon, { icon: "SettingsCog", sx: ButtonNavigationStyles(), iconVariant: "bold", onClick: () => {
                    track({
                        userJourney: UserJourney.WALLET,
                        screen: 'WalletBalances',
                        control: 'Settings',
                        controlType: 'Button',
                    });
                    viewDispatch({
                        payload: {
                            type: ViewActions.UPDATE_VIEW,
                            view: { type: WalletWidgetViews.SETTINGS },
                        },
                    });
                }, testId: "settings-button" })), onCloseButtonClick: () => sendWalletWidgetCloseEvent(eventTarget) })), footer: jsx(FooterLogo, {}), children: jsxs(Box, { sx: walletBalanceOuterContainerStyles, children: [jsxs(Box, { sx: walletBalanceContainerStyles, children: [enableNetworkMenu && jsx(NetworkMenu, {}), jsx(TotalTokenBalance, { totalBalance: totalFiatAmount, loading: balancesLoading }), jsxs(Box, { sx: walletBalanceListContainerStyles(enableNetworkMenu, showAddCoins), children: [balancesLoading && (jsxs(Box, { sx: walletBalanceLoadingIconStyles, children: [jsx(MenuItem, { shimmer: true, emphasized: true, testId: "balance-item-shimmer--1" }), jsx(MenuItem, { shimmer: true, emphasized: true, testId: "balance-item-shimmer--2" }), jsx(MenuItem, { shimmer: true, emphasized: true, testId: "balance-item-shimmer--3" })] })), !balancesLoading && (jsx(TokenBalanceList, { balanceInfoItems: balanceInfos, bridgeToL2OnClick: handleBridgeToL2OnClick, theme: theme }))] })] }), showAddCoins && (jsxs(MenuItem, { testId: "add-coins", emphasized: true, onClick: handleAddCoinsClick, children: [jsx(MenuItem.FramedIcon, { icon: "Add" }), jsx(MenuItem.Label, { children: t('views.WALLET_BALANCES.addCoins') })] }))] }) }));
}

function getWalletLogoByName(walletProviderName) {
    switch (walletProviderName) {
        case WalletProviderName.METAMASK: return 'MetaMaskSymbol';
        case WalletProviderName.PASSPORT: return 'PassportSymbolOutlined';
        case 'walletconnect': return 'WalletConnectSymbol';
        default: return 'MetaMaskSymbol';
    }
}

const isCopiedStyle = {
    background: 'base.color.status.success.bright',
    fill: 'base.color.status.success.bright',
};
const isCopiedIconStyle = {
    fill: 'base.color.fixed.black.1000',
};
function WalletAddress({ provider, showL1Warning, setShowL1Warning, }) {
    const [walletAddress, setWalletAddress] = reactExports.useState('');
    const [isCopied, setIsCopied] = reactExports.useState(false);
    const { t } = useTranslation();
    const { track } = useAnalytics();
    const ctaIcon = reactExports.useMemo(() => {
        if (isPassportProvider(provider) && !showL1Warning) {
            return 'ShowPassword';
        }
        return isCopied ? 'Tick' : 'CopyText';
    }, [provider, showL1Warning, isCopied]);
    reactExports.useEffect(() => {
        if (!provider || walletAddress !== '')
            return;
        (async () => {
            const address = await provider.getSigner().getAddress();
            setWalletAddress(address);
        })();
    }, [provider, walletAddress]);
    const handleIconClick = async () => {
        if (walletAddress && ctaIcon === 'CopyText') {
            track({
                userJourney: UserJourney.WALLET,
                screen: 'Settings',
                control: 'CopyWalletAddress',
                controlType: 'Button',
            });
            navigator.clipboard.writeText(walletAddress);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1000);
        }
        else if (ctaIcon === 'ShowPassword') {
            setShowL1Warning(true);
        }
    };
    return (jsxs(MenuItem, { testId: "wallet-address", emphasized: true, size: "medium", children: [jsx(MenuItem.FramedLogo, { logo: getWalletLogoByName(getWalletProviderNameByProvider(provider)), sx: { backgroundColor: 'base.color.translucent.standard.200' } }), jsx(ButtCon, { variant: "tertiary", iconVariant: "bold", size: "small", icon: ctaIcon, iconSx: {
                    ...(isCopied ? isCopiedIconStyle : {}),
                }, onClick: handleIconClick, sx: {
                    cursor: 'pointer',
                    ...(isCopied ? isCopiedStyle : {}),
                } }), jsx(MenuItem.Label, { children: t('views.SETTINGS.walletAddress.label') }), jsx(MenuItem.Caption, { testId: "wallet-address", children: abbreviateWalletAddress(walletAddress) })] }));
}

const settingsBoxStyle = {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 'base.spacing.x2',
    paddingX: 'base.spacing.x4',
};
const settingsDisconnectButtonStyle = { marginTop: '32px' };

function TransferAssetsL1WarningHero() {
    return (jsx(Box, { testId: "transfer-assets-l1-warning-hero", sx: {
            display: 'flex',
            justifyContent: 'center',
            padding: 'base.spacing.x4',
        }, children: jsx(Box, { children: jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "135", height: "137", viewBox: "0 0 135 137", fill: "none", children: [jsx("path", { d: "M76.2361 65.9046L76.5095 17.3023C76.5157 15.9172 76.0711 14.9946 75.3435 14.6207C74.0964 13.9799 72.9093 14.4957 71.4798 15.3728L29.2306 41.5137L28.3702 98.7706L76.2398 65.9035L76.2361 65.9046Z", fill: "black", stroke: "black", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M85.4571 126.862L85.791 76.8509C85.8102 74.0184 83.742 70.6325 81.1983 69.3267L47.8586 51.3375C46.7068 50.7462 45.739 49.8676 45.0526 48.788L43.4726 46.3043C42.7862 45.2247 41.8184 44.3461 40.6665 43.7548L36.2848 41.5054L31.2783 42.6987L30.909 101.567C30.9861 102.57 31.6727 103.52 32.9446 104.173L80.2378 129.343L81.6163 131.639L84.2802 129.667L84.2754 129.664C85.0031 129.123 85.4546 128.164 85.4632 126.862L85.4571 126.862Z", fill: "#F3F3F3", stroke: "black", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M83.1421 78.7933C83.1612 75.96 81.0925 72.5732 78.5483 71.267L30.2174 45.562C28.8517 44.8609 28.1628 43.8191 28.1721 42.7358L27.7773 103.281C27.8544 104.284 28.5413 105.234 29.8134 105.887L78.1443 131.592C80.6909 132.9 82.7889 131.652 82.8068 128.821L83.1408 78.7956L83.1421 78.7933Z", fill: "#F3F3F3", stroke: "black", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M36.8699 42.6587C36.8641 43.5432 35.5341 44.2721 33.9017 44.2823C32.2694 44.2925 30.9508 43.5854 30.9555 42.6973C30.9602 41.8091 32.2913 41.0838 33.9237 41.0736C34.7155 41.0681 35.4328 41.2334 35.963 41.5055C36.5244 41.7937 36.8726 42.2027 36.8699 42.6587Z", fill: "#F3F3F3", stroke: "black", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M35.2866 42.6695C35.284 43.0802 34.6673 43.4179 33.9096 43.4227C33.1519 43.4276 32.5394 43.098 32.5419 42.6874C32.5445 42.2767 33.1612 41.939 33.9189 41.9342C34.2856 41.9315 34.6182 42.0084 34.8653 42.1352C35.1268 42.2695 35.288 42.4582 35.2853 42.6719L35.2866 42.6695Z", fill: "black" }), jsx("path", { d: "M70.9275 14.9238L29.4561 40.1902C28.389 40.9925 27.8611 41.9567 27.8526 42.8886C27.8526 42.8886 27.6951 44.5777 29.8905 45.7049C32.0859 46.832 34.8391 48.2668 34.8391 48.2668L36.1919 47.4119L31.26 44.8586C29.3491 43.8775 28.9381 42.1986 30.6697 40.8949L72.2083 15.5784C73.3784 14.6992 74.4371 14.4968 75.1905 14.8835C75.1905 14.8835 72.8927 13.4441 70.9288 14.9215L70.9275 14.9238Z", fill: "#F3F3F3", stroke: "black", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M81.0605 110.741L83.1092 111.399L85.7093 118.337L85.7797 107.796L81.2805 106.491L81.0605 110.741Z", fill: "black" }), jsx("path", { d: "M83.1104 113.492C83.1312 110.487 84.073 109.095 87.3742 109.652C89.1483 109.952 90.9444 109.879 92.6948 109.428L96.5484 108.436C99.8885 107.577 102.639 104.113 102.664 100.741C102.686 97.3675 99.9706 95.3116 96.6329 96.1724L91.9518 97.3781C90.3645 97.7883 88.6894 97.6786 87.181 97.0768C84.1103 95.8485 83.2401 94.5701 83.2615 91.3841L81.2915 93.3582L74.7155 111.72L83.1115 113.496L83.1104 113.492Z", fill: "#F3F3F3" }), jsx("path", { d: "M83.1053 113.501C83.1261 110.496 84.0681 109.104 87.3701 109.661C89.1445 109.961 90.9411 109.888 92.6918 109.437L96.5463 108.445C99.8871 107.585 102.638 104.12 102.663 100.747C102.685 97.3736 99.9692 95.3172 96.6308 96.1782L91.9487 97.3841C90.361 97.7944 88.6855 97.6847 87.1768 97.0828C84.1055 95.8542 83.2351 94.5755 83.2564 91.3888", stroke: "black", strokeWidth: "1.33831", strokeMiterlimit: "10" }), jsx("path", { d: "M100.563 99.4451C99.4403 98.3218 97.1152 98.7714 95.3661 100.45C93.6171 102.129 93.1092 104.399 94.2323 105.522L94.7567 106.048L101.088 99.9711L100.563 99.4451Z", fill: "black", stroke: "black", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M99.9733 105.056C101.727 103.381 102.236 101.114 101.111 99.9926C99.986 98.8713 97.6528 99.3204 95.8996 100.996C94.1464 102.671 93.637 104.938 94.762 106.059C95.8869 107.18 98.2201 106.731 99.9733 105.056Z", fill: "#F3F3F3", stroke: "black", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M51.6986 91.7452C50.6642 91.2142 49.827 89.8416 49.8336 88.6901L49.9893 65.7522C49.9984 64.6019 50.8483 64.0955 51.8828 64.6265L72.5076 75.205C73.542 75.736 74.3793 77.1086 74.3726 78.2601L74.2169 101.198C74.2079 102.348 73.3579 102.855 72.3235 102.324L51.6986 91.7452Z", fill: "black", stroke: "black", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M52.7617 91.0867C51.7272 90.5557 50.89 89.1831 50.8966 88.0315L51.0523 65.0931C51.0553 64.8339 51.101 64.6088 51.1799 64.4189C50.4902 64.3771 49.9962 64.8783 49.9906 65.7516L49.8349 88.69C49.8259 89.8403 50.6655 91.2142 51.7 91.7452L72.3252 102.324C73.1244 102.734 73.8145 102.522 74.0887 101.871C73.8709 101.859 73.6341 101.792 73.3845 101.664L52.7593 91.0855L52.7617 91.0867Z", fill: "#F3F3F3", stroke: "black", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M66.9055 85.8915L66.8883 88.4023L64.3853 87.1169L61.8847 85.8328L59.3817 84.5474L57.6065 83.6358C57.2078 83.4311 56.8773 83.5922 56.875 83.9917L56.8689 85.042C56.8653 85.4439 57.1906 85.9418 57.5917 86.1478L59.3669 87.0594L61.8699 88.3448L61.8577 90.1235C61.8541 90.5254 62.1807 91.0209 62.5818 91.2269L63.6292 91.7647C64.0279 91.9695 64.3584 91.8083 64.362 91.4064L64.3742 89.6277L66.8772 90.9131L68.6523 91.8247C69.0511 92.0295 69.3829 91.8659 69.3852 91.4664L69.3974 89.6877L69.4095 87.909C69.4131 87.5071 69.0866 87.0116 68.6854 86.8056L66.9103 85.894L66.9055 85.8915Z", fill: "white" }), jsx("path", { d: "M59.3703 79.5438L59.3581 81.3271C59.3569 81.7313 59.6802 82.2293 60.0844 82.4371L61.862 83.3511L64.3662 84.6386L66.8728 85.9274L66.8862 84.1416C66.8874 83.7374 66.5641 83.2394 66.16 83.0316L64.3823 82.1176L61.8781 80.8301L59.3716 79.5414L59.3703 79.5438Z", fill: "white" }), jsx("path", { d: "M62.6235 73.7033C62.2248 73.4985 61.8943 73.6597 61.892 74.0592L61.8798 75.8379L59.3768 74.5525L57.6016 73.641C57.2029 73.4362 56.8724 73.5973 56.8688 73.9992L56.8566 75.7779L56.8445 77.5566C56.8409 77.9585 57.1674 78.4541 57.5686 78.6601L59.3437 79.5717L59.3609 77.0609L61.8639 78.3463L64.3645 79.6304L66.8675 80.9157L68.6426 81.8273C69.0414 82.0321 69.3719 81.8709 69.3755 81.469L69.3827 80.4224C69.3838 80.0193 69.061 79.5226 68.6598 79.3166L66.8847 78.405L64.3817 77.1197L64.3938 75.341C64.3974 74.9391 64.0709 74.4435 63.6697 74.2375L62.6224 73.6997L62.6235 73.7033Z", fill: "white" }), jsx("path", { d: "M46.8192 101.66L46.8314 99.6311C46.838 98.841 46.2586 97.8985 45.551 97.5353L42.5478 95.9937L42.5679 93.0481C42.5746 92.258 41.9976 91.3167 41.2875 90.9523L38.7449 89.6471C38.3611 89.4501 38.0161 89.4638 37.7758 89.6403L36.4656 90.6093L37.4387 91.7024L37.4277 93.3685L34.4246 91.827C34.0408 91.63 33.6957 91.6437 33.4554 91.8201L32.1452 92.7891L33.1181 93.8094L33.113 94.6306C33.1063 95.4207 33.6858 96.3632 34.3934 96.7264L37.3965 98.268L37.3764 101.214C37.3698 102.004 37.9468 102.945 38.6568 103.309L39.7002 103.845L40.8571 105.593L42.1673 104.624C42.3691 104.473 42.4965 104.205 42.4976 103.842L42.5177 100.897L44.2088 101.765L45.1822 103.415L46.4924 102.446C46.6966 102.297 46.8216 102.028 46.8227 101.665L46.8192 101.66Z", fill: "black", stroke: "black", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M45.514 102.623L45.5261 100.594C45.5327 99.8036 44.9532 98.8609 44.2455 98.4977L41.2419 96.9558L41.262 94.0097C41.2674 93.2219 40.6916 92.2781 39.9815 91.9135L37.4385 90.6082C36.7284 90.2437 36.1455 90.5927 36.1388 91.3829L36.1187 94.329L33.1151 92.7872C32.405 92.4227 31.8184 92.7728 31.8154 93.5619L31.8033 95.5912C31.7967 96.3815 32.3762 97.3241 33.0839 97.6874L36.0875 99.2293L36.0673 102.175C36.0607 102.966 36.6378 103.907 37.3479 104.272L39.8909 105.577C40.601 105.941 41.1839 105.592 41.1906 104.802L41.2107 101.856L44.2143 103.398C44.9244 103.762 45.511 103.412 45.514 102.623Z", fill: "white", stroke: "black", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M55.4177 54.343L85.7278 37.2672L70.5728 15.9224L55.4177 54.343Z", fill: "#FF637F", stroke: "#131313", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M55.4176 54.3431L51.6289 52.2086L66.7839 13.7881L70.5727 15.9226L55.4176 54.3431Z", fill: "#131313", stroke: "#131313", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M69.1528 25.261L71.9944 23.6602V34.3325L69.1528 35.9334V25.261Z", fill: "#131313", stroke: "#131313", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M69.1528 38.0676L71.9944 36.4667V39.6684L69.1528 41.2693V38.0676Z", fill: "#131313", stroke: "#131313", strokeWidth: "1.33831", strokeLinecap: "round", strokeLinejoin: "round" })] }) }) }));
}

function TransferAssetsL1Warning({ provider, showL1Warning, setShowL1Warning, }) {
    const { t } = useTranslation();
    return (jsx(Drawer, { size: "full", visible: showL1Warning, showHeaderBar: false, children: jsxs(Drawer.Content, { children: [jsx(ButtCon, { icon: "Close", variant: "tertiary", sx: {
                        pos: 'absolute',
                        top: 'base.spacing.x5',
                        left: 'base.spacing.x5',
                        backdropFilter: 'blur(30px)',
                    }, onClick: () => setShowL1Warning(false) }), jsx(TransferAssetsL1WarningHero, {}), jsxs(Box, { sx: { px: 'base.spacing.x6' }, children: [jsx(Heading, { sx: {
                                marginTop: 'base.spacing.x6',
                                marginBottom: 'base.spacing.x2',
                                textAlign: 'center',
                            }, children: t('views.SETTINGS.transferAssetsL1Warning.heading') }), jsx(Body, { size: "medium", sx: {
                                display: 'block',
                                textAlign: 'center',
                                color: 'base.color.text.body.secondary',
                                marginBottom: 'base.spacing.x13',
                            }, children: t('views.SETTINGS.transferAssetsL1Warning.body') }), jsx(WalletAddress, { provider: provider, showL1Warning: showL1Warning, setShowL1Warning: setShowL1Warning })] })] }) }));
}

function Settings({ showDisconnectButton }) {
    const [showL1Warning, setShowL1Warning] = reactExports.useState(false);
    const { t } = useTranslation();
    const { connectLoaderState } = reactExports.useContext(ConnectLoaderContext);
    const { provider } = connectLoaderState;
    const { eventTargetState: { eventTarget }, } = reactExports.useContext(EventTargetContext);
    const { ethereumProvider } = useWalletConnect();
    const { page } = useAnalytics();
    reactExports.useEffect(() => {
        page({
            userJourney: UserJourney.WALLET,
            screen: 'Settings',
        });
    }, []);
    // disconnect all Wallet Connect pairings and disconnect the provider
    // so that restoreSession doesn't pick up the previous sessions
    const handleWCDisconnect = async () => {
        if (isWalletConnectProvider(provider)) {
            try {
                if (provider.provider?.session) {
                    const pairings = provider.provider?.signer.client.core.pairing.getPairings();
                    if (pairings && pairings.length > 0) {
                        // eslint-disable-next-line max-len
                        const pairingsToDisconnect = pairings.map((pairing) => ethereumProvider?.signer.client.core.pairing.disconnect({
                            topic: pairing.topic,
                        }));
                        await Promise.allSettled(pairingsToDisconnect);
                    }
                    await provider.provider.disconnect();
                    return;
                }
                if (ethereumProvider) {
                    const pairings = ethereumProvider?.signer.client.core.pairing.getPairings();
                    if (pairings && pairings.length > 0) {
                        // eslint-disable-next-line max-len
                        const pairingsToDisconnect = pairings.map((pairing) => ethereumProvider?.signer.client.core.pairing.disconnect({
                            topic: pairing.topic,
                        }));
                        await Promise.allSettled(pairingsToDisconnect);
                    }
                    await ethereumProvider.disconnect();
                }
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
            }
        }
    };
    return (jsxs(SimpleLayout, { testId: "wallet-balances", header: (jsx(HeaderNavigation, { showBack: true, title: t('views.SETTINGS.header.title'), onCloseButtonClick: () => sendWalletWidgetCloseEvent(eventTarget) })), footer: jsx(FooterLogo, {}), children: [jsxs(Box, { sx: settingsBoxStyle, children: [jsx(WalletAddress, { provider: provider, showL1Warning: showL1Warning, setShowL1Warning: setShowL1Warning }), showDisconnectButton && (jsx(Button, { testId: "disconnect-button", variant: "secondary", sx: settingsDisconnectButtonStyle, onClick: () => {
                            handleWCDisconnect().then(() => {
                                sendDisconnectWalletEvent(eventTarget);
                            });
                        }, children: t('views.SETTINGS.disconnectButton.label') }))] }), jsx(TransferAssetsL1Warning, { provider: provider, showL1Warning: showL1Warning, setShowL1Warning: setShowL1Warning })] }));
}

function IMXCoinsHero() {
    return (jsx(Box, { sx: { ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }, children: jsx(Box, { sx: { ...heroImageStyles, ...heroImageBottomAlign }, children: jsxs("svg", { width: "430", height: "211", viewBox: "0 0 430 211", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsx("path", { d: "M213 120C132.857 120 65.7181 139.009 1 175.641V211H431V178.515C365.165 140.107 295.216 120 213 120Z", fill: "url(#paint0_linear_4525_125520)" }), jsx("path", { d: "M428.5 210.5H383C383 123 114 113.5 236 120.5C333.6 126.1 405 163.833 428.5 182V210.5Z", fill: "#2D0034", fillOpacity: "0.2" }), jsx("path", { d: "M131.005 34.0566L130.576 32.4244L128.944 32.8537L129.373 34.4858L131.005 34.0566Z", fill: "white" }), jsx("path", { d: "M77.1152 45.7678L76.5627 43.6667L74.4617 44.2193L75.0142 46.3203L77.1152 45.7678Z", fill: "white" }), jsx("path", { d: "M264.238 30.1945L262.093 29.8494L261.748 31.9942L263.893 32.3394L264.238 30.1945Z", fill: "white" }), jsx("path", { d: "M348.157 2.3323L348.776 1.04626L347.49 0.427149L346.871 1.71319L348.157 2.3323Z", fill: "white" }), jsx("path", { d: "M342.606 56.5062L342.054 54.4052L339.953 54.9577L340.505 57.0587L342.606 56.5062Z", fill: "white" }), jsx("path", { d: "M348.381 55.0847L349 53.7986L347.714 53.1795L347.095 54.4656L348.381 55.0847Z", fill: "white" }), jsx("path", { d: "M107.606 18.8096L106.681 17.7229L105.594 18.6483L106.52 19.735L107.606 18.8096Z", fill: "white" }), jsx("path", { d: "M233.14 2.3323L233.759 1.04626L232.473 0.427149L231.854 1.71319L233.14 2.3323Z", fill: "white" }), jsx("path", { d: "M2.97844e-07 176.149C62.5366 139.802 135.143 119 212.584 119C292.029 119 366.384 140.892 430 179", stroke: "black" }), jsx("path", { d: "M70.97 142.773C76.3142 146.15 87.6289 137.839 96.242 124.208C104.855 110.578 107.505 96.7911 102.161 93.414C96.8167 90.037 85.5021 98.3487 76.889 111.979C68.2758 125.609 65.6258 139.396 70.97 142.773Z", fill: "#F191FA", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M76.8602 112.001C79.353 108.055 82.0686 104.564 84.8088 101.664L94.3989 126.977C86.0698 138.949 75.925 145.933 70.9515 142.793C65.6033 139.413 68.2536 125.631 76.8692 111.994L76.8602 112.001Z", fill: "black" }), jsx("path", { d: "M96.2211 124.237C104.836 110.608 107.486 96.8249 102.138 93.4455L109.009 97.785C114.357 101.164 111.707 114.947 103.092 128.576C94.4778 142.205 83.1639 150.512 77.8146 147.141L70.9434 142.801C76.2916 146.181 87.6066 137.866 96.2211 124.237Z", fill: "#D8EFF4", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M98.2141 120.884C99.3274 118.901 100.309 116.925 101.153 115.003L108.025 119.342C107.181 121.264 106.2 123.233 105.085 125.224L98.2141 120.884Z", fill: "#F191FA" }), jsx("path", { d: "M102.311 112.191C104.156 107.325 105.052 102.898 104.877 99.4899L111.748 103.829C111.923 107.238 111.035 111.665 109.182 116.531L102.311 112.191Z", fill: "black" }), jsx("path", { d: "M96.2211 124.237C104.836 110.608 107.486 96.8249 102.138 93.4455L109.009 97.785C114.357 101.164 111.707 114.947 103.092 128.576C94.4778 142.205 83.1639 150.512 77.8146 147.141L70.9434 142.801C76.2916 146.181 87.6066 137.866 96.2211 124.237Z", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M341.833 142.899C353.278 131.542 356.039 115.768 348 107.668C339.962 99.5669 324.167 102.207 312.723 113.564C301.278 124.921 298.517 140.695 306.555 148.795C314.594 156.896 330.388 154.256 341.833 142.899Z", fill: "#F191FA", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M341.813 142.853C353.26 131.495 356.014 115.719 347.977 107.616L352.129 111.801C360.166 119.903 357.412 135.68 345.965 147.037C334.519 158.395 318.726 161.037 310.688 152.934L306.536 148.75C314.574 156.852 330.375 154.211 341.813 142.853Z", fill: "#96DAF4", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M344.451 139.969C345.913 138.216 347.189 136.39 348.264 134.524L352.416 138.709C351.341 140.575 350.065 142.4 348.603 144.153L344.451 139.969Z", fill: "#D8EFF4" }), jsx("path", { d: "M349.72 131.746C352.022 126.818 352.967 121.785 352.442 117.302L356.594 121.486C357.119 125.97 356.174 131.002 353.872 135.93L349.72 131.746Z", fill: "black" }), jsx("path", { d: "M341.813 142.853C353.26 131.495 356.014 115.719 347.977 107.616L352.129 111.801C360.166 119.903 357.412 135.68 345.965 147.037C334.519 158.395 318.726 161.037 310.688 152.934L306.536 148.75C314.574 156.852 330.375 154.211 341.813 142.853Z", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M155.769 157.057C169.703 165.169 185.654 163.751 191.396 153.888C197.138 144.026 190.497 129.454 176.563 121.342C162.629 113.229 146.679 114.648 140.937 124.51C135.195 134.373 141.836 148.944 155.769 157.057Z", fill: "#F191FA", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M155.809 157.026C169.744 165.14 185.695 163.714 191.439 153.852L188.473 158.946C182.729 168.808 166.778 170.234 152.843 162.12C138.908 154.006 132.266 139.436 138.01 129.574L140.976 124.48C135.232 134.342 141.876 148.919 155.809 157.026Z", fill: "#96DAF4", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M159.278 158.826C161.349 159.785 163.443 160.544 165.524 161.099L162.558 166.193C160.477 165.639 158.383 164.879 156.311 163.921L159.278 158.826Z", fill: "#D8EFF4" }), jsx("path", { d: "M168.585 161.786C173.941 162.733 179.047 162.342 183.241 160.674L180.275 165.768C176.08 167.436 170.975 167.827 165.619 166.88L168.585 161.786Z", fill: "black" }), jsx("path", { d: "M155.809 157.026C169.744 165.14 185.695 163.714 191.439 153.852L188.473 158.946C182.729 168.808 166.778 170.234 152.843 162.12C138.908 154.006 132.266 139.436 138.01 129.574L140.976 124.48C135.232 134.342 141.876 148.919 155.809 157.026Z", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M234.03 133.525C249.631 129.452 260.983 121.192 259.386 115.075C257.79 108.959 243.848 107.301 228.248 111.374C212.647 115.446 201.294 123.706 202.891 129.823C204.488 135.94 218.429 137.597 234.03 133.525Z", fill: "#F191FA", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M234.031 133.533C249.63 129.462 260.98 121.198 259.388 115.083L261.44 122.943C263.04 129.058 251.682 137.322 236.083 141.393C220.484 145.464 206.542 143.808 204.942 137.685L202.89 129.825C204.49 135.94 218.433 137.604 234.031 133.533Z", fill: "#D8EFF4", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M237.663 132.44C239.836 131.754 241.896 130.986 243.826 130.154L245.878 138.014C243.948 138.838 241.888 139.606 239.715 140.3L237.663 132.44Z", fill: "#F191FA" }), jsx("path", { d: "M246.588 128.896C251.257 126.601 254.941 123.976 257.13 121.367L259.182 129.227C256.985 131.836 253.309 134.461 248.64 136.756L246.588 128.896Z", fill: "black" }), jsx("path", { d: "M234.031 133.533C249.63 129.462 260.98 121.198 259.388 115.083L261.44 122.943C263.04 129.058 251.682 137.322 236.083 141.393C220.484 145.464 206.542 143.808 204.942 137.685L202.89 129.825C204.49 135.94 218.433 137.604 234.031 133.533Z", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M189.995 60.1335C175.063 54.0502 161.025 53.8648 158.64 59.7194C156.255 65.5739 166.426 75.2515 181.358 81.3348C196.29 87.418 210.328 87.6034 212.713 81.7488C215.098 75.8943 204.927 66.2167 189.995 60.1335Z", fill: "#F191FA", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M181.375 81.3031C196.307 87.3891 210.345 87.5729 212.731 81.7174L209.667 89.2437C207.281 95.0992 193.243 94.9154 178.311 88.8293C163.379 82.7433 153.208 73.0653 155.594 67.2098L158.658 59.6835C156.272 65.5391 166.443 75.217 181.375 81.3031Z", fill: "#D8EFF4", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M185.032 82.6694C187.186 83.4191 189.294 84.0389 191.339 84.5366L188.275 92.0629C186.23 91.5652 184.122 90.9454 181.968 90.1957L185.032 82.6694Z", fill: "#96DAF4" }), jsx("path", { d: "M194.301 85.1776C199.418 86.1391 203.932 86.2438 207.256 85.4671L204.192 92.9934C200.868 93.762 196.353 93.6654 191.237 92.7038L194.301 85.1776Z", fill: "black" }), jsx("path", { d: "M181.375 81.3031C196.307 87.3891 210.345 87.5729 212.731 81.7174L209.667 89.2437C207.281 95.0992 193.243 94.9154 178.311 88.8293C163.379 82.7433 153.208 73.0653 155.594 67.2098L158.658 59.6835C156.272 65.5391 166.443 75.217 181.375 81.3031Z", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M331.022 121.427C326.722 126.062 313.654 120.93 301.833 109.965C290.012 99 283.915 86.3538 288.214 81.719C292.513 77.0841 305.581 82.2158 317.402 93.1808C329.223 104.146 335.321 116.792 331.022 121.427Z", fill: "#F191FA", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M317.436 93.1948C314.014 90.0206 310.494 87.3431 307.102 85.2426L304.325 112.168C315.446 121.604 327.043 125.752 331.044 121.441C335.347 116.803 329.25 104.162 317.425 93.1905L317.436 93.1948Z", fill: "black" }), jsx("path", { d: "M301.861 109.987C290.039 99.0235 283.942 86.3817 288.244 81.7437L282.716 87.7004C278.413 92.3385 284.51 104.98 296.332 115.944C308.154 126.907 321.22 132.035 325.526 127.404L331.054 121.447C326.752 126.085 313.683 120.951 301.861 109.987Z", fill: "#D8EFF4", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M299.075 107.258C297.49 105.627 296.034 103.969 294.725 102.327L289.197 108.284C290.506 109.926 291.959 111.577 293.546 113.215L299.075 107.258Z", fill: "#F191FA" }), jsx("path", { d: "M292.885 99.9066C289.854 95.6761 287.853 91.6272 287.147 88.2883L281.619 94.2451C282.324 97.584 284.318 101.636 287.357 105.863L292.885 99.9066Z", fill: "black" }), jsx("path", { d: "M301.861 109.987C290.039 99.0235 283.942 86.3817 288.244 81.7437L282.716 87.7004C278.413 92.3385 284.51 104.98 296.332 115.944C308.154 126.907 321.22 132.035 325.526 127.404L331.054 121.447C326.752 126.085 313.683 120.951 301.861 109.987Z", stroke: "black", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("defs", { children: jsxs("linearGradient", { id: "paint0_linear_4525_125520", x1: "191", y1: "124.403", x2: "247.716", y2: "304.676", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "#AD48BA" }), jsx("stop", { offset: "0.65625", stopColor: "#D178FF", stopOpacity: "0.24" })] }) })] }) }) }));
}

function CoinInfo() {
    const { t } = useTranslation();
    const { connectLoaderState: { provider } } = reactExports.useContext(ConnectLoaderContext);
    const isPassport = isPassportProvider(provider);
    const { page } = useAnalytics();
    reactExports.useEffect(() => {
        page({
            userJourney: UserJourney.WALLET,
            screen: 'CoinInfo',
        });
    }, []);
    return (jsxs(SimpleLayout, { testId: "coin-info", header: jsx(HeaderNavigation, { showBack: true, transparent: true }), footer: jsx(FooterLogo, {}), heroContent: jsx(IMXCoinsHero, {}), floatHeader: true, children: [!isPassport && (jsx(SimpleTextBody, { heading: t('views.COIN_INFO.metamask.heading'), children: t('views.COIN_INFO.metamask.body') })), isPassport && (jsxs(SimpleTextBody, { heading: t('views.COIN_INFO.passport.heading'), children: [t('views.COIN_INFO.passport.body1'), jsx(Link, { onClick: () => window.open(FAQS_LINK), children: t('views.COIN_INFO.passport.linkText') }), t('views.COIN_INFO.passport.body2')] }))] }));
}

const REFRESH_BALANCE_INTERVAL_MS = 30000; // 30 seconds -- keep app less chatty
const useBalance = ({ checkout, provider, refreshCallback, errorCallback, }) => {
    const [balancesLoading, setBalancesLoading] = reactExports.useState(true);
    const refreshBalances = reactExports.useCallback(async (
    // If silent is true, the balances will not be set to loading
    silent = false) => {
        if (!checkout || !provider)
            return;
        try {
            const network = await checkout.getNetworkInfo({
                provider,
            });
            /* If the provider's network is not supported, return out of this and let the
            connect loader handle the switch network functionality */
            if (!network.isSupported) {
                return;
            }
            if (!silent) {
                setBalancesLoading(true);
            }
            const balances = await getTokenBalances(checkout, provider, network.chainId);
            if (!silent) {
                setBalancesLoading(false);
            }
            refreshCallback(balances);
            // Ignore errors given that this is a background refresh
            // and the logic will retry anyways.
        }
        catch (error) {
            if (DEFAULT_BALANCE_RETRY_POLICY.nonRetryable(error)) {
                errorCallback(error);
            }
            if (!silent) {
                setBalancesLoading(false);
            }
        }
    }, [checkout, provider]);
    useInterval(() => refreshBalances(true), REFRESH_BALANCE_INTERVAL_MS);
    return {
        balancesLoading,
        refreshBalances,
    };
};

function WalletWidget(props) {
    const { t } = useTranslation();
    const errorActionText = t('views.ERROR_VIEW.actionText');
    const loadingText = t('views.LOADING_VIEW.text');
    const { eventTargetState: { eventTarget }, } = reactExports.useContext(EventTargetContext);
    const { config: { environment, isOnRampEnabled, isSwapEnabled, isBridgeEnabled, theme, }, walletConfig: { showDisconnectButton, showNetworkMenu, }, } = props;
    const { connectLoaderState: { checkout, provider }, } = reactExports.useContext(ConnectLoaderContext);
    const [viewState, viewDispatch] = reactExports.useReducer(viewReducer, {
        ...initialViewState,
        history: [],
    });
    const [walletState, walletDispatch] = reactExports.useReducer(walletReducer, { ...initialWalletState, walletConfig: { showDisconnectButton, showNetworkMenu } });
    const walletReducerValues = reactExports.useMemo(() => ({ walletState, walletDispatch }), [walletState, walletDispatch]);
    const viewReducerValues = reactExports.useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);
    const { balancesLoading, refreshBalances } = useBalance({
        checkout,
        provider,
        refreshCallback: (balances) => {
            walletDispatch({
                payload: {
                    type: WalletActions.SET_TOKEN_BALANCES,
                    tokenBalances: balances,
                },
            });
        },
        errorCallback: (error) => {
            // eslint-disable-next-line no-console
            console.error(error);
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: SharedViews.ERROR_VIEW,
                        error: new Error('Unable to fetch balances'),
                    },
                },
            });
        },
    });
    /* Set Config into WalletState */
    reactExports.useEffect(() => {
        (async () => {
            if (!checkout)
                return;
            let checkSwapAvailable;
            try {
                checkSwapAvailable = await checkout.isSwapAvailable();
            }
            catch (err) {
                checkSwapAvailable = false;
            }
            walletDispatch({
                payload: {
                    type: WalletActions.SET_SUPPORTED_TOP_UPS,
                    supportedTopUps: {
                        isBridgeEnabled,
                        isSwapEnabled,
                        isOnRampEnabled,
                        isSwapAvailable: checkSwapAvailable,
                    },
                },
            });
        })();
    }, [isBridgeEnabled, isSwapEnabled, isOnRampEnabled, environment]);
    const initialiseWallet = async () => {
        if (!checkout || !provider)
            return;
        try {
            const network = await checkout.getNetworkInfo({
                provider,
            });
            /* If the provider's network is not supported, return out of this and let the
            connect loader handle the switch network functionality */
            if (!network.isSupported) {
                return;
            }
            /** Fetch the user's balances based on their connected provider and correct network */
            refreshBalances();
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: { type: WalletWidgetViews.WALLET_BALANCES },
                },
            });
            walletDispatch({
                payload: {
                    type: WalletActions.SET_NETWORK,
                    network,
                },
            });
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: SharedViews.ERROR_VIEW,
                        error,
                    },
                },
            });
        }
    };
    reactExports.useEffect(() => {
        if (!checkout || !provider)
            return;
        initialiseWallet();
    }, [checkout, provider]);
    const errorAction = async () => {
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: { type: WalletWidgetViews.WALLET_BALANCES },
            },
        });
        await initialiseWallet();
    };
    return (jsx(ViewContext.Provider, { value: viewReducerValues, children: jsx(CryptoFiatProvider, { environment: environment, children: jsxs(WalletContext.Provider, { value: walletReducerValues, children: [viewState.view.type === SharedViews.LOADING_VIEW && (jsx(LoadingView, { loadingText: loadingText })), viewState.view.type === WalletWidgetViews.WALLET_BALANCES && (jsx(WalletBalances, { balancesLoading: balancesLoading, theme: theme, showNetworkMenu: showNetworkMenu })), viewState.view.type === WalletWidgetViews.SETTINGS
                        && (jsx(Settings, { showDisconnectButton: showDisconnectButton })), viewState.view.type === WalletWidgetViews.COIN_INFO && (jsx(CoinInfo, {})), viewState.view.type === SharedViews.ERROR_VIEW && (jsx(ErrorView, { actionText: errorActionText, onActionClick: errorAction, onCloseClick: () => sendWalletWidgetCloseEvent(eventTarget) })), viewState.view.type === SharedViews.TOP_UP_VIEW && (jsx(TopUpView, { analytics: { userJourney: UserJourney.WALLET }, widgetEvent: IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, checkout: checkout, provider: provider, showOnrampOption: isOnRampEnabled, showSwapOption: isSwapEnabled, showBridgeOption: isBridgeEnabled, onCloseButtonClick: () => sendWalletWidgetCloseEvent(eventTarget) }))] }) }) }));
}

export { WalletWidget as default };
