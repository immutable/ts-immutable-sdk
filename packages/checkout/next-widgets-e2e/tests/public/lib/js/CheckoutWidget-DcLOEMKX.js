import { r as reactExports, u as useConnectLoaderState, j as jsx, I as IMTBLWidgetEvents, C as CheckoutFlowType, P as ProviderEventType, a as CheckoutEventType, b as ConnectEventType, c as CheckoutFailureEventType, d as CheckoutSuccessEventType, W as WalletEventType, e as CheckoutUserActionEventType, S as SwapEventType, B as BridgeEventType, O as OnRampEventType, f as SaleEventType, g as OrchestrationEventType, V as ViewActions, h as getL2ChainId, i as getL1ChainId, k as ChainId, l as useTranslation, m as useViewState, n as useEventTargetState, o as jsxs, p as SharedViews, L as LoadingView, E as ErrorView, q as ConnectWidget, s as ConnectLoader, t as ViewContextProvider } from './index-Ae2juTF3.js';
import SwapWidget from './SwapWidget-CHpebwSI.js';
import { B as BridgeWidget } from './BridgeWidget-cUNXQmXb.js';
import { O as OnRampWidget } from './OnRampWidget-CZEQL01K.js';
import WalletWidget from './WalletWidget-arEt3G9O.js';
import SaleWidget from './SaleWidget-BqU6bfWu.js';
import AddFundsWidget from './AddFundsWidget-cCNrvOyw.js';
import './balance-BAruSdXS.js';
import './retry-CDK--oGi.js';
import './TopUpView-BinG-jkK.js';
import './TextInputForm-B89J7hRS.js';
import './SpendingCapHero-4IkTT4Hc.js';

const initialCheckoutState = {
    checkout: undefined,
    provider: undefined,
    passport: undefined,
};
var CheckoutActions;
(function (CheckoutActions) {
    CheckoutActions["SET_CHECKOUT"] = "SET_CHECKOUT";
    CheckoutActions["SET_PROVIDER"] = "SET_PROVIDER";
    CheckoutActions["SET_PASSPORT"] = "SET_PASSPORT";
})(CheckoutActions || (CheckoutActions = {}));
// eslint-disable-next-line @typescript-eslint/naming-convention
const CheckoutContext = reactExports.createContext({
    checkoutState: initialCheckoutState,
    checkoutDispatch: () => { },
});
CheckoutContext.displayName = 'CheckoutContext'; // help with debugging Context in browser
const checkoutReducer = (state, action) => {
    switch (action.payload.type) {
        case CheckoutActions.SET_CHECKOUT:
            return {
                ...state,
                checkout: action.payload.checkout,
            };
        case CheckoutActions.SET_PROVIDER:
            return {
                ...state,
                provider: action.payload.provider,
            };
        case CheckoutActions.SET_PASSPORT:
            return {
                ...state,
                passport: action.payload.passport,
            };
        default:
            return state;
    }
};

const useCheckoutWidgetState = () => {
    const [viewState, viewDispatch] = reactExports.useReducer(checkoutReducer, initialCheckoutState);
    return [viewState, viewDispatch];
};
function CheckoutWidgetContextProvicer({ children, }) {
    const [{ checkout, provider }] = useConnectLoaderState();
    const [checkoutState, checkoutDispatch] = useCheckoutWidgetState();
    const values = reactExports.useMemo(() => ({
        checkoutState: { ...checkoutState, checkout, provider },
        checkoutDispatch,
    }), [checkoutState, checkoutDispatch, checkout, provider]);
    return (jsx(CheckoutContext.Provider, { value: values, children: children }));
}

const sendCheckoutEvent = (eventTarget, detail) => {
    const event = new CustomEvent(IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT, { detail });
    // eslint-disable-next-line no-console
    console.log('checkout app event ', eventTarget, event);
    if (eventTarget !== undefined)
        eventTarget.dispatchEvent(event);
};

/**
 * List of views that require a connected wallet
 */
const connectFirstViewList = [
    CheckoutFlowType.SALE,
    CheckoutFlowType.SWAP,
    CheckoutFlowType.WALLET,
    CheckoutFlowType.ONRAMP,
    CheckoutFlowType.ADD_FUNDS,
];
/**
 * Check if the given view requires a connected wallet
 */
function getViewShouldConnect(view) {
    return connectFirstViewList.includes(view);
}

/**
 * Map Connect Widget Events
 */
function mapConnectWidgetEvent(event) {
    const { type, data } = event.detail;
    switch (type) {
        case ConnectEventType.SUCCESS:
            return {
                type: CheckoutEventType.SUCCESS,
                data: {
                    type: CheckoutSuccessEventType.CONNECT_SUCCESS,
                    data,
                },
            };
        case ConnectEventType.FAILURE:
            return {
                type: CheckoutEventType.FAILURE,
                data: {
                    type: CheckoutFailureEventType.CONNECT_FAILED,
                    data,
                },
            };
        case ConnectEventType.CLOSE_WIDGET:
            return {
                type: CheckoutEventType.CLOSE,
                data: {},
            };
        default:
            throw new Error(`Unknown connect event type "${event.detail.type}"`);
    }
}
/**
 * Map Wallet Widget Events
 */
function mapWalletWidgetEvent(event) {
    const { type, data } = event.detail;
    switch (type) {
        case WalletEventType.NETWORK_SWITCH:
            return {
                type: CheckoutEventType.USER_ACTION,
                data: {
                    type: CheckoutUserActionEventType.NETWORK_SWITCH,
                    data,
                },
            };
        case WalletEventType.DISCONNECT_WALLET:
            return {
                type: CheckoutEventType.DISCONNECTED,
                data: {},
            };
        case WalletEventType.CLOSE_WIDGET:
            return {
                type: CheckoutEventType.CLOSE,
                data: {},
            };
        default:
            throw new Error(`Unknown wallet event type "${event.detail.type}"`);
    }
}
/**
 * Map Swap Widget Events
 */
function mapSwapWidgetEvent(event) {
    const { type, data } = event.detail;
    switch (type) {
        case SwapEventType.SUCCESS:
            return {
                type: CheckoutEventType.SUCCESS,
                data: {
                    type: CheckoutSuccessEventType.SWAP_SUCCESS,
                    data,
                },
            };
        case SwapEventType.FAILURE:
            return {
                type: CheckoutEventType.FAILURE,
                data: {
                    type: CheckoutFailureEventType.SWAP_FAILED,
                    data,
                },
            };
        case SwapEventType.REJECTED:
            return {
                type: CheckoutEventType.FAILURE,
                data: {
                    type: CheckoutFailureEventType.SWAP_REJECTED,
                    data,
                },
            };
        case SwapEventType.CLOSE_WIDGET:
            return {
                type: CheckoutEventType.CLOSE,
                data: {},
            };
        default:
            throw new Error(`Unknown swap event type "${event.detail.type}"`);
    }
}
/**
 * Map Add Funds Widget Events
 */
function mapAddFundsWidgetEvent(event) {
    const { type } = event.detail;
    switch (type) {
        default:
            throw new Error(`Unknown add funds event type "${event.detail.type}"`);
    }
}
/**
 * Map Bridge Widget Events
 */
function mapBridgeWidgetEvent(event) {
    const { type, data } = event.detail;
    switch (type) {
        case BridgeEventType.TRANSACTION_SENT:
            return {
                type: CheckoutEventType.SUCCESS,
                data: {
                    type: CheckoutSuccessEventType.BRIDGE_SUCCESS,
                    data,
                },
            };
        case BridgeEventType.CLAIM_WITHDRAWAL_SUCCESS:
            return {
                type: CheckoutEventType.SUCCESS,
                data: {
                    type: CheckoutSuccessEventType.BRIDGE_CLAIM_WITHDRAWAL_SUCCESS,
                    data,
                },
            };
        case BridgeEventType.CLAIM_WITHDRAWAL_FAILURE:
            return {
                type: CheckoutEventType.FAILURE,
                data: {
                    type: CheckoutFailureEventType.BRIDGE_CLAIM_WITHDRAWAL_FAILED,
                    data,
                },
            };
        case BridgeEventType.FAILURE:
            return {
                type: CheckoutEventType.FAILURE,
                data: {
                    type: CheckoutFailureEventType.BRIDGE_FAILED,
                    data,
                },
            };
        case BridgeEventType.CLOSE_WIDGET:
            return {
                type: CheckoutEventType.CLOSE,
                data: {},
            };
        default:
            throw new Error(`Unknown bridge event type "${event.detail.type}"`);
    }
}
/**
 * Map Bridge Widget Events
 */
function mapOnrampWidgetEvent(event) {
    const { type, data } = event.detail;
    switch (type) {
        case OnRampEventType.SUCCESS:
            return {
                type: CheckoutEventType.SUCCESS,
                data: {
                    type: CheckoutSuccessEventType.ONRAMP_SUCCESS,
                    data,
                },
            };
        case OnRampEventType.FAILURE:
            return {
                type: CheckoutEventType.FAILURE,
                data: {
                    type: CheckoutFailureEventType.ONRAMP_FAILED,
                    data,
                },
            };
        case OnRampEventType.CLOSE_WIDGET:
            return {
                type: CheckoutEventType.CLOSE,
                data: {},
            };
        default:
            throw new Error(`Unknown onRamp event type "${event.detail.type}"`);
    }
}
function mapSaleWidgetEvent(event) {
    const { type, data } = event.detail;
    switch (type) {
        case SaleEventType.SUCCESS:
            return {
                type: CheckoutEventType.SUCCESS,
                data: {
                    type: CheckoutSuccessEventType.SALE_SUCCESS,
                    data,
                },
            };
        case SaleEventType.FAILURE:
            return {
                type: CheckoutEventType.FAILURE,
                data: {
                    type: CheckoutFailureEventType.SALE_FAILED,
                    data,
                },
            };
        case SaleEventType.CLOSE_WIDGET:
            return {
                type: CheckoutEventType.CLOSE,
                data: {},
            };
        case SaleEventType.TRANSACTION_SUCCESS:
            return {
                type: CheckoutEventType.SUCCESS,
                data: {
                    type: CheckoutSuccessEventType.SALE_TRANSACTION_SUCCESS,
                    data,
                },
            };
        case SaleEventType.PAYMENT_METHOD:
            return {
                type: CheckoutEventType.USER_ACTION,
                data: {
                    type: CheckoutUserActionEventType.PAYMENT_METHOD_SELECTED,
                    data,
                },
            };
        case SaleEventType.PAYMENT_TOKEN:
            return {
                type: CheckoutEventType.USER_ACTION,
                data: {
                    type: CheckoutUserActionEventType.PAYMENT_TOKEN_SELECTED,
                    data,
                },
            };
        default:
            throw new Error(`Unknown sale event type "${event.detail.type}"`);
    }
}
/**
 * Map widget events to checkout widget event detail
 */
function getCheckoutWidgetEvent(event) {
    if (event.detail.type === ProviderEventType.PROVIDER_UPDATED) {
        return {
            type: CheckoutEventType.PROVIDER_UPDATED,
            data: event.detail.data,
        };
    }
    switch (event.type) {
        case IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT:
            return mapConnectWidgetEvent(event);
        case IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT:
            return mapWalletWidgetEvent(event);
        case IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT:
            return mapSwapWidgetEvent(event);
        case IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT:
            return mapAddFundsWidgetEvent(event);
        case IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT:
            return mapBridgeWidgetEvent(event);
        case IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT:
            return mapOnrampWidgetEvent(event);
        case IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT:
            return mapSaleWidgetEvent(event);
        default:
            throw new Error(`Unknown widget event type "${event.type}"`);
    }
}

/**
 * Get view from orchestration event type
 */
function getViewFromOrchestrationEventType(type) {
    switch (type) {
        case OrchestrationEventType.REQUEST_SWAP:
            return CheckoutFlowType.SWAP;
        case OrchestrationEventType.REQUEST_CONNECT:
            return CheckoutFlowType.CONNECT;
        case OrchestrationEventType.REQUEST_WALLET:
            return CheckoutFlowType.WALLET;
        case OrchestrationEventType.REQUEST_BRIDGE:
            return CheckoutFlowType.BRIDGE;
        case OrchestrationEventType.REQUEST_ONRAMP:
            return CheckoutFlowType.ONRAMP;
        case OrchestrationEventType.REQUEST_ADD_FUNDS:
            return CheckoutFlowType.ADD_FUNDS;
        default:
            return null;
    }
}

/** Orchestration Events List */
const orchestrationEvents = [
    OrchestrationEventType.REQUEST_CONNECT,
    OrchestrationEventType.REQUEST_WALLET,
    OrchestrationEventType.REQUEST_SWAP,
    OrchestrationEventType.REQUEST_BRIDGE,
    OrchestrationEventType.REQUEST_ONRAMP,
    OrchestrationEventType.REQUEST_ADD_FUNDS,
    OrchestrationEventType.REQUEST_GO_BACK,
];
/**
 * Check if event is orchestration event
 */
function isOrchestrationEvent(event) {
    return orchestrationEvents.includes(event.detail.type);
}

/** Widget Events List */
const widgetEvents = [
    IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
    IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
    IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
    IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
    IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT,
];
/**
 * Subscribe and Handle widget events
 */
function useWidgetEvents(eventTarget, viewState) {
    const [{ history }, viewDispatch] = viewState;
    /**
     * Change view as per orchestration event requests
     */
    const handleOrchestrationEvent = (event) => {
        const { type, data } = event.detail;
        if (type === OrchestrationEventType.REQUEST_GO_BACK) {
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: history?.[0],
                },
            });
            return;
        }
        const flow = getViewFromOrchestrationEventType(type);
        if (!flow)
            return;
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: flow,
                    data: { params: data, config: {}, showBackButton: true },
                },
            },
        });
    };
    /**
     * Proxy widget events to checkout widget events
     */
    const handleWidgetEvent = reactExports.useMemo(() => {
        if (!eventTarget)
            return null;
        return (event) => {
            const customEvent = event;
            if (isOrchestrationEvent(customEvent)) {
                handleOrchestrationEvent(customEvent);
                return;
            }
            const eventDetail = getCheckoutWidgetEvent(customEvent);
            sendCheckoutEvent(eventTarget, eventDetail);
        };
    }, [eventTarget]);
    reactExports.useEffect(() => {
        if (!handleWidgetEvent)
            return () => { };
        widgetEvents.map((event) => window.addEventListener(event, handleWidgetEvent));
        return () => {
            widgetEvents.map((event) => window.removeEventListener(event, handleWidgetEvent));
        };
    }, [handleWidgetEvent]);
}

/**
 * Get the chain id for the checkout
 */
const getChainId = (checkout) => (checkout.config.isProduction
    ? ChainId.IMTBL_ZKEVM_MAINNET
    : ChainId.IMTBL_ZKEVM_TESTNET);
/**
 * Get the connect loader params for the widget
 */
function getConnectLoaderParams(view, checkout, web3Provider) {
    const { type, data } = view;
    switch (type) {
        case CheckoutFlowType.WALLET:
            return {
                checkout,
                web3Provider,
                targetChainId: getChainId(checkout),
                walletProviderName: data.params.walletProviderName,
                allowedChains: [
                    getL1ChainId(checkout.config),
                    getL2ChainId(checkout.config),
                ],
            };
        case CheckoutFlowType.ONRAMP:
        case CheckoutFlowType.ADD_FUNDS:
            return {
                checkout,
                web3Provider,
                targetChainId: getChainId(checkout),
                allowedChains: [
                    getL1ChainId(checkout.config),
                    getL2ChainId(checkout.config),
                ],
            };
        case CheckoutFlowType.SALE:
        case CheckoutFlowType.SWAP:
            return {
                checkout,
                web3Provider,
                targetChainId: getChainId(checkout),
                allowedChains: [getL2ChainId(checkout.config)],
            };
        default:
            return {};
    }
}

function CheckoutWidget(props) {
    const { flowParams, flowConfig, widgetsConfig, checkout, web3Provider, } = props;
    const { t } = useTranslation();
    const viewState = useViewState();
    const [{ view }, viewDispatch] = viewState;
    const [{ eventTarget }] = useEventTargetState();
    const connectLoaderParams = reactExports.useMemo(() => getConnectLoaderParams(view, checkout, web3Provider), [view, checkout, web3Provider]);
    /**
     * Subscribe and Handle widget events
     */
    useWidgetEvents(eventTarget, viewState);
    /**
     * Mount the view according to set flow in params
     */
    reactExports.useEffect(() => {
        if (!flowParams.flow)
            return;
        const { flow, ...mountedWidgetParams } = flowParams;
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: flow,
                    data: {
                        params: mountedWidgetParams,
                        config: { ...(flowConfig?.[flow] || {}) },
                    },
                },
            },
        });
    }, [flowParams]);
    const showBackButton = !!view.data?.showBackButton;
    const shouldConnectView = reactExports.useMemo(() => getViewShouldConnect(view.type), [view.type]);
    return (jsx(ViewContextProvider, { children: jsxs(CheckoutWidgetContextProvicer, { children: [view.type === SharedViews.LOADING_VIEW && (jsx(LoadingView, { loadingText: t('views.LOADING_VIEW.text') })), view.type === SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW && (jsx(ErrorView, { onCloseClick: () => {
                        sendCheckoutEvent(eventTarget, {
                            type: CheckoutEventType.CLOSE,
                            data: {},
                        });
                    }, onActionClick: () => {
                        // TODO: trigger a retry
                    }, actionText: t('views.ERROR_VIEW.actionText') })), view.type === CheckoutFlowType.CONNECT && (jsx(ConnectWidget, { config: widgetsConfig, checkout: checkout, sendCloseEventOverride: () => {
                        sendCheckoutEvent(eventTarget, {
                            type: CheckoutEventType.CLOSE,
                            data: {},
                        });
                    }, ...(view.data.params || {}) })), view.type === CheckoutFlowType.BRIDGE && (jsx(BridgeWidget, { config: widgetsConfig, checkout: checkout, web3Provider: web3Provider, showBackButton: showBackButton, ...(view.data.params || {}) })), shouldConnectView && (jsx(ConnectLoader, { widgetConfig: widgetsConfig, params: connectLoaderParams, closeEvent: () => {
                        sendCheckoutEvent(eventTarget, {
                            type: CheckoutEventType.CLOSE,
                            data: {},
                        });
                    }, children: jsxs(reactExports.Suspense, { fallback: jsx(LoadingView, { loadingText: t('views.LOADING_VIEW.text') }), children: [view.type === CheckoutFlowType.WALLET && (jsx(WalletWidget, { config: widgetsConfig, walletConfig: {
                                    showNetworkMenu: true,
                                    showDisconnectButton: true,
                                    ...view.data.config,
                                }, ...(view.data.params || {}) })), view.type === CheckoutFlowType.SALE && (jsx(SaleWidget, { config: widgetsConfig, ...(view.data.params || {}), hideExcludedPaymentTypes: false,
                                waitFulfillmentSettlements: true,
                                ...view.data.config })), view.type === CheckoutFlowType.ADD_FUNDS && (jsx(AddFundsWidget, { checkout: checkout, ...(view.data.params || {}), ...(view.data.config || {}), showBackButton: showBackButton })), view.type === CheckoutFlowType.SWAP && (jsx(SwapWidget, { config: widgetsConfig, ...(view.data.params || {}), ...(view.data.config || {}), showBackButton: showBackButton })), view.type === CheckoutFlowType.ONRAMP && (jsx(OnRampWidget, { config: widgetsConfig, ...(view.data.params || {}), ...(view.data.config || {}), showBackButton: showBackButton }))] }) }))] }) }));
}

export { CheckoutWidget as default };
