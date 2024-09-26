import { cC as hFlex, j as jsx, a_ as motion, _ as _objectWithoutProperties, w as useTheme, r as reactExports, cD as _slicedToArray, cE as useGetSubcomponentChild, y as merge, o as jsxs, cF as BaseClickable, v as ButtCon, F as SmartClone, cG as AnimatePresence, G as Box, b3 as Stack, M as ClassNames, T as _defineProperty, cH as getTertiaryButtonStyles, z as flattenChildren, A as isChildSubcomponent, b5 as Divider, l as useTranslation, bk as getRemoteImage, a3 as Environment, ci as getChainNameById, i as getL1ChainId, aw as isWalletConnectProvider, ck as isMetaMaskProvider, bp as CloudImage, as as Heading, Y as Body, N as Button, an as FooterLogo, at as Drawer, a4 as MenuItem, cI as Select, cJ as FormControlWrapper, bj as WidgetTheme, cK as PriceDisplay, aV as Fragment, a5 as tokenValueFormat, a0 as formatZeroAmount, c4 as ShimmerBox, cL as DuoCon, ax as heroBackGroundStyles, ay as heroImageStyles, az as heroImageBottomAlign, bt as NATIVE, ai as getTokenImageByAddress, a9 as isNativeToken, ag as DEFAULT_BALANCE_RETRY_POLICY } from './index-Ae2juTF3.js';
import { T as TokenImage, r as retry } from './retry-CDK--oGi.js';

function ownKeys$3(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$3(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$3(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$3(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var getContainerSx = function getContainerSx(theme) {
  var smallButtConStyles = getTertiaryButtonStyles("small", theme, false);
  return {
    brad: "base.borderRadius.x4",
    overflow: "hidden",
    transitionProperty: "background-color",
    transitionDuration: "base.motion.normal.fast.cssDuration",
    transitionTimingFunction: "base.motion.normal.fast.cssEase",
    "&.emphasized": {
      bgc: "base.color.translucent.emphasis.100"
    },
    "&.expanded": {
      bgc: "base.color.translucent.emphasis.100"
    },
    "&.emphasized.expanded": {
      bgc: "base.color.translucent.emphasis.200"
    },
    "&:hover": {
      bgc: "base.color.translucent.emphasis.200"
    },
    "&.emphasized:hover": {
      bgc: "base.color.translucent.emphasis.300"
    },
    "&:hover .ButtCon": _objectSpread$3({}, smallButtConStyles["&:hover:not([disabled])"])
  };
};
var clickableAreaSx = _objectSpread$3(_objectSpread$3({}, hFlex), {}, {
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "base.spacing.x4",
  position: "relative",
  px: "base.spacing.x3",
  py: "base.spacing.x4",
  minh: "base.spacing.x16"
});
var buttConSx = {
  position: "absolute",
  top: "base.spacing.x4"
};
var expandableAreaSx = {
  overflow: "visible",
  bg: "transparent",
  maxh: "unset",
  boxShadow: "unset",
  brad: "unset",
  p: "0"
};
var expandedContentContainer = {
  mb: "base.spacing.x10",
  px: "base.spacing.x3",
  "& .Divider:first-of-type": {
    mb: "base.spacing.x4"
  }
};

var _excluded$2 = ["children", "className", "sx", "chevronSide"];
function ownKeys$2(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$2(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$2(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$2(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function AccordionExpandedContent(_ref) {
  var children = _ref.children,
    className = _ref.className,
    _ref$sx = _ref.sx,
    sx = _ref$sx === void 0 ? {} : _ref$sx,
    _ref$chevronSide = _ref.chevronSide,
    chevronSide = _ref$chevronSide === void 0 ? "left" : _ref$chevronSide,
    props = _objectWithoutProperties(_ref, _excluded$2);
  var flattenedChildren = reactExports.useMemo(function () {
    return flattenChildren(children);
  }, [children]);
  return jsx(Stack, _objectSpread$2(_objectSpread$2({}, props), {}, {
    className: "".concat(className !== null && className !== void 0 ? className : "", " AccordionExpandedContent"),
    sx: merge(expandedContentContainer, _objectSpread$2({}, chevronSide === "left" ? {
      pl: "base.spacing.x15"
    } : {
      pr: "base.spacing.x15"
    }), sx),
    children: reactExports.Children.map(flattenedChildren, function (child) {
      if ( /*#__PURE__*/reactExports.isValidElement(child) && isChildSubcomponent(child, Divider)) {
        return jsx(SmartClone, {
          size: "xSmall",
          children: child
        });
      }
      return child;
    })
  }));
}
AccordionExpandedContent.displayName = "Accordion.ExpandedContent";

var _excluded$1 = ["children", "direction", "gap", "rc"],
  _excluded2 = ["sx", "alignItems", "className"],
  _excluded3 = ["alignItems", "className", "sx"];
function ownKeys$1(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$1(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$1(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function AccordionTargetSlot(_ref) {
  var children = _ref.children,
    _ref$direction = _ref.direction,
    direction = _ref$direction === void 0 ? "column" : _ref$direction,
    _ref$gap = _ref.gap,
    gap = _ref$gap === void 0 ? "0px" : _ref$gap,
    _ref$rc = _ref.rc,
    rc = _ref$rc === void 0 ? jsx("span", {}) : _ref$rc,
    props = _objectWithoutProperties(_ref, _excluded$1);
  return jsx(Stack, _objectSpread$1(_objectSpread$1({}, props), {}, {
    direction: direction,
    gap: gap,
    rc: rc,
    children: children
  }));
}
function AccordionTargetLeftSlot(_ref2) {
  var _ref2$sx = _ref2.sx,
    sx = _ref2$sx === void 0 ? {} : _ref2$sx,
    _ref2$alignItems = _ref2.alignItems,
    alignItems = _ref2$alignItems === void 0 ? "flex-start" : _ref2$alignItems,
    className = _ref2.className,
    props = _objectWithoutProperties(_ref2, _excluded2);
  return jsx(AccordionTargetSlot, _objectSpread$1(_objectSpread$1({}, props), {}, {
    alignItems: alignItems,
    sx: merge({
      flex: 1,
      textAlign: "left"
    }, sx),
    className: "".concat(className !== null && className !== void 0 ? className : "", " AccordionTargetLeftSlot")
  }));
}
function AccordionTargetRightSlot(_ref3) {
  var _ref3$alignItems = _ref3.alignItems,
    alignItems = _ref3$alignItems === void 0 ? "flex-end" : _ref3$alignItems,
    className = _ref3.className,
    _ref3$sx = _ref3.sx,
    sx = _ref3$sx === void 0 ? {} : _ref3$sx,
    props = _objectWithoutProperties(_ref3, _excluded3);
  return jsx(AccordionTargetSlot, _objectSpread$1(_objectSpread$1({}, props), {}, {
    alignItems: alignItems,
    sx: merge({
      textAlign: "right"
    }, sx),
    className: "".concat(className !== null && className !== void 0 ? className : "", " AccordionTargetRightSlot")
  }));
}
AccordionTargetLeftSlot.displayName = "Accordion.TargetLeftSlot";
AccordionTargetRightSlot.displayName = "Accordion.TargetRightSlot";

var _excluded = ["emphasized", "expanded", "defaultExpanded", "children", "gap", "alignItems", "className", "onExpandChange", "chevronSide", "sx", "rc", "targetClickOveride", "testId"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function Accordion(props) {
  var _ref = "expanded" in props ? _objectSpread(_objectSpread({}, props), {}, {
      defaultExpanded: undefined
    }) : _objectSpread(_objectSpread({}, props), {}, {
      expanded: undefined
    }),
    emphasized = _ref.emphasized,
    expanded = _ref.expanded,
    defaultExpanded = _ref.defaultExpanded,
    children = _ref.children,
    _ref$gap = _ref.gap,
    gap = _ref$gap === void 0 ? "0" : _ref$gap,
    _ref$alignItems = _ref.alignItems,
    alignItems = _ref$alignItems === void 0 ? "stretch" : _ref$alignItems,
    className = _ref.className,
    onExpandChange = _ref.onExpandChange,
    _ref$chevronSide = _ref.chevronSide,
    chevronSide = _ref$chevronSide === void 0 ? "left" : _ref$chevronSide,
    _ref$sx = _ref.sx,
    sx = _ref$sx === void 0 ? {} : _ref$sx,
    _ref$rc = _ref.rc,
    rc = _ref$rc === void 0 ? jsx(motion.div, {}) : _ref$rc,
    targetClickOveride = _ref.targetClickOveride,
    _ref$testId = _ref.testId,
    testId = _ref$testId === void 0 ? "Accordion" : _ref$testId,
    otherProps = _objectWithoutProperties(_ref, _excluded);
  var theme = useTheme();
  var base = theme.base;
  var _useState = reactExports.useState(defaultExpanded),
    _useState2 = _slicedToArray(_useState, 2),
    uncontrolledExpanded = _useState2[0],
    setUncontrolledExpanded = _useState2[1];
  var expandedValueToUse = expanded !== null && expanded !== void 0 ? expanded : uncontrolledExpanded;
  var targetLeft = useGetSubcomponentChild(children, AccordionTargetLeftSlot);
  var targetRight = useGetSubcomponentChild(children, AccordionTargetRightSlot);
  var expandedContent = useGetSubcomponentChild(children, AccordionExpandedContent);
  var handleToggle = reactExports.useCallback(function () {
    if (typeof expanded === "undefined") {
      setUncontrolledExpanded(function (old) {
        onExpandChange === null || onExpandChange === void 0 ? void 0 : onExpandChange(!old);
        return !old;
      });
    } else {
      onExpandChange === null || onExpandChange === void 0 ? void 0 : onExpandChange(!expanded);
    }
  }, [expanded, onExpandChange]);
  var mergedSx = reactExports.useMemo(function () {
    var _theme$components$Acc, _theme$components;
    return merge(getContainerSx(theme), (_theme$components$Acc = (_theme$components = theme.components) === null || _theme$components === void 0 || (_theme$components = _theme$components.Accordion) === null || _theme$components === void 0 ? void 0 : _theme$components.sxOverride) !== null && _theme$components$Acc !== void 0 ? _theme$components$Acc : {}, sx);
  }, [sx, theme]);
  return jsx(ClassNames, {
    children: function children(_ref2) {
      var cx = _ref2.cx;
      return jsxs(Stack, _objectSpread(_objectSpread({}, otherProps), {}, {
        className: "".concat(className !== null && className !== void 0 ? className : "", " Accordion ").concat(cx({
          emphasized: emphasized,
          expanded: expandedValueToUse
        })),
        gap: gap,
        alignItems: alignItems,
        rc: rc,
        sx: mergedSx,
        testId: testId,
        children: [jsxs(BaseClickable, {
          sx: merge(clickableAreaSx, _objectSpread({}, chevronSide === "left" ? {
            pl: "base.spacing.x15"
          } : {
            pr: "base.spacing.x15"
          })),
          onClick: targetClickOveride || handleToggle,
          testId: "".concat(testId, "__clickableArea"),
          children: [jsx(ButtCon, {
            rc: jsx("span", {}),
            icon: expandedValueToUse ? "ChevronCollapse" : "ChevronExpand",
            variant: "tertiary",
            size: "small",
            testId: "".concat(testId, "__clickableArea__chevron"),
            sx: merge(buttConSx, _objectSpread({}, chevronSide === "left" ? {
              left: "base.spacing.x3"
            } : {
              right: "base.spacing.x3"
            })),
            className: "Accordion__ButtCon"
          }), jsx(SmartClone, {
            testId: "".concat(testId, "__clickableArea__targetLeft"),
            children: targetLeft
          }), targetRight && jsx(SmartClone, {
            testId: "".concat(testId, "__clickableArea__targetRight"),
            children: targetRight
          })]
        }), jsx(AnimatePresence, {
          children: Boolean(expandedContent) && expandedValueToUse ? jsx(Box, {
            sx: expandableAreaSx,
            rc: jsx(motion.div, {
              initial: {
                opacity: 0,
                height: 0,
                overflow: "hidden",
                y: -16
              },
              animate: {
                height: "auto",
                opacity: 1,
                y: 0,
                transitionEnd: {
                  overflow: "visible"
                }
              },
              exit: {
                height: 0,
                opacity: 0,
                overflow: "hidden",
                y: -16
              },
              transition: {
                duration: base.motion.normal.fast.jsDuration,
                ease: base.motion.normal.fast.jsEase
              }
            }),
            children: jsx(SmartClone, {
              chevronSide: chevronSide,
              testId: "".concat(testId, "__expandedContent"),
              children: expandedContent
            })
          }) : null
        })]
      }));
    }
  });
}
Accordion.displayName = "Accordion";
Accordion.TargetLeftSlot = AccordionTargetLeftSlot;
Accordion.TargetRightSlot = AccordionTargetRightSlot;
Accordion.ExpandedContent = AccordionExpandedContent;

function NetworkSwitchDrawer({ visible, targetChainId, provider, checkout, onCloseDrawer, onNetworkSwitch, }) {
    const { t } = useTranslation();
    const ethImageUrl = getRemoteImage(checkout.config.environment ?? Environment.PRODUCTION, '/switchnetworkethereum.svg');
    const zkevmImageUrl = getRemoteImage(checkout.config.environment ?? Environment.PRODUCTION, '/switchnetworkzkevm.svg');
    const targetChainName = getChainNameById(targetChainId);
    const showEthImage = targetChainId === getL1ChainId(checkout.config);
    const handleSwitchNetwork = reactExports.useCallback(async () => {
        if (!checkout)
            return;
        const switchNetworkResult = await checkout.switchNetwork({
            provider,
            chainId: targetChainId,
        });
        if (onNetworkSwitch) {
            onNetworkSwitch(switchNetworkResult.provider);
        }
    }, [checkout, provider, onNetworkSwitch, targetChainId]);
    const isWalletConnect = isWalletConnectProvider(provider);
    const walletConnectPeerName = reactExports.useMemo(() => {
        if (!isWalletConnect)
            return '';
        return provider.provider?.session?.peer?.metadata?.name;
    }, [provider, isWalletConnect]);
    const isMetaMaskMobileWalletPeer = reactExports.useMemo(() => walletConnectPeerName?.toLowerCase().includes('metamask'), [walletConnectPeerName]);
    const walletDisplayName = reactExports.useMemo(() => {
        if (isMetaMaskProvider(provider))
            return 'MetaMask wallet';
        if (isWalletConnect && walletConnectPeerName)
            return walletConnectPeerName;
        return 'wallet';
    }, [provider, isWalletConnect, walletConnectPeerName]);
    const requireManualSwitch = isWalletConnect && isMetaMaskMobileWalletPeer;
    // Image preloading - load images into browser when component mounts
    // show cached images when drawer is made visible
    reactExports.useEffect(() => {
        const switchNetworkEthImage = new Image();
        switchNetworkEthImage.src = ethImageUrl;
        const switchNetworkzkEVMImage = new Image();
        switchNetworkzkEVMImage.src = zkevmImageUrl;
    }, []);
    return (jsx(Drawer, { size: "threeQuarter", visible: visible, onCloseDrawer: onCloseDrawer, showHeaderBar: false, children: jsxs(Drawer.Content, { sx: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
            }, children: [jsx(CloudImage, { use: (jsx("img", { src: showEthImage ? ethImageUrl : zkevmImageUrl, alt: t('drawers.networkSwitch.heading', {
                            wallet: walletDisplayName,
                        }) })) }), jsx(ButtCon, { icon: "Close", variant: "tertiary", sx: {
                        pos: 'absolute',
                        top: 'base.spacing.x5',
                        left: 'base.spacing.x5',
                        backdropFilter: 'blur(30px)',
                    }, onClick: onCloseDrawer }), jsxs(Box, { sx: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'base.spacing.x4',
                        paddingX: 'base.spacing.x6',
                    }, children: [jsx(Heading, { size: "small", weight: "bold", sx: { textAlign: 'center', paddingX: 'base.spacing.x6' }, children: t('drawers.networkSwitch.heading', {
                                wallet: walletDisplayName,
                            }) }), requireManualSwitch && (jsx(Body, { size: "medium", weight: "regular", sx: {
                                color: 'base.color.text.body.secondary',
                                textAlign: 'center',
                                paddingX: 'base.spacing.x6',
                            }, children: t('drawers.networkSwitch.manualSwitch.body', {
                                chain: targetChainName,
                            }) })), !requireManualSwitch && (jsx(Body, { size: "medium", weight: "regular", sx: {
                                color: 'base.color.text.body.secondary',
                                textAlign: 'center',
                                paddingX: 'base.spacing.x6',
                            }, children: t('drawers.networkSwitch.controlledSwitch.body', {
                                chain: targetChainName,
                            }) }))] }), jsxs(Box, { sx: {
                        display: 'flex',
                        flexDirection: 'column',
                        paddingX: 'base.spacing.x4',
                        width: '100%',
                    }, children: [!requireManualSwitch && (jsx(Button, { size: "large", variant: "primary", sx: { width: '100%', marginBottom: 'base.spacing.x2' }, onClick: handleSwitchNetwork, children: t('drawers.networkSwitch.switchButton', {
                                chain: targetChainName,
                            }) })), jsx(FooterLogo, {})] })] }) }));
}

function CoinSelectorOption({ onClick, icon, name, symbol, balance, defaultTokenImage, testId, id, }) {
    const { t } = useTranslation();
    return (jsxs(MenuItem, { testId: `${testId}-coin-selector__option-${id}`, emphasized: true, size: "small", onClick: onClick, children: [jsx(MenuItem.FramedImage, { circularFrame: true, use: (jsx(TokenImage, { src: icon, name: name, defaultImage: defaultTokenImage })) }), jsx(MenuItem.Label, { children: name }), jsx(MenuItem.Caption, { children: symbol }), balance && (jsx(MenuItem.PriceDisplay, { fiatAmount: `${t('drawers.coinSelector.option.fiatPricePrefix')}${balance.formattedFiatAmount}`, price: balance.formattedAmount }))] }));
}

const selectOptionsContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingX: 'base.spacing.x4',
    paddingBottom: 'base.spacing.x4',
};
const selectOptionsLoadingIconStyles = {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 'base.spacing.x2',
};

function CoinSelector({ heading, options, defaultTokenImage, optionsLoading, children, onCloseDrawer, visible, }) {
    const { t } = useTranslation();
    return (jsxs(Drawer, { headerBarTitle: heading, size: "full", onCloseDrawer: onCloseDrawer, visible: visible, children: [jsx(Drawer.Target, { children: children }), jsx(Drawer.Content, { children: jsxs(Box, { sx: selectOptionsContainerStyles, children: [optionsLoading && options.length === 0 && (jsxs(Box, { sx: selectOptionsLoadingIconStyles, children: [jsx(MenuItem, { shimmer: true, emphasized: true, testId: "balance-item-shimmer--1" }), jsx(MenuItem, { shimmer: true, emphasized: true, testId: "balance-item-shimmer--2" }), jsx(MenuItem, { shimmer: true, emphasized: true, testId: "balance-item-shimmer--3" })] })), !optionsLoading && options.length === 0 && (jsx(Body, { sx: { padding: 'base.spacing.x4' }, children: t('drawers.coinSelector.noCoins') })), !optionsLoading && options.map(({ onClick, icon, name, symbol, balance, id, testId, }) => (jsx(CoinSelectorOption, { id: id, testId: testId, onClick: onClick, icon: icon, name: name, symbol: symbol, balance: balance, defaultTokenImage: defaultTokenImage }, `${symbol}-${name}`)))] }) })] }));
}

function SelectForm({ testId, options, optionsLoading, subtext, onSelectChange, textAlign, errorMessage, disabled, selectedOption, coinSelectorHeading, defaultTokenImage, environment = Environment.PRODUCTION, theme = WidgetTheme.DARK, }) {
    const [coinSelectorOpen, setCoinSelectorOpen] = reactExports.useState(false);
    const coinSelectorOptions = reactExports.useMemo(() => options.map((option) => ({
        ...option,
        testId,
        onClick: () => {
            onSelectChange(option.id);
            setCoinSelectorOpen(false);
        },
    })), [options, onSelectChange, setCoinSelectorOpen]);
    const getSelectedOption = () => {
        if (!selectedOption)
            return undefined;
        if (options.length === 0)
            return undefined;
        if (!options.find((o) => o.id === selectedOption))
            return undefined;
        return selectedOption;
    };
    const filteredOption = options?.find((o) => o.id === selectedOption) ?? selectedOption;
    return (jsxs(Box, { children: [jsx(CoinSelector, { heading: coinSelectorHeading, options: coinSelectorOptions, defaultTokenImage: defaultTokenImage, optionsLoading: optionsLoading ?? false, visible: coinSelectorOpen, onCloseDrawer: () => setCoinSelectorOpen(false) }), jsx(FormControlWrapper, { testId: `${testId}-select-control`, textAlign: textAlign ?? 'left', subtext: errorMessage ? undefined : subtext, isErrored: !!errorMessage, errorMessage: errorMessage, children: jsx(Select, { testId: `${testId}-select`, size: "large", defaultLabel: "Select token", targetClickOveride: () => setCoinSelectorOpen(true), selectedOption: getSelectedOption(), sx: { minw: '170px' }, children: filteredOption && (jsxs(Select.Option, { optionKey: filteredOption.id, testId: filteredOption.testId, 
                        // select cannot currently be disabled so disabling at the option level for now
                        disabled: disabled, children: [!filteredOption.icon && (jsx(Select.Option.Icon, { icon: "Coins", variant: "bold" })), filteredOption.icon && (jsx(Select.Option.FramedImage, { use: (jsx(TokenImage, { environment: environment, theme: theme, src: filteredOption.icon, name: filteredOption.name })), circularFrame: true, sx: { background: 'base.color.translucent.standard.100' } })), jsx(Select.Option.Label, { children: filteredOption.symbol })] }, filteredOption.id)) }) })] }));
}

const feesBreakdownContentStyles = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '16px 16px 0 16px',
};
const feeItemContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    height: '100%',
};
const feeItemStyles = { display: 'flex', width: '100%' };
const feeItemLabelStyles = (boldLabel) => ({
    width: '65%',
    color: boldLabel ? 'base.color.text.body.primary' : 'base.color.text.body.secondary',
});
const feeItemPriceDisplayStyles = {
    width: '35%',
};
const feeItemLoadingStyles = {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 'base.spacing.x2',
};

function FeeItem({ boldLabel, label, amount, fiatAmount, tokenSymbol, prefix = '', }) {
    const key = label.toLowerCase().replace(' ', '-');
    return (jsxs(Box, { sx: feeItemStyles, testId: `fee-item-${key}`, children: [jsx(Body, { sx: feeItemLabelStyles(boldLabel), children: label }), jsx(PriceDisplay, { testId: key, sx: feeItemPriceDisplayStyles, price: `${prefix}${tokenSymbol} ${amount}`, fiatAmount: fiatAmount })] }));
}

function FeesBreakdown({ fees, children, visible, onCloseDrawer, totalFiatAmount, totalAmount, tokenSymbol, loading = false, }) {
    const { t } = useTranslation();
    return (jsxs(Drawer, { headerBarTitle: t('drawers.feesBreakdown.heading'), size: "threeQuarter", onCloseDrawer: onCloseDrawer, visible: visible, children: [jsx(Drawer.Target, { children: children }), jsxs(Drawer.Content, { testId: "fees-breakdown-content", sx: feesBreakdownContentStyles, children: [jsxs(Box, { sx: feeItemContainerStyles, children: [loading && (jsxs(Box, { sx: feeItemLoadingStyles, children: [jsx(MenuItem, { shimmer: true, emphasized: true, testId: "balance-item-shimmer--1" }), jsx(MenuItem, { shimmer: true, emphasized: true, testId: "balance-item-shimmer--2" })] })), !loading && fees.map(({ label, amount, fiatAmount, prefix, token, }) => (jsx(FeeItem, { label: label, amount: amount, fiatAmount: fiatAmount, tokenSymbol: token.symbol ?? tokenSymbol, prefix: prefix }, label))), totalAmount && (jsxs(Fragment, { children: [jsx(Divider, { size: "xSmall" }), jsx(FeeItem, { label: t('drawers.feesBreakdown.total'), amount: tokenValueFormat(totalAmount), fiatAmount: totalFiatAmount
                                            ? `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${totalFiatAmount}`
                                            : formatZeroAmount('0'), tokenSymbol: tokenSymbol, boldLabel: true }, t('drawers.feesBreakdown.total'))] }))] }), jsx(FooterLogo, {})] })] }));
}

const gasAmountAccordionStyles = {
    backgroundColor: 'base.color.translucent.emphasis.100',
};
const gasAmountHeadingStyles = {
    marginBottom: 'base.spacing.x4',
    color: 'base.color.text.body.secondary',
};

function Fees({ gasFeeValue, gasFeeToken, gasFeeFiatValue, fees, onFeesClick, loading, sx, }) {
    const [showFeeBreakdown, setShowFeeBreakdown] = reactExports.useState(false);
    const { t } = useTranslation();
    if (!gasFeeValue && !loading)
        return null;
    const gasFee = formatZeroAmount(tokenValueFormat(gasFeeValue));
    const gasTokenSymbol = gasFeeToken?.symbol;
    const viewFees = () => {
        setShowFeeBreakdown(true);
        onFeesClick?.();
    };
    return (jsxs(Fragment, { children: [jsxs(Accordion, { targetClickOveride: viewFees, sx: { ...gasAmountAccordionStyles, paddingBottom: 'base.spacing.x2', ...sx }, children: [jsx(Accordion.TargetLeftSlot, { children: jsx(Body, { size: "medium", sx: gasAmountHeadingStyles, children: t('drawers.feesBreakdown.heading') }) }), jsxs(Accordion.TargetRightSlot, { children: [loading && (jsx(Box, { sx: { width: '218px', position: 'relative' }, children: jsx(Box, { sx: {
                                        display: 'block',
                                        position: 'absolute',
                                        top: '-15px',
                                        width: '100%',
                                        height: '68px',
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        WebkitMaskPosition: 'right center',
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        WebkitMaskRepeat: 'no-repeat',
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        WebkitMaskSize: 'contain',
                                        // eslint-disable-next-line @typescript-eslint/naming-convention,max-len
                                        WebkitMaskImage: 'url(\'data:image/svg+xml;utf8, <svg xmlns="http://www.w3.org/2000/svg" width="196" height="96"><path d="M182.85 55.2Q181.65 54 180 54h-56q-1.7 0-2.85 1.2Q120 56.35 120 58v4q0 1.7 1.15 2.85Q122.3 66 124 66h56q1.65 0 2.85-1.15Q184 63.7 184 62v-4q0-1.65-1.15-2.8m0-22Q181.65 32 180 32H68q-1.7 0-2.85 1.2Q64 34.35 64 36v8q0 1.7 1.15 2.85Q66.3 48 68 48h112q1.65 0 2.85-1.15Q184 45.7 184 44v-8q0-1.65-1.15-2.8Z" id="a"/></svg>\')',
                                    }, rc: jsx("span", {}), children: jsx(ShimmerBox, { rc: jsx("span", {}) }) }) })), !loading && (jsx(PriceDisplay, { testId: "fees-gas-fee__priceDisplay", fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${gasFeeFiatValue}`, price: `~ ${gasTokenSymbol} ${formatZeroAmount(tokenValueFormat(gasFee))}` }))] })] }), jsx(FeesBreakdown, { tokenSymbol: gasTokenSymbol ?? '', fees: fees, visible: showFeeBreakdown, loading: loading, onCloseDrawer: () => setShowFeeBreakdown(false) })] }));
}

const transactionRejectedContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingY: '50px',
    paddingX: 'base.spacing.x4',
    height: '100%',
};
const contentTextStyles = {
    color: 'base.color.text.body.secondary',
    fontFamily: 'base.font.family.heading.secondary',
    textAlign: 'center',
    marginTop: '15px',
};
const actionButtonContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: '8px',
    height: '100%',
    width: '100%',
};
const actionButtonStyles = {
    width: '100%',
    height: '64px',
};

function TransactionRejected({ onCloseDrawer, visible, showHeaderBar, onRetry, }) {
    const { t } = useTranslation();
    return (jsx(Drawer, { headerBarTitle: undefined, size: "full", onCloseDrawer: onCloseDrawer, visible: visible, showHeaderBar: showHeaderBar, children: jsx(Drawer.Content, { children: jsxs(Box, { sx: transactionRejectedContainerStyles, children: [jsx(DuoCon, { icon: "Information", colorVariant: "guidance", iconVariant: "bold" }), jsxs(Heading, { size: "small", sx: contentTextStyles, testId: "transaction-rejected-heading", children: [t('drawers.transactionFailed.content.heading1'), jsx("br", {}), t('drawers.transactionFailed.content.heading2')] }), jsxs(Body, { sx: contentTextStyles, children: [t('drawers.transactionFailed.content.body1'), jsx("br", {}), t('drawers.transactionFailed.content.body2')] }), jsxs(Box, { sx: actionButtonContainerStyles, children: [jsx(Button, { sx: actionButtonStyles, variant: "tertiary", onClick: onRetry, children: t('drawers.transactionFailed.buttons.retry') }), jsx(Button, { sx: actionButtonStyles, variant: "tertiary", onClick: onCloseDrawer, testId: "transaction-rejected-cancel-button", children: t('drawers.transactionFailed.buttons.cancel') })] })] }) }) }));
}

function WalletApproveHero() {
    return (jsx(Box, { testId: "wallet-approve-hero", sx: { ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }, children: jsx(Box, { sx: { ...heroImageStyles, ...heroImageBottomAlign }, children: jsxs("svg", { width: "430", height: "305", viewBox: "0 0 430 305", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsx("path", { d: "M227.517 171.325L182.178 85.6034C181.033 83.4446 179.583 82.3652 178.156 82.3652C175.711 82.3652 174.322 84.1157 172.863 86.6218L137.285 164.056L183.689 253.776L227.522 171.32L227.517 171.325Z", fill: "black", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M226.841 137.597C228.497 133.997 228.338 128.188 226.484 124.682L197.866 70.5767C196.012 67.0757 193.14 67.1508 191.484 70.7503L164.936 128.427L168.399 134.936L165.396 141.464L168.85 147.992L171.853 141.464L175.307 147.992L172.304 154.52L168.85 147.992L165.846 154.52L169.3 161.048L166.287 167.562L187.922 208.465C189.776 211.966 192.648 211.891 194.304 208.292L226.845 137.597H226.841Z", fill: "#F191FA" }), jsx("path", { d: "M168.85 147.992L165.396 141.464L168.399 134.936L164.936 128.427L191.484 70.7503C193.14 67.1508 196.012 67.0757 197.866 70.5767L226.484 124.682C228.338 128.188 228.497 133.997 226.841 137.597H226.845L194.304 208.292C192.648 211.891 189.776 211.966 187.922 208.465L166.287 167.562L169.3 161.048L165.846 154.52L168.85 147.992ZM168.85 147.992L171.853 141.464L175.307 147.992L172.304 154.52L168.85 147.992Z", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M159.384 154.519L155.93 147.991L158.939 141.463L162.388 147.991L159.384 154.519Z", fill: "#F191FA" }), jsx("path", { d: "M203.136 132.773C202.484 134.19 201.353 134.223 200.621 132.843L196.101 124.297C195.369 122.917 195.308 120.627 195.961 119.21L200.621 109.082C201.273 107.665 202.404 107.632 203.136 109.012L207.656 117.558C208.388 118.938 208.449 121.228 207.796 122.645L203.136 132.773Z", fill: "#EBE9E9", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M206.22 114.837L204.68 118.183C204.174 119.286 203.291 119.309 202.724 118.234L199.345 111.852", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M197.542 127.015L199.058 123.716C199.565 122.613 200.447 122.589 201.015 123.664L204.394 130.046", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M293.369 250.453L252.263 172.733C249.936 168.331 243.957 164.731 238.982 164.731H173.769C171.516 164.731 169.306 164.14 167.358 163.014L162.876 160.423C160.929 159.297 158.718 158.706 156.466 158.706H147.896L141.237 164.534L189.659 256C190.612 257.493 192.452 258.417 194.939 258.417L287.456 258.445L291.473 260.904L293.904 255.733H293.895C294.556 254.315 294.449 252.471 293.379 250.448L293.369 250.453Z", fill: "#EBE9E9", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M232.923 169.903L235.354 164.731", stroke: "black", strokeWidth: "0.469297", strokeMiterlimit: "10" }), jsx("path", { d: "M249.832 177.908C247.505 173.506 241.526 169.907 236.551 169.907L142.025 169.878C139.355 169.878 137.436 168.813 136.549 167.128L186.313 261.185C187.266 262.677 189.105 263.602 191.592 263.602L286.118 263.63C291.098 263.63 293.266 260.03 290.938 255.633L249.832 177.913V177.908Z", fill: "#EBE9E9", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M255.328 198.77L245.041 179.313C243.581 176.548 240.235 174.042 237.161 174.042L143.555 173.93", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M188.64 259.548L282.448 259.558C285.569 259.558 286.418 257.577 285.198 255.264L276.103 238.064", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M150.238 159.776C150.965 161.151 149.539 163.338 147.051 164.652C144.564 165.966 141.96 165.919 141.227 164.539C140.495 163.159 141.927 160.977 144.414 159.663C145.62 159.025 146.854 158.71 147.891 158.71C148.99 158.71 149.863 159.067 150.238 159.776Z", fill: "#EBE9E9", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M147.826 161.052C148.164 161.69 147.502 162.704 146.348 163.314C145.193 163.924 143.983 163.9 143.645 163.262C143.307 162.624 143.969 161.61 145.123 161C145.681 160.705 146.254 160.559 146.737 160.559C147.249 160.559 147.652 160.723 147.826 161.057V161.052Z", fill: "black" }), jsx("path", { d: "M171.652 85.828L136.755 161.652C135.788 163.75 135.784 165.669 136.549 167.124C136.549 167.124 137.717 169.874 142.025 169.874C146.333 169.874 151.754 169.907 151.754 169.907L153.115 167.5L143.419 167.467C139.669 167.467 137.637 165.186 139.205 161.779L174.163 85.8233C175.223 83.5238 176.678 82.3646 178.156 82.3646C178.156 82.3646 173.431 81.961 171.652 85.8233V85.828Z", fill: "#EBE9E9", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M273.579 230.377L277.263 229.767L287.024 238.458L278.347 222.051L270.373 223.609L273.579 230.377Z", fill: "black" }), jsx("path", { d: "M274.968 235.918C272.495 231.239 272.777 228.33 278.296 226.565C281.262 225.617 283.951 224.073 286.255 221.98L291.328 217.371C295.725 213.378 297.049 205.813 294.275 200.561C291.497 195.31 285.626 194.282 281.233 198.276L275.071 203.874C272.983 205.775 270.327 206.939 267.516 207.206C261.79 207.746 259.392 206.456 256.769 201.495L255.399 206.127L271.073 235.923H274.973L274.968 235.918Z", fill: "#EBE9E9" }), jsx("path", { d: "M274.968 235.918C272.495 231.239 272.776 228.33 278.295 226.565C281.261 225.617 283.95 224.073 286.255 221.98L291.328 217.371C295.725 213.378 297.048 205.813 294.275 200.561C291.497 195.31 285.626 194.282 281.233 198.276L275.071 203.874C272.983 205.775 270.327 206.939 267.516 207.206C261.79 207.746 259.392 206.456 256.769 201.495", stroke: "black", strokeWidth: "0.469297", strokeMiterlimit: "10" }), jsx("path", { d: "M289.926 200.125C287.265 199.276 284.074 201.829 282.793 205.832C281.512 209.835 282.629 213.768 285.29 214.617L286.533 215.016L291.17 200.524L289.926 200.125Z", fill: "black", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M293.683 209.321C294.963 205.319 293.846 201.386 291.187 200.535C288.528 199.685 285.335 202.239 284.055 206.241C282.775 210.242 283.892 214.176 286.551 215.026C289.21 215.877 292.403 213.322 293.683 209.321Z", fill: "#EBE9E9", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M213.26 224.182C211.237 224.182 208.816 222.722 207.868 220.934L189.021 185.301C188.077 183.513 188.955 182.053 190.978 182.053L231.3 182.039C233.322 182.039 235.744 183.499 236.692 185.287L255.539 220.92C256.482 222.708 255.604 224.168 253.582 224.168L213.26 224.182Z", fill: "black", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M214.334 222.319C212.312 222.319 209.89 220.859 208.942 219.071L190.095 183.438C189.884 183.034 189.767 182.649 189.729 182.292C188.64 182.776 188.302 183.944 189.02 185.301L207.867 220.934C208.811 222.722 211.237 224.182 213.26 224.182L253.582 224.168C255.144 224.168 256.022 223.29 255.9 222.065C255.557 222.22 255.14 222.305 254.652 222.305L214.33 222.319H214.334Z", fill: "#EBE9E9", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M231.586 203.083L233.646 206.978H228.756H223.871H218.981H215.513C214.733 206.978 214.363 207.489 214.691 208.109L215.555 209.737C215.883 210.361 216.794 210.873 217.577 210.873H221.046H225.936L227.395 213.632C227.724 214.256 228.634 214.763 229.418 214.763H231.464C232.243 214.763 232.614 214.252 232.285 213.628L230.826 210.868H235.716H239.184C239.963 210.868 240.334 210.352 240.005 209.732L238.546 206.973L237.086 204.214C236.758 203.589 235.847 203.083 235.063 203.083H231.595H231.586Z", fill: "#F191FA" }), jsx("path", { d: "M214.855 199.191L216.315 201.951C216.648 202.575 217.554 203.086 218.342 203.086H221.81H226.696H231.586L230.126 200.322C229.793 199.698 228.887 199.187 228.099 199.187H224.631H219.746H214.855V199.191Z", fill: "#F191FA" }), jsx("path", { d: "M214.986 187.501C214.207 187.501 213.837 188.013 214.165 188.632L215.625 191.392H210.735H207.266C206.487 191.392 206.117 191.903 206.445 192.527L207.905 195.287L209.364 198.046C209.693 198.671 210.603 199.177 211.387 199.177H214.855L212.795 195.282H217.685H222.57H227.46H230.928C231.707 195.282 232.078 194.771 231.75 194.147L230.891 192.523C230.558 191.899 229.652 191.387 228.868 191.387H225.4H220.51L219.051 188.628C218.722 188.003 217.812 187.497 217.028 187.497H214.982L214.986 187.501Z", fill: "#F191FA" }), jsx("path", { d: "M214.098 243.795L212.428 240.641C211.78 239.412 210.109 238.412 208.725 238.412H202.849L200.428 233.832C199.78 232.602 198.114 231.603 196.725 231.603H191.751C191 231.603 190.483 231.898 190.263 232.363L189.066 234.906L191.464 235.826L192.835 238.417H186.959C186.208 238.417 185.692 238.712 185.471 239.177L184.275 241.721L186.612 242.528L187.288 243.804C187.935 245.034 189.606 246.033 190.99 246.033H196.866L199.287 250.614C199.935 251.843 201.601 252.843 202.99 252.843H205.032L208.256 254.631L209.452 252.087C209.635 251.693 209.607 251.177 209.307 250.614L206.885 246.033H210.194L213.057 247.817L214.253 245.273C214.441 244.879 214.408 244.363 214.108 243.8L214.098 243.795Z", fill: "black", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M212.902 246.339L211.231 243.185C210.584 241.956 208.913 240.956 207.529 240.956H201.653L199.231 236.376C198.584 235.151 196.918 234.146 195.529 234.146H190.554C189.165 234.146 188.564 235.151 189.212 236.38L191.634 240.961H185.758C184.369 240.961 183.763 241.97 184.416 243.195L186.086 246.348C186.734 247.578 188.405 248.577 189.789 248.577H195.665L198.086 253.158C198.734 254.387 200.4 255.387 201.789 255.387H206.764C208.153 255.387 208.753 254.383 208.106 253.153L205.684 248.573H211.56C212.949 248.573 213.554 247.564 212.902 246.339Z", fill: "black", stroke: "black", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M208.107 253.158L205.685 248.573", stroke: "#EBE9E9", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M191.634 240.96H185.758", stroke: "#EBE9E9", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M212.902 246.339L211.231 243.185C210.584 241.956 208.913 240.956 207.528 240.956H201.653L199.231 236.376C198.584 235.151 196.918 234.146 195.528 234.146H190.554", stroke: "#EBE9E9", strokeWidth: "0.469297", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M356.061 232.632L355.632 231L354 231.429L354.429 233.061L356.061 232.632Z", fill: "white" }), jsx("path", { d: "M57.6531 168.341L57.1006 166.24L54.9996 166.793L55.5521 168.894L57.6531 168.341Z", fill: "white" }), jsx("path", { d: "M103.489 244.345L101.345 244L101 246.145L103.144 246.49L103.489 244.345Z", fill: "white" }), jsx("path", { d: "M341.286 111.905L341.905 110.619L340.619 110L340 111.286L341.286 111.905Z", fill: "white" }), jsx("path", { d: "M323.144 179.08L322.592 176.979L320.491 177.531L321.043 179.632L323.144 179.08Z", fill: "white" }), jsx("path", { d: "M328.919 177.658L329.538 176.372L328.252 175.753L327.633 177.039L328.919 177.658Z", fill: "white" }), jsx("path", { d: "M88.1441 141.383L87.2188 140.296L86.1321 141.221L87.0574 142.308L88.1441 141.383Z", fill: "white" }), jsx("path", { d: "M258.286 89.9052L258.905 88.6191L257.619 88L257 89.2861L258.286 89.9052Z", fill: "white" })] }) }) }));
}

const getAllowedBalances = async ({ checkout, provider, allowTokenListType, chainId, allowZero = false, retryPolicy = DEFAULT_BALANCE_RETRY_POLICY, }) => {
    const currentChainId = chainId || (await checkout.getNetworkInfo({ provider })).chainId;
    const walletAddress = await provider.getSigner().getAddress();
    const tokenBalances = await retry(() => checkout.getAllBalances({
        provider,
        walletAddress,
        chainId: currentChainId,
    }), { ...retryPolicy });
    // Why is this needed?
    // getAllowedBalances has a retry logic, if the user changes network
    // the retry holds the ref to the old provider causing an error due
    // to the mismatch of chain id between what's held by the retry and
    // what's currently set in the latest provider.
    // Due to this error, the POLICY automatically returns undefined
    // and this is backfilled with an empty object making the application
    // believe that the wallet has no tokens.
    // This is now handled in the Bridge and Swap widget.
    if (tokenBalances === undefined)
        return undefined;
    const allowList = await checkout.getTokenAllowList({
        chainId: currentChainId,
        type: allowTokenListType,
    });
    const tokensAddresses = new Map();
    allowList.tokens.forEach((token) => tokensAddresses.set(token.address?.toLowerCase() || NATIVE, true));
    const allowedBalances = tokenBalances.balances
        .filter((balance) => {
        // Balance is <= 0 and it is not allow to have zeros
        if (balance.balance.lte(0) && !allowZero)
            return false;
        return tokensAddresses.get(balance.token.address?.toLowerCase() || NATIVE);
    })
        .map((balanceResult) => ({
        ...balanceResult,
        token: {
            ...balanceResult.token,
            icon: balanceResult.token.icon ?? getTokenImageByAddress(checkout.config.environment, isNativeToken(balanceResult.token.address)
                ? balanceResult.token.symbol
                : balanceResult.token.address ?? ''),
        },
    })) ?? [];
    // Map token icon assets to allowlist
    allowList.tokens = allowList.tokens.map((token) => ({
        ...token,
        icon: token.icon ?? getTokenImageByAddress(checkout.config.environment, isNativeToken(token.address) ? token.symbol : token.address ?? ''),
    }));
    return { allowList, allowedBalances };
};

export { Accordion as A, Fees as F, NetworkSwitchDrawer as N, SelectForm as S, TransactionRejected as T, WalletApproveHero as W, getAllowedBalances as g };
