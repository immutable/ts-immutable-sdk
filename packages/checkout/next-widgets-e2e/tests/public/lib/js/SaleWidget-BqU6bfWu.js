import { j as jsx, _ as _objectWithoutProperties, w as useTheme, r as reactExports, y as merge, aF as getCaptionTextStyles, aG as baseTextComponentSx, aH as useConvertSxToEmotionStyles, aI as useGetCurrentSizeClass, aJ as cloneElementWithCssProp, T as _defineProperty, aK as shimmerSx, G as Box, a3 as Environment, aL as BigNumber, aM as compareStr, X as ViewContext, V as ViewActions, aN as SalePaymentTypes, a6 as UserJourney, l as useTranslation, aj as calculateCryptoToFiat, $ as useAnalytics, a1 as EventTargetContext, aO as sendSaleWidgetCloseEvent, aP as sendSaleSuccessEvent, aQ as sendSaleFailedEvent, aR as sendSaleTransactionSuccessEvent, aS as sendSalePaymentMethodEvent, aT as sendSalePaymentTokenEvent, ak as HeaderNavigation, o as jsxs, aU as LoadingOverlay, aV as Fragment, ao as SimpleLayout, aW as useHandover, aX as HandoverTarget, aY as getRemoteRive, as as Heading, aZ as HandoverDuration, Y as Body, N as Button, a2 as isPassportProvider, a4 as MenuItem, a_ as motion, a$ as listVariants, b0 as listItemVariants, p as SharedViews, an as FooterLogo, b1 as StatusType, b2 as prettyFormatNumber, a5 as tokenValueFormat, b3 as Stack, b4 as FundingStepType, ar as abbreviateWalletAddress, at as Drawer, b5 as Divider, b6 as tokenSymbolNameOverrides, b7 as ItemType, b8 as TransactionOrGasType, b9 as GasTokenType, ba as RoutingOutcomeType, a9 as isNativeToken, ai as getTokenImageByAddress, bb as isGasFree, Z as ConnectLoaderContext, bc as eventTargetReducer, bd as initialEventTargetState, i as getL1ChainId, h as getL2ChainId, I as IMTBLWidgetEvents, be as EventTargetActions, L as LoadingView, k as ChainId, bf as ConnectWidgetViews, q as ConnectWidget, S as SwapEventType, O as OnRampEventType, B as BridgeEventType, b as ConnectEventType, bg as ConnectLoaderActions, v as ButtCon, bh as widgetTheme, aD as viewReducer, aE as initialViewState, bi as BlockExplorerService } from './index-Ae2juTF3.js';
import { C as Contract, B as BridgeWidget } from './BridgeWidget-cUNXQmXb.js';
import { u as useTransakEvents, O as OnRampWidget } from './OnRampWidget-CZEQL01K.js';
import { f as formatUnits, u as useMount, C as CryptoFiatContext, a as CryptoFiatActions, T as TopUpView, b as CryptoFiatProvider } from './TopUpView-BinG-jkK.js';
import { T as TokenImage } from './retry-CDK--oGi.js';
import { F as Fees } from './balance-BAruSdXS.js';
import SwapWidget from './SwapWidget-CHpebwSI.js';
import './TextInputForm-B89J7hRS.js';
import './SpendingCapHero-4IkTT4Hc.js';

var _excluded$1 = ["size", "weight", "rc", "sx", "testId", "children", "domRef", "className"];
function ownKeys$1(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread$1(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$1(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var DEFAULT_CAPTION_COLOR = "base.color.text.caption.primary";
var DEFAULT_CAPTION_SIZE = "medium";
function Caption(_ref) {
  var _ref$size = _ref.size,
    size = _ref$size === void 0 ? DEFAULT_CAPTION_SIZE : _ref$size,
    _ref$weight = _ref.weight,
    weight = _ref$weight === void 0 ? "regular" : _ref$weight,
    _ref$rc = _ref.rc,
    rc = _ref$rc === void 0 ? jsx("span", {}) : _ref$rc,
    _ref$sx = _ref.sx,
    sx = _ref$sx === void 0 ? {} : _ref$sx,
    testId = _ref.testId,
    children = _ref.children,
    domRef = _ref.domRef,
    className = _ref.className,
    spanDomAttributes = _objectWithoutProperties(_ref, _excluded$1);
  var themeProps = useTheme();
  var mergedSx = reactExports.useMemo(function () {
    var _themeProps$component, _themeProps$component2;
    return merge(baseTextComponentSx, {
      c: DEFAULT_CAPTION_COLOR
    }, getCaptionTextStyles({
      themeProps: themeProps,
      size: size,
      weight: weight
    }), (_themeProps$component = (_themeProps$component2 = themeProps.components) === null || _themeProps$component2 === void 0 || (_themeProps$component2 = _themeProps$component2.Caption) === null || _themeProps$component2 === void 0 ? void 0 : _themeProps$component2.sxOverride) !== null && _themeProps$component !== void 0 ? _themeProps$component : {}, sx);
  }, [sx, themeProps, size, weight]);
  var css = useConvertSxToEmotionStyles(mergedSx);
  var currentSizeClass = useGetCurrentSizeClass(size, DEFAULT_CAPTION_SIZE, Object.keys(themeProps.base.text.caption));
  return cloneElementWithCssProp(rc, _objectSpread$1(_objectSpread$1(_objectSpread$1(_objectSpread$1({}, spanDomAttributes), testId ? {
    "data-testid": testId
  } : {}), domRef ? {
    ref: domRef
  } : {}), {}, {
    css: css,
    children: children,
    className: "".concat(className !== null && className !== void 0 ? className : "", " Caption Caption--").concat(currentSizeClass)
  }));
}
Caption.displayName = "Caption";

var _excluded = ["sx", "radius"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function ShimmerCircle(_ref) {
  var _ref$sx = _ref.sx,
    sx = _ref$sx === void 0 ? {} : _ref$sx,
    _ref$radius = _ref.radius,
    radius = _ref$radius === void 0 ? "50px" : _ref$radius,
    props = _objectWithoutProperties(_ref, _excluded);
  return jsx(Box, _objectSpread(_objectSpread({}, props), {}, {
    sx: merge(shimmerSx, {
      brad: "50%",
      w: radius,
      h: radius
    }, sx)
  }));
}

var SaleWidgetViews;
(function (SaleWidgetViews) {
    SaleWidgetViews["PAYMENT_METHODS"] = "PAYMENT_METHODS";
    SaleWidgetViews["PAY_WITH_COINS"] = "PAY_WITH_COINS";
    SaleWidgetViews["PAY_WITH_CARD"] = "PAY_WITH_CARD";
    SaleWidgetViews["ORDER_SUMMARY"] = "ORDER_SUMMARY";
    SaleWidgetViews["SALE_SUCCESS"] = "SALE_SUCCESS";
    SaleWidgetViews["SALE_FAIL"] = "SALE_FAIL";
})(SaleWidgetViews || (SaleWidgetViews = {}));
var OrderSummarySubViews;
(function (OrderSummarySubViews) {
    OrderSummarySubViews["INIT"] = "INIT";
    OrderSummarySubViews["REVIEW_ORDER"] = "REVIEW_ORDER";
    OrderSummarySubViews["EXECUTE_FUNDING_ROUTE"] = "EXECUTE_FUNDING_ROUTE";
})(OrderSummarySubViews || (OrderSummarySubViews = {}));

var SaleErrorTypes;
(function (SaleErrorTypes) {
    SaleErrorTypes["DEFAULT"] = "DEFAULT_ERROR";
    SaleErrorTypes["INVALID_PARAMETERS"] = "INVALID_PARAMETERS";
    SaleErrorTypes["TRANSACTION_FAILED"] = "TRANSACTION_FAILED";
    SaleErrorTypes["SERVICE_BREAKDOWN"] = "SERVICE_BREAKDOWN";
    SaleErrorTypes["PRODUCT_NOT_FOUND"] = "PRODUCT_NOT_FOUND";
    SaleErrorTypes["INSUFFICIENT_STOCK"] = "INSUFFICIENT_STOCK";
    SaleErrorTypes["TRANSAK_FAILED"] = "TRANSAK_FAILED";
    SaleErrorTypes["WALLET_FAILED"] = "WALLET_FAILED";
    SaleErrorTypes["WALLET_REJECTED"] = "WALLET_REJECTED";
    SaleErrorTypes["WALLET_REJECTED_NO_FUNDS"] = "WALLET_REJECTED_NO_FUNDS";
    SaleErrorTypes["WALLET_POPUP_BLOCKED"] = "WALLET_POPUP_BLOCKED";
    SaleErrorTypes["FUNDING_ROUTE_EXECUTE_ERROR"] = "FUNDING_ROUTE_EXECUTE_ERROR";
})(SaleErrorTypes || (SaleErrorTypes = {}));
var SignPaymentTypes;
(function (SignPaymentTypes) {
    SignPaymentTypes["CRYPTO"] = "crypto";
    SignPaymentTypes["FIAT"] = "fiat";
})(SignPaymentTypes || (SignPaymentTypes = {}));
var FundingBalanceType;
(function (FundingBalanceType) {
    FundingBalanceType["SUFFICIENT"] = "SUFFICIENT";
})(FundingBalanceType || (FundingBalanceType = {}));
var ExecuteTransactionStep;
(function (ExecuteTransactionStep) {
    ExecuteTransactionStep["BEFORE"] = "before";
    ExecuteTransactionStep["PENDING"] = "pending";
    ExecuteTransactionStep["AFTER"] = "after";
})(ExecuteTransactionStep || (ExecuteTransactionStep = {}));

const PRIMARY_SALES_API_BASE_URL = {
    [Environment.SANDBOX]: 'https://api.sandbox.immutable.com/v1/primary-sales',
    [Environment.PRODUCTION]: 'https://api.immutable.com/v1/primary-sales',
};

const toStringifyTransactions = (transactions) => transactions
    .map(({ method, hash }) => `${method}: ${hash}`).join(' | ');
const toPascalCase = (str) => str
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
const sanitizeToLatin1 = (str) => {
    const regex = /[^\u0000-\u00FF]/g; // eslint-disable-line no-control-regex
    return str.replace(regex, '');
};
const hexToText = (value) => {
    if (!value)
        return '';
    let hex = value.trim().toLowerCase();
    if (hex.startsWith('0x')) {
        hex = hex.slice(2);
    }
    if (!/^[0-9a-f]+$/i.test(hex)) {
        throw new Error('Invalid hexadecimal input');
    }
    let text = '';
    for (let i = 0; i < hex.length; i += 2) {
        const byte = parseInt(hex.substr(i, 2), 16);
        text += String.fromCharCode(byte);
    }
    return text;
};

const filterAllowedTransactions = async (transactions, provider) => {
    try {
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        const approveTxn = transactions.find((txn) => txn.methodCall.startsWith('approve'));
        if (!approveTxn || !signer || !signerAddress) {
            return transactions;
        }
        const contract = new Contract(approveTxn.tokenAddress, ['function allowance(address,address) view returns (uint256)'], signer);
        const allowance = await signer?.call({
            to: approveTxn.tokenAddress,
            data: contract.interface.encodeFunctionData('allowance', [
                signerAddress,
                approveTxn.params.spender,
            ]),
        });
        const currentAmount = BigNumber.from(allowance);
        const desiredAmount = approveTxn.params.amount ? BigNumber.from(approveTxn.params.amount) : BigNumber.from(0);
        const isAllowed = currentAmount.gte(BigNumber.from('0')) && currentAmount.gte(desiredAmount);
        if (isAllowed) {
            return transactions.filter((txn) => txn.methodCall !== approveTxn.methodCall);
        }
    }
    catch {
        /* Ignoring errors, as we don't need block wallet from
         * sending the approve when it's not possible to check the allowance
         */
    }
    return transactions;
};

/* eslint-disable @typescript-eslint/naming-convention */
var SignCurrencyFilter;
(function (SignCurrencyFilter) {
    SignCurrencyFilter["CONTRACT_ADDRESS"] = "contract_address";
    SignCurrencyFilter["CURRENCY_SYMBOL"] = "currency_symbol";
})(SignCurrencyFilter || (SignCurrencyFilter = {}));
const toSignedProduct = (product, currency, item) => ({
    productId: product.product_id,
    image: item?.image || '',
    qty: item?.qty || 1,
    name: item?.name || '',
    description: item?.description || '',
    currency,
    contractType: product.contract_type,
    collectionAddress: product.collection_address,
    amount: product.detail.map(({ amount }) => amount),
    tokenId: product.detail.map(({ token_id: tokenId }) => tokenId),
});
const toSignResponse = (signApiResponse, items) => {
    const { order, transactions } = signApiResponse;
    return {
        order: {
            currency: {
                name: order.currency.name,
                erc20Address: order.currency.erc20_address,
            },
            products: order.products
                .map((product) => toSignedProduct(product, order.currency.name, items.find((item) => item.productId === product.product_id)))
                .reduce((acc, product) => {
                const index = acc.findIndex((n) => n.name === product.name);
                if (index === -1) {
                    acc.push({ ...product });
                }
                if (index > -1) {
                    acc[index].amount = [...acc[index].amount, ...product.amount];
                    acc[index].tokenId = [...acc[index].tokenId, ...product.tokenId];
                }
                return acc;
            }, []),
            totalAmount: Number(order.total_amount),
        },
        transactions: transactions.map((transaction) => ({
            tokenAddress: transaction.contract_address,
            gasEstimate: transaction.gas_estimate,
            methodCall: transaction.method_call,
            params: {
                reference: transaction.params.reference || '',
                amount: transaction.params.amount || 0,
                spender: transaction.params.spender || '',
            },
            rawData: transaction.raw_data,
        })),
        transactionId: hexToText(transactions.find((txn) => txn.method_call.startsWith('execute'))?.params
            .reference || ''),
    };
};
const useSignOrder = (input) => {
    const { provider, items, environment, environmentId, waitFulfillmentSettlements, } = input;
    const [signError, setSignError] = reactExports.useState(undefined);
    const [signResponse, setSignResponse] = reactExports.useState(undefined);
    const [executeResponse, setExecuteResponse] = reactExports.useState({
        done: false,
        transactions: [],
    });
    const [tokenIds, setTokenIds] = reactExports.useState([]);
    const [currentTransactionIndex, setCurrentTransactionIndex] = reactExports.useState(0);
    const [filteredTransactions, setFilteredTransactions] = reactExports.useState([]);
    const setExecuteTransactions = (transaction) => {
        setExecuteResponse((prev) => ({
            ...prev,
            transactions: [...prev.transactions, transaction],
        }));
    };
    const setExecuteDone = () => setExecuteResponse((prev) => ({ ...prev, done: true }));
    const setTransactionIndex = () => setCurrentTransactionIndex((prev) => prev + 1);
    const setExecuteFailed = () => setExecuteResponse({
        done: false,
        transactions: [],
    });
    const sendTransaction = reactExports.useCallback(async (to, data, gasLimit) => {
        try {
            const signer = provider?.getSigner();
            const gasPrice = await provider?.getGasPrice();
            const txnResponse = await signer?.sendTransaction({
                to,
                data,
                gasPrice,
                gasLimit,
            });
            if (waitFulfillmentSettlements) {
                await txnResponse?.wait();
            }
            const transactionHash = txnResponse?.hash;
            if (!transactionHash) {
                throw new Error('Transaction hash is undefined');
            }
            return [transactionHash, undefined];
        }
        catch (err) {
            const reason = `${err?.reason || err?.message || ''}`.toLowerCase();
            let errorType = SaleErrorTypes.WALLET_FAILED;
            if (reason.includes('failed') && reason.includes('open confirmation')) {
                errorType = SaleErrorTypes.WALLET_POPUP_BLOCKED;
            }
            if (reason.includes('rejected') && reason.includes('user')) {
                errorType = SaleErrorTypes.WALLET_REJECTED;
            }
            if (reason.includes('failed to submit')
                && reason.includes('highest gas limit')) {
                errorType = SaleErrorTypes.WALLET_REJECTED_NO_FUNDS;
            }
            if (reason.includes('status failed')
                || reason.includes('transaction failed')) {
                errorType = SaleErrorTypes.TRANSACTION_FAILED;
            }
            const error = {
                type: errorType,
                data: { error: err },
            };
            setSignError(error);
            return [undefined, error];
        }
    }, [provider, waitFulfillmentSettlements]);
    const sign = reactExports.useCallback(async (paymentType, fromTokenAddress) => {
        try {
            const signer = provider?.getSigner();
            const address = (await signer?.getAddress()) || '';
            const data = {
                recipient_address: address,
                payment_type: paymentType,
                currency_filter: SignCurrencyFilter.CONTRACT_ADDRESS,
                currency_value: fromTokenAddress,
                products: items.map((item) => ({
                    product_id: item.productId,
                    quantity: item.qty,
                })),
            };
            const baseUrl = `${PRIMARY_SALES_API_BASE_URL[environment]}/${environmentId}/order/sign`;
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const { ok, status } = response;
            if (!ok) {
                const { code } = (await response.json());
                let errorType;
                switch (status) {
                    case 400:
                        errorType = SaleErrorTypes.SERVICE_BREAKDOWN;
                        break;
                    case 404:
                        if (code === 'insufficient_stock') {
                            errorType = SaleErrorTypes.INSUFFICIENT_STOCK;
                        }
                        else {
                            errorType = SaleErrorTypes.PRODUCT_NOT_FOUND;
                        }
                        break;
                    case 429:
                    case 500:
                        errorType = SaleErrorTypes.DEFAULT;
                        break;
                    default:
                        throw new Error('Unknown error');
                }
                setSignError({ type: errorType });
                return undefined;
            }
            const apiResponse = await response.json();
            const apiTokenIds = apiResponse.order.products
                .map((product) => product.detail.map(({ token_id }) => token_id))
                .flat();
            const responseData = toSignResponse(apiResponse, items);
            setTokenIds(apiTokenIds);
            setSignResponse(responseData);
            if (provider) {
                const filterTransactions = await filterAllowedTransactions(responseData.transactions, provider);
                setFilteredTransactions(filterTransactions);
            }
            return responseData;
        }
        catch (e) {
            setSignError({ type: SaleErrorTypes.DEFAULT, data: { error: e } });
        }
        return undefined;
    }, [items, environmentId, environment, provider]);
    const executeTransaction = async (transaction, onTxnSuccess, onTxnError) => {
        if (!transaction) {
            return false;
        }
        const { tokenAddress: to, rawData: data, methodCall: method, gasEstimate, } = transaction;
        const [hash, txnError] = await sendTransaction(to, data, gasEstimate);
        if (txnError || !hash) {
            onTxnError(txnError, executeResponse.transactions);
            return false;
        }
        const execTransaction = { method, hash };
        setExecuteTransactions(execTransaction);
        onTxnSuccess(execTransaction);
        return true;
    };
    const executeAll = reactExports.useCallback(async (signData, onTxnSuccess, onTxnError, onTxnStep) => {
        if (!signData || !provider) {
            setSignError({
                type: SaleErrorTypes.DEFAULT,
                data: { reason: 'No sign data' },
            });
            return [];
        }
        const transactions = await filterAllowedTransactions(signData.transactions, provider);
        let successful = true;
        for (const transaction of transactions) {
            if (onTxnStep) {
                onTxnStep(transaction.methodCall, ExecuteTransactionStep.BEFORE);
            }
            // eslint-disable-next-line no-await-in-loop
            const success = await executeTransaction(transaction, onTxnSuccess, onTxnError);
            if (!success) {
                successful = false;
                break;
            }
            if (onTxnStep) {
                onTxnStep(transaction.methodCall, ExecuteTransactionStep.AFTER);
            }
        }
        (successful ? setExecuteDone : setExecuteFailed)();
        return executeResponse.transactions;
    }, [
        provider,
        executeTransaction,
        setExecuteDone,
        setExecuteFailed,
        filterAllowedTransactions,
        sendTransaction,
    ]);
    const executeNextTransaction = reactExports.useCallback(async (onTxnSuccess, onTxnError, onTxnStep) => {
        if (!filteredTransactions || executeResponse.done || !provider)
            return false;
        const transaction = filteredTransactions[currentTransactionIndex];
        if (onTxnStep) {
            onTxnStep(transaction.methodCall, ExecuteTransactionStep.BEFORE);
        }
        const success = await executeTransaction(transaction, onTxnSuccess, onTxnError);
        if (success) {
            setTransactionIndex();
            if (currentTransactionIndex === filteredTransactions.length - 1) {
                setExecuteDone();
            }
            if (onTxnStep) {
                onTxnStep(transaction.methodCall, ExecuteTransactionStep.AFTER);
            }
        }
        return success;
    }, [currentTransactionIndex, provider, filteredTransactions]);
    return {
        sign,
        signResponse,
        signError,
        filteredTransactions,
        currentTransactionIndex,
        executeAll,
        executeResponse,
        tokenIds,
        executeNextTransaction,
    };
};

/* eslint-disable @typescript-eslint/naming-convention */
const transformCurrencies = (currencies, preferredCurrency) => {
    const invalidPreferredCurrency = currencies.findIndex(({ name }) => compareStr(name, preferredCurrency || '')) === -1;
    if (preferredCurrency && invalidPreferredCurrency) {
        // eslint-disable-next-line no-console
        console.warn(`[IMTBL]: invalid "preferredCurrency=${preferredCurrency}" widget input`);
    }
    if (preferredCurrency && !invalidPreferredCurrency) {
        return currencies
            .filter(({ name }) => compareStr(name, preferredCurrency))
            .map(({ erc20_address, exchange_id, ...fields }) => ({
            ...fields,
            base: true,
            address: erc20_address,
            exchangeId: exchange_id,
        }));
    }
    return currencies.map(({ erc20_address, exchange_id, ...fields }) => ({
        ...fields,
        address: erc20_address,
        exchangeId: exchange_id,
    }));
};
const transformToOrderQuote = ({ config, currencies, products, total_amount, }, preferredCurrency) => ({
    config: {
        contractId: config.contract_id,
    },
    currencies: transformCurrencies(currencies, preferredCurrency),
    products: Object.entries(products).reduce((acc, [productId, { product_id, ...fields }]) => ({
        ...acc,
        [productId]: { productId, ...fields },
    }), {}),
    totalAmount: total_amount,
});

const defaultOrderQuote = {
    config: {
        contractId: '',
    },
    currencies: [],
    products: {},
    totalAmount: {},
};
const useQuoteOrder = ({ items, environment, environmentId, provider, preferredCurrency, }) => {
    const [selectedCurrency, setSelectedCurrency] = reactExports.useState();
    const fetching = reactExports.useRef(false);
    const [queryParams, setQueryParams] = reactExports.useState('');
    const [orderQuote, setOrderQuote] = reactExports.useState(defaultOrderQuote);
    const [orderQuoteError, setOrderQuoteError] = reactExports.useState(undefined);
    const setError = (error) => {
        setOrderQuoteError({
            type: SaleErrorTypes.SERVICE_BREAKDOWN,
            data: { reason: 'Error fetching settlement currencies', error },
        });
    };
    reactExports.useEffect(() => {
        // Set request params
        if (!items?.length || !provider)
            return;
        (async () => {
            try {
                const params = new URLSearchParams();
                const products = items.map(({ productId: id, qty }) => ({ id, qty }));
                params.append('products', btoa(JSON.stringify(products)));
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                params.append('wallet_address', address);
                setQueryParams(params.toString());
            }
            catch (error) {
                setError(error);
            }
        })();
    }, [items, provider]);
    reactExports.useEffect(() => {
        // Fetch order config
        if (!environment || !environmentId || !queryParams)
            return;
        (async () => {
            if (fetching.current)
                return;
            try {
                fetching.current = true;
                const baseUrl = `${PRIMARY_SALES_API_BASE_URL[environment]}/${environmentId}/order/quote?${queryParams}`;
                // eslint-disable-next-line
                const response = await fetch(baseUrl, {
                    method: 'GET',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) {
                    throw new Error(`${response.status} - ${response.statusText}`);
                }
                const config = transformToOrderQuote(await response.json(), preferredCurrency);
                setOrderQuote(config);
            }
            catch (error) {
                setError(error);
            }
            finally {
                fetching.current = false;
            }
        })();
    }, [environment, environmentId, queryParams]);
    reactExports.useEffect(() => {
        // Set default currency
        if (orderQuote.currencies.length === 0)
            return;
        const baseCurrencyOverride = preferredCurrency
            ? orderQuote.currencies.find((c) => compareStr(c.name, preferredCurrency))
            : undefined;
        const defaultSelectedCurrency = baseCurrencyOverride
            || orderQuote.currencies.find((c) => c.base)
            || orderQuote.currencies?.[0];
        setSelectedCurrency(defaultSelectedCurrency);
    }, [orderQuote]);
    return {
        orderQuote,
        selectedCurrency,
        orderQuoteError,
    };
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const SaleContext = reactExports.createContext({
    items: [],
    collectionName: '',
    provider: undefined,
    checkout: undefined,
    environmentId: '',
    environment: Environment.SANDBOX,
    recipientAddress: '',
    recipientEmail: '',
    sign: () => Promise.resolve(undefined),
    executeAll: () => Promise.resolve([]),
    executeNextTransaction: () => Promise.resolve(false),
    signResponse: undefined,
    signError: undefined,
    filteredTransactions: [],
    currentTransactionIndex: 0,
    executeResponse: undefined,
    passport: undefined,
    isPassportWallet: false,
    showCreditCardWarning: false,
    setShowCreditCardWarning: () => { },
    paymentMethod: undefined,
    setPaymentMethod: () => { },
    goBackToPaymentMethods: () => { },
    goToErrorView: () => { },
    goToSuccessView: () => { },
    config: {},
    fundingRoutes: [],
    disabledPaymentTypes: [],
    invalidParameters: false,
    fromTokenAddress: '',
    orderQuote: defaultOrderQuote,
    signTokenIds: [],
    excludePaymentTypes: [],
    preferredCurrency: undefined,
    selectedCurrency: undefined,
    waitFulfillmentSettlements: true,
    hideExcludedPaymentTypes: false,
});
SaleContext.displayName = 'SaleSaleContext';
/** Max attemps to retry with same payment method */
const MAX_ERROR_RETRIES = 1;
function SaleContextProvider(props) {
    const { children, value: { config, environment, environmentId, items, provider, checkout, passport, collectionName, excludePaymentTypes, excludeFiatCurrencies, preferredCurrency, waitFulfillmentSettlements, hideExcludedPaymentTypes, }, } = props;
    const errorRetries = reactExports.useRef(0);
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const [{ recipientEmail, recipientAddress }, setUserInfo] = reactExports.useState({
        recipientEmail: '',
        recipientAddress: '',
    });
    const [showCreditCardWarning, setShowCreditCardWarning] = reactExports.useState(false);
    const [paymentMethod, setPaymentMethodState] = reactExports.useState(undefined);
    const setPaymentMethod = (type) => {
        if (type === SalePaymentTypes.CREDIT && !showCreditCardWarning) {
            setPaymentMethodState(undefined);
            setShowCreditCardWarning(true);
            return;
        }
        setPaymentMethodState(type);
        setShowCreditCardWarning(false);
    };
    const [fundingRoutes] = reactExports.useState([]);
    const [disabledPaymentTypes, setDisabledPaymentTypes] = reactExports.useState([]);
    const [invalidParameters, setInvalidParameters] = reactExports.useState(false);
    const { selectedCurrency, orderQuote, orderQuoteError } = useQuoteOrder({
        items,
        provider,
        environmentId,
        environment: config.environment,
        preferredCurrency,
    });
    const fromTokenAddress = selectedCurrency?.address || '';
    const goBackToPaymentMethods = reactExports.useCallback((type, data) => {
        setPaymentMethod(type);
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SaleWidgetViews.PAYMENT_METHODS,
                    data,
                },
            },
        });
    }, []);
    reactExports.useEffect(() => {
        const getUserInfo = async () => {
            const signer = provider?.getSigner();
            const address = (await signer?.getAddress()) || '';
            const email = (await passport?.getUserInfo())?.email || '';
            setUserInfo({ recipientEmail: email, recipientAddress: address });
        };
        getUserInfo();
    }, [provider]);
    const { sign: signOrder, executeAll, executeNextTransaction, signResponse, signError, filteredTransactions, currentTransactionIndex, executeResponse, tokenIds, } = useSignOrder({
        items,
        provider,
        fromTokenAddress,
        recipientAddress,
        environmentId,
        environment,
        waitFulfillmentSettlements,
    });
    const sign = reactExports.useCallback(async (type, tokenAddress, callback) => {
        const selectedTokenAddress = tokenAddress || fromTokenAddress;
        const invalidFromTokenAddress = !selectedTokenAddress || !selectedTokenAddress.startsWith('0x');
        if (invalidFromTokenAddress) {
            setInvalidParameters(true);
            return undefined;
        }
        const response = await signOrder(type, selectedTokenAddress);
        if (!response)
            return undefined;
        callback?.(response);
        return response;
    }, [signOrder, fromTokenAddress]);
    const goToErrorView = reactExports.useCallback((errorType, data = {}) => {
        errorRetries.current += 1;
        if (errorRetries.current > MAX_ERROR_RETRIES) {
            errorRetries.current = 0;
            setPaymentMethod(undefined);
        }
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SaleWidgetViews.SALE_FAIL,
                    data: {
                        ...data,
                        errorType,
                        paymentMethod,
                        transactions: executeResponse.transactions,
                    },
                },
            },
        });
    }, [paymentMethod, setPaymentMethod, executeResponse]);
    const goToSuccessView = reactExports.useCallback((data) => {
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SaleWidgetViews.SALE_SUCCESS,
                    data: {
                        paymentMethod,
                        transactions: executeResponse.transactions,
                        tokenIds,
                        ...data,
                    },
                },
            },
        });
    }, [[paymentMethod, executeResponse, tokenIds]]);
    reactExports.useEffect(() => {
        if (!signError)
            return;
        goToErrorView(signError.type, signError.data);
    }, [signError]);
    reactExports.useEffect(() => {
        if (!orderQuoteError)
            return;
        goToErrorView(orderQuoteError.type, orderQuoteError.data);
    }, [orderQuoteError]);
    reactExports.useEffect(() => {
        const invalidItems = !items || items.length === 0;
        if (invalidItems || !collectionName || !environmentId) {
            setInvalidParameters(true);
        }
    }, [items, collectionName, environmentId]);
    reactExports.useEffect(() => {
        if (excludePaymentTypes?.length <= 0)
            return;
        setDisabledPaymentTypes(excludePaymentTypes);
    }, [excludePaymentTypes]);
    const values = reactExports.useMemo(() => ({
        config,
        items,
        fromTokenAddress,
        sign,
        signResponse,
        signError,
        filteredTransactions,
        currentTransactionIndex,
        executeAll,
        executeNextTransaction,
        executeResponse,
        environmentId,
        collectionName,
        environment,
        provider,
        checkout,
        recipientAddress,
        recipientEmail,
        showCreditCardWarning,
        setShowCreditCardWarning,
        paymentMethod,
        setPaymentMethod,
        goBackToPaymentMethods,
        goToErrorView,
        goToSuccessView,
        isPassportWallet: !!provider?.provider?.isPassport,
        fundingRoutes,
        disabledPaymentTypes,
        invalidParameters,
        orderQuote,
        signTokenIds: tokenIds,
        excludePaymentTypes,
        excludeFiatCurrencies,
        selectedCurrency,
        waitFulfillmentSettlements,
        hideExcludedPaymentTypes,
    }), [
        config,
        environment,
        environmentId,
        items,
        fromTokenAddress,
        collectionName,
        provider,
        checkout,
        recipientAddress,
        recipientEmail,
        signResponse,
        signError,
        filteredTransactions,
        currentTransactionIndex,
        executeResponse,
        showCreditCardWarning,
        setShowCreditCardWarning,
        paymentMethod,
        goBackToPaymentMethods,
        goToErrorView,
        goToSuccessView,
        sign,
        fundingRoutes,
        disabledPaymentTypes,
        invalidParameters,
        orderQuote,
        tokenIds,
        excludePaymentTypes,
        excludeFiatCurrencies,
        selectedCurrency,
        waitFulfillmentSettlements,
        hideExcludedPaymentTypes,
    ]);
    return jsx(SaleContext.Provider, { value: values, children: children });
}
function useSaleContext() {
    return reactExports.useContext(SaleContext);
}

const MAX_GAS_LIMIT$1 = '30000000';
// TODO: Move to common config file inside Checkout SDK while refactoring onRamp
// TODO: Get transak config from checkout SDK
const TRANSAK_WIDGET_BASE_URL = {
    [Environment.SANDBOX]: 'https://global-stg.transak.com',
    [Environment.PRODUCTION]: 'https://global.transak.com/',
};
const TRANSAK_API_BASE_URL = {
    [Environment.SANDBOX]: 'https://api-stg.transak.com',
    [Environment.PRODUCTION]: 'https://api.transak.com',
};
const TRANSAK_ENVIRONMENT = {
    [Environment.SANDBOX]: 'STAGING',
    [Environment.PRODUCTION]: 'PRODUCTION',
};
const TRANSAK_API_KEY = {
    [Environment.SANDBOX]: 'd14b44fb-0f84-4db5-affb-e044040d724b',
    [Environment.PRODUCTION]: 'ad1bca70-d917-4628-bb0f-5609537498bc',
};
const useTransakIframe = (props) => {
    const { contractId, environment, transakParams, onError, } = props;
    const [iframeSrc, setIframeSrc] = reactExports.useState('');
    const getNFTCheckoutURL = reactExports.useCallback(async () => {
        try {
            const { calldata, nftData: nfts, estimatedGasLimit, cryptoCurrencyCode, excludeFiatCurrencies, ...restWidgetParams } = transakParams;
            // FIXME: defaulting to first nft in the list
            // as transak currently only supports on nft at a time
            const nftData = nfts?.slice(0, 1)
                .map((item) => ({
                ...item,
                imageURL: sanitizeToLatin1(item.imageURL),
                nftName: sanitizeToLatin1(item.nftName),
            }));
            const gasLimit = estimatedGasLimit > 0 ? estimatedGasLimit : MAX_GAS_LIMIT$1;
            const params = {
                contractId,
                cryptoCurrencyCode,
                calldata,
                nftData,
                estimatedGasLimit: gasLimit.toString(),
            };
            // eslint-disable-next-line max-len
            const baseApiUrl = `${TRANSAK_API_BASE_URL[environment]}/cryptocoverage/api/v1/public/one-click-protocol/nft-transaction-id`;
            const response = await fetch(baseApiUrl, {
                method: 'POST',
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            if (!response.ok) {
                throw new Error('Failed to get NFT transaction ID');
            }
            const { id: nftTransactionId } = await response.json();
            const baseWidgetUrl = `${TRANSAK_WIDGET_BASE_URL[environment]}?`;
            const queryParams = new URLSearchParams({
                apiKey: TRANSAK_API_KEY[environment],
                environment: TRANSAK_ENVIRONMENT[environment],
                isNFT: 'true',
                nftTransactionId,
                themeColor: '0D0D0D',
                ...restWidgetParams,
            });
            if (excludeFiatCurrencies) {
                queryParams.append('excludeFiatCurrencies', excludeFiatCurrencies.join(','));
            }
            return `${baseWidgetUrl}${queryParams.toString()}`;
        }
        catch {
            onError?.();
        }
        return '';
    }, [contractId, environment, transakParams, onError]);
    reactExports.useEffect(() => {
        (async () => {
            const checkoutUrl = await getNFTCheckoutURL();
            setIframeSrc(checkoutUrl);
        })();
    }, []);
    return { iframeSrc };
};

function TransakIframe(props) {
    const { id, type, email, walletAddress, isPassportWallet, nftData, calldata, cryptoCurrencyCode, estimatedGasLimit, exchangeScreenTitle, partnerOrderId, excludeFiatCurrencies, onOpen, onInit, onOrderCreated, onOrderProcessing, onOrderCompleted, onOrderFailed, onFailedToLoad, failedToLoadTimeoutInMs, environment, contractId, } = props;
    const iframeRef = reactExports.useRef(null);
    const { onLoad, initialised } = useTransakEvents({
        userJourney: UserJourney.SALE,
        ref: iframeRef,
        walletAddress,
        isPassportWallet,
        onOpen,
        onOrderCreated,
        onOrderProcessing,
        onOrderCompleted,
        onOrderFailed,
        onInit,
        failedToLoadTimeoutInMs,
        onFailedToLoad,
    });
    const { iframeSrc } = useTransakIframe({
        type,
        contractId,
        environment,
        transakParams: {
            nftData,
            calldata,
            cryptoCurrencyCode,
            estimatedGasLimit,
            exchangeScreenTitle,
            email,
            walletAddress,
            partnerOrderId,
            excludeFiatCurrencies,
        },
        onError: onFailedToLoad,
    });
    return (jsx("iframe", { id: id, ref: iframeRef, src: iframeSrc, title: "Transak-Iframe", allow: "camera;microphone;fullscreen;payment", style: {
            height: '100%',
            width: '100%',
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: initialised ? 1 : 0,
            transition: 'opacity 0.5s ease-out',
        }, onLoad: onLoad, onError: () => onFailedToLoad?.() }));
}

function WithCard(props) {
    const { t } = useTranslation();
    const { onInit, onOpen, onOrderCreated, onOrderProcessing, onOrderCompleted, onOrderFailed, } = props;
    const { recipientEmail, recipientAddress, isPassportWallet, signResponse, goToErrorView, environment, orderQuote, excludeFiatCurrencies, } = useSaleContext();
    const executeTxn = signResponse?.transactions.find((txn) => txn.methodCall.startsWith('execute'));
    if (!signResponse || !executeTxn) {
        return null;
    }
    const nftData = reactExports.useMemo(() => signResponse.order.products.map((product) => ({
        collectionAddress: product.collectionAddress,
        imageURL: product.image,
        nftName: product.name,
        price: product.amount,
        quantity: product.qty,
        tokenID: product.tokenId,
        nftType: product.contractType || 'ERC721',
    })), [signResponse]);
    const onFailedToLoad = () => {
        goToErrorView(SaleErrorTypes.TRANSAK_FAILED);
    };
    return (jsx(TransakIframe, { id: "transak-iframe", type: "nft-checkout", email: recipientEmail, walletAddress: recipientAddress, isPassportWallet: isPassportWallet, exchangeScreenTitle: t('views.PAY_WITH_CARD.screenTitle'), nftData: nftData, calldata: executeTxn.rawData, cryptoCurrencyCode: signResponse.order.currency.name, estimatedGasLimit: executeTxn.gasEstimate, partnerOrderId: executeTxn.params.reference, excludeFiatCurrencies: excludeFiatCurrencies, onInit: onInit, onOpen: onOpen, onOrderCreated: onOrderCreated, onOrderProcessing: onOrderProcessing, onOrderCompleted: onOrderCompleted, onOrderFailed: onOrderFailed, onFailedToLoad: onFailedToLoad, environment: environment, contractId: orderQuote.config.contractId }));
}

const getPaymentTokenDetails = (fundingBalance, conversions) => {
    const { fundingItem } = fundingBalance;
    return ({
        settlementType: `${fundingBalance.type}`,
        type: fundingItem.type,
        token: fundingItem.token,
        amount: fundingItem.fundsRequired.formattedAmount,
        balance: fundingItem.userBalance.formattedBalance,
        fiat: {
            symbol: 'USD',
            balance: calculateCryptoToFiat(fundingItem.userBalance.formattedBalance, fundingItem.token.symbol, conversions),
            amount: calculateCryptoToFiat(fundingItem.fundsRequired.formattedAmount, fundingItem.token.symbol, conversions),
        },
    });
};

const useSaleEvent = () => {
    const { track, page } = useAnalytics();
    const { recipientAddress: userId, signResponse, paymentMethod, } = useSaleContext();
    const { eventTargetState: { eventTarget }, } = reactExports.useContext(EventTargetContext);
    const defaultView = SaleWidgetViews.PAYMENT_METHODS;
    const commonProps = {
        location: 'web',
        userJourney: UserJourney.SALE,
    };
    const userProps = {
        userId,
        paymentMethod,
    };
    const orderProps = {
        amount: signResponse?.order.totalAmount,
        currency: signResponse?.order.currency.name,
    };
    const sendCloseEvent = (screen = defaultView, controlType = 'Button', action = 'Pressed') => {
        track({
            ...commonProps,
            screen: toPascalCase(screen),
            control: 'Close',
            controlType,
            action,
            extras: {
                ...userProps,
            },
        });
        sendSaleWidgetCloseEvent(eventTarget);
    };
    const sendSuccessEvent = (screen = defaultView, transactions = [], tokenIds = [], details = {}) => {
        track({
            ...commonProps,
            screen: toPascalCase(screen),
            control: 'Success',
            controlType: 'Event',
            action: 'Succeeded',
            extras: {
                ...details,
                ...userProps,
                transactions: toStringifyTransactions(transactions),
                ...orderProps,
                paymentMethod,
                tokenIds,
            },
        });
        sendSaleSuccessEvent(eventTarget, paymentMethod, transactions, tokenIds, details.transactionId);
    };
    const sendFailedEvent = (reason, error, transactions = [], screen = defaultView, details = {}) => {
        track({
            ...commonProps,
            screen: toPascalCase(screen || defaultView),
            control: 'Fail',
            controlType: 'Event',
            action: 'Failed',
            extras: {
                ...details,
                transactions: toStringifyTransactions(transactions),
                ...error,
                ...orderProps,
                ...userProps,
                paymentMethod,
                reason,
            },
        });
        sendSaleFailedEvent(eventTarget, reason, error, paymentMethod, transactions, details.transactionId);
    };
    const sendTransactionSuccessEvent = (transaction) => {
        sendSaleTransactionSuccessEvent(eventTarget, paymentMethod, [transaction]);
    };
    const sendSelectedPaymentMethod = (type, screen) => {
        track({
            ...commonProps,
            screen: toPascalCase(screen),
            control: 'Select',
            controlType: 'MenuItem',
            extras: {
                paymentMethod: type,
            },
        });
        sendSalePaymentMethodEvent(eventTarget, type);
    };
    const sendSelectedPaymentToken = (screen, fundingBalance, conversions) => {
        const details = getPaymentTokenDetails(fundingBalance, conversions);
        track({
            ...commonProps,
            screen: toPascalCase(screen),
            control: 'Select',
            controlType: 'MenuItem',
            extras: {
                ...details,
            },
        });
        sendSalePaymentTokenEvent(eventTarget, details);
    };
    const sendPageView = (screen, data) => {
        page({
            ...commonProps,
            screen: toPascalCase(screen),
            action: 'Viewed',
            extras: { ...data },
        });
    };
    const sendOrderCreated = (screen, details) => {
        track({
            ...commonProps,
            screen: toPascalCase(screen),
            control: 'OrderCreated',
            controlType: 'Event',
            extras: {
                ...details,
            },
        });
    };
    const sendProceedToPay = (screen, fundingBalance, conversions, controlType = 'Button', action = 'Pressed') => {
        track({
            ...commonProps,
            screen: toPascalCase(screen),
            control: 'ProceedToPay',
            controlType,
            action,
            extras: {
                ...userProps,
                ...getPaymentTokenDetails(fundingBalance, conversions),
            },
        });
    };
    const sendInsufficientFunds = (screen, txRequirements, controlType = 'Event', action = 'Viewed') => {
        track({
            ...commonProps,
            screen: toPascalCase(screen),
            control: 'InsufficientFunds',
            controlType,
            action,
            extras: {
                ...userProps,
                ...txRequirements,
            },
        });
    };
    const sendViewFeesEvent = (screen, controlType = 'Button', action = 'Pressed') => {
        track({
            ...commonProps,
            screen: toPascalCase(screen),
            control: 'ViewFees',
            controlType,
            action,
            extras: {
                ...userProps,
            },
        });
    };
    return {
        track,
        page,
        sendPageView,
        sendCloseEvent,
        sendSuccessEvent,
        sendFailedEvent,
        sendTransactionSuccessEvent,
        sendOrderCreated,
        sendSelectedPaymentMethod,
        sendSelectedPaymentToken,
        sendProceedToPay,
        sendViewFeesEvent,
        sendInsufficientFunds,
    };
};

function PayWithCard() {
    const { sendPageView } = useSaleEvent();
    const [initialised, setInitialised] = reactExports.useState(false);
    const { goBackToPaymentMethods, goToErrorView, signResponse: signData, signTokenIds, } = useSaleContext();
    const { sendOrderCreated, sendCloseEvent, sendSuccessEvent } = useSaleEvent();
    const { t } = useTranslation();
    const onInit = () => setInitialised(true);
    const onOrderFailed = () => {
        goToErrorView(SaleErrorTypes.TRANSAK_FAILED);
    };
    const onOrderProcessing = (data = {}) => {
        const { id: orderId, status: orderStatus, cryptoAmount, cryptoCurrency, fiatAmount, fiatAmountInUsd, amountPaid, totalFeeInFiat, paymentOptionId: paymentOption, userId, userKycType, walletAddress, nftAssetInfo, } = data;
        const { nftDataBase64, quantity } = nftAssetInfo || {};
        const details = {
            orderId,
            orderStatus,
            cryptoAmount,
            cryptoCurrency,
            fiatAmount,
            fiatAmountInUsd,
            amountPaid,
            totalFeeInFiat,
            paymentOption,
            userId,
            userKycType,
            walletAddress,
            nftDataBase64,
            quantity,
            signData,
            transactionId: signData?.transactionId,
        };
        sendSuccessEvent(SaleWidgetViews.SALE_SUCCESS, [], signTokenIds, details); // checkoutPrimarySaleSaleSuccess_SuccessEventSucceeded
        sendCloseEvent(SaleWidgetViews.SALE_SUCCESS); // checkoutPrimarySaleSaleSuccess_CloseButtonPressed
    };
    const onOrderCreated = (data = {}) => {
        const { id: orderId, status: orderStatus, cryptoAmount, cryptoCurrency, fiatAmount, fiatAmountInUsd, amountPaid, totalFeeInFiat, paymentOptionId: paymentOption, userId, userKycType, walletAddress, nftAssetInfo, } = data;
        const { nftDataBase64, quantity } = nftAssetInfo || {};
        sendOrderCreated(SaleWidgetViews.PAY_WITH_CARD, {
            orderId,
            orderStatus,
            cryptoAmount,
            cryptoCurrency,
            fiatAmount,
            fiatAmountInUsd,
            amountPaid,
            totalFeeInFiat,
            paymentOption,
            userId,
            userKycType,
            walletAddress,
            nftDataBase64,
            quantity,
            signData,
            transactionId: signData?.transactionId,
        }); // checkoutPrimarySalePayWithCard_OrderCreatedEvent
    };
    reactExports.useEffect(() => sendPageView(SaleWidgetViews.PAY_WITH_CARD), []); // checkoutPrimarySalePayWithCardViewed
    return (jsx(SimpleLayout, { header: initialised && (jsx(HeaderNavigation, { onCloseButtonClick: () => goBackToPaymentMethods() })), children: jsxs(Fragment, { children: [jsx(LoadingOverlay, { visible: !initialised, children: jsx(LoadingOverlay.Content, { children: jsx(LoadingOverlay.Content.LoopingText, { text: [t('views.PAY_WITH_CARD.loading')] }) }) }), jsx(Box, { style: {
                        display: 'block',
                        position: 'relative',
                        maxWidth: '420px',
                        height: '565px',
                        borderRadius: '1%',
                        overflow: 'hidden',
                        margin: '0 auto',
                        width: '100%',
                    }, children: jsx(WithCard, { onInit: onInit, onOrderFailed: onOrderFailed, onOrderCompleted: onOrderProcessing, onOrderCreated: onOrderCreated, onOrderProcessing: onOrderProcessing }) })] }) }));
}

var TransactionMethod;
(function (TransactionMethod) {
    TransactionMethod["APPROVE"] = "approve(address spender,uint256 amount)";
    // eslint-disable-next-line max-len
    TransactionMethod["EXECUTE"] = "execute(address multicallSigner, bytes32 reference, address[] targets, bytes[] data, uint256 deadline, bytes signature)";
})(TransactionMethod || (TransactionMethod = {}));
const getRiveAnimationName = (transactionMethod) => {
    switch (transactionMethod) {
        case TransactionMethod.APPROVE:
            return '/access_coins.riv';
        case TransactionMethod.EXECUTE:
            return '/purchasing_items.riv';
        default:
            return '';
    }
};
var StateMachineInput;
(function (StateMachineInput) {
    StateMachineInput[StateMachineInput["START"] = 0] = "START";
    StateMachineInput[StateMachineInput["WAITING"] = 1] = "WAITING";
    StateMachineInput[StateMachineInput["PROCESSING"] = 2] = "PROCESSING";
    StateMachineInput[StateMachineInput["COMPLETED"] = 3] = "COMPLETED";
    StateMachineInput[StateMachineInput["ERROR"] = 4] = "ERROR";
})(StateMachineInput || (StateMachineInput = {}));
const transactionRiveAnimations = {
    [TransactionMethod.APPROVE]: {
        url: getRiveAnimationName(TransactionMethod.APPROVE),
        stateMachine: 'State',
        input: 'mode',
        inputValues: {
            start: StateMachineInput.START,
            waiting: StateMachineInput.WAITING,
            processing: StateMachineInput.PROCESSING,
            completed: StateMachineInput.COMPLETED,
            error: StateMachineInput.ERROR,
        },
    },
    [TransactionMethod.EXECUTE]: {
        url: getRiveAnimationName(TransactionMethod.EXECUTE),
        stateMachine: 'State',
        input: 'mode',
        inputValues: {
            start: StateMachineInput.START,
            waiting: StateMachineInput.WAITING,
            processing: StateMachineInput.PROCESSING,
            completed: StateMachineInput.COMPLETED,
            error: StateMachineInput.ERROR,
        },
    },
};
function useHandoverSteps(environment) {
    const { t } = useTranslation();
    const { addHandover } = useHandover({
        id: HandoverTarget.GLOBAL,
    });
    const onTxnStepExecuteNextTransaction = reactExports.useCallback((method, step) => {
        const key = `${method}-${step}`;
        switch (key) {
            case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.BEFORE}`:
                addHandover({
                    animationUrl: getRemoteRive(environment, getRiveAnimationName(TransactionMethod.APPROVE)),
                    inputValue: transactionRiveAnimations[TransactionMethod.APPROVE].inputValues
                        .processing,
                    children: (jsx(Heading, { children: t('views.PAYMENT_METHODS.handover.approve.pending') })),
                });
                break;
            case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.AFTER}`:
                addHandover({
                    duration: HandoverDuration.MEDIUM,
                    animationUrl: getRemoteRive(environment, getRiveAnimationName(TransactionMethod.APPROVE)),
                    inputValue: transactionRiveAnimations[TransactionMethod.APPROVE].inputValues
                        .completed,
                    children: (jsx(Heading, { children: t('views.PAYMENT_METHODS.handover.approve.after') })),
                });
                break;
            case `${TransactionMethod.EXECUTE}-${ExecuteTransactionStep.BEFORE}`:
                addHandover({
                    animationUrl: getRemoteRive(environment, getRiveAnimationName(TransactionMethod.EXECUTE)),
                    inputValue: transactionRiveAnimations[TransactionMethod.EXECUTE].inputValues
                        .waiting,
                    children: (jsx(Heading, { children: t('views.PAYMENT_METHODS.handover.execute.pending') })),
                });
                break;
            case `${TransactionMethod.EXECUTE}-${ExecuteTransactionStep.AFTER}`:
                addHandover({
                    animationUrl: getRemoteRive(environment, getRiveAnimationName(TransactionMethod.EXECUTE)),
                    inputValue: transactionRiveAnimations[TransactionMethod.EXECUTE].inputValues
                        .processing,
                    children: (jsx(Heading, { children: t('views.PAYMENT_METHODS.handover.execute.after') })),
                });
                break;
        }
    }, [environment, addHandover, t]);
    const onTxnStepExecuteAll = reactExports.useCallback((method, step) => {
        const key = `${method}-${step}`;
        switch (key) {
            case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.BEFORE}`:
                addHandover({
                    animationUrl: getRemoteRive(environment, getRiveAnimationName(TransactionMethod.APPROVE)),
                    inputValue: transactionRiveAnimations[TransactionMethod.APPROVE].inputValues
                        .waiting,
                    children: (jsx(Heading, { children: t('views.PAYMENT_METHODS.handover.approve.before') })),
                });
                break;
            case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.AFTER}`:
                addHandover({
                    animationUrl: getRemoteRive(environment, getRiveAnimationName(TransactionMethod.APPROVE)),
                    inputValue: transactionRiveAnimations[TransactionMethod.APPROVE].inputValues
                        .completed,
                    children: (jsx(Heading, { children: t('views.PAYMENT_METHODS.handover.approve.after') })),
                });
                break;
            case `${TransactionMethod.EXECUTE}-${ExecuteTransactionStep.BEFORE}`:
                addHandover({
                    animationUrl: getRemoteRive(environment, getRiveAnimationName(TransactionMethod.EXECUTE)),
                    inputValue: transactionRiveAnimations[TransactionMethod.EXECUTE].inputValues
                        .waiting,
                    children: (jsx(Heading, { children: t('views.PAYMENT_METHODS.handover.execute.before') })),
                });
                break;
            case `${TransactionMethod.EXECUTE}-${ExecuteTransactionStep.AFTER}`:
                addHandover({
                    duration: HandoverDuration.MEDIUM,
                    animationUrl: getRemoteRive(environment, getRiveAnimationName(TransactionMethod.EXECUTE)),
                    inputValue: transactionRiveAnimations[TransactionMethod.EXECUTE].inputValues
                        .processing,
                    children: (jsx(Heading, { children: t('views.PAYMENT_METHODS.handover.execute.after') })),
                });
                break;
        }
    }, [environment, addHandover, t]);
    return {
        onTxnStepExecuteNextTransaction,
        onTxnStepExecuteAll,
    };
}

function HandoverContent({ headingText, subheadingText, primaryButtonText, onPrimaryButtonClick, secondaryButtonText, onSecondaryButtonClick, }) {
    return (jsxs(Box, { sx: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        }, children: [jsxs(Box, { children: [jsx(Heading, { sx: { paddingBottom: 'base.spacing.x4' }, children: headingText }), jsx(Body, { size: "small", sx: {
                            textAlign: 'center',
                            color: 'base.color.text.body.secondary',
                        }, children: subheadingText })] }), jsxs(Box, { children: [primaryButtonText && onPrimaryButtonClick && (jsx(Box, { sx: {
                            paddingBottom: 'base.spacing.x2',
                        }, children: jsx(Button, { sx: {
                                width: '100%',
                            }, variant: "primary", size: "large", testId: "handover-primary-button", onClick: onPrimaryButtonClick, children: primaryButtonText }) })), secondaryButtonText && onSecondaryButtonClick && (jsx(Box, { sx: {
                            paddingBottom: 'base.spacing.x4',
                        }, children: jsx(Button, { sx: {
                                width: '100%',
                            }, variant: "tertiary", size: "large", testId: "handover-secondary-button", onClick: onSecondaryButtonClick, children: secondaryButtonText }) }))] })] }));
}

const initateExecuteNextTransactionHandover = {
    [TransactionMethod.APPROVE]: {
        headingTextKey: 'views.PAYMENT_METHODS.handover.approve.beforeWithCta.heading',
        ctaButtonTextKey: 'views.PAYMENT_METHODS.handover.approve.beforeWithCta.ctaButton',
        animationUrl: getRiveAnimationName(TransactionMethod.APPROVE),
        inputValue: StateMachineInput.WAITING,
    },
    [TransactionMethod.EXECUTE]: {
        headingTextKey: 'views.PAYMENT_METHODS.handover.execute.beforeWithCta.heading',
        ctaButtonTextKey: 'views.PAYMENT_METHODS.handover.execute.beforeWithCta.ctaButton',
        animationUrl: getRiveAnimationName(TransactionMethod.EXECUTE),
        inputValue: StateMachineInput.START,
    },
};
function PayWithCoins() {
    const processing = reactExports.useRef(false);
    const prevTransactionIndexRef = reactExports.useRef(null);
    const { t } = useTranslation();
    const { sendPageView, sendTransactionSuccessEvent, sendFailedEvent, sendCloseEvent, sendSuccessEvent, } = useSaleEvent();
    const { executeAll, executeNextTransaction, signResponse, filteredTransactions, currentTransactionIndex, executeResponse, signTokenIds, environment, provider, goToErrorView, } = useSaleContext();
    const { onTxnStepExecuteNextTransaction, onTxnStepExecuteAll } = useHandoverSteps(environment);
    const { addHandover } = useHandover({
        id: HandoverTarget.GLOBAL,
    });
    const executeAllTransactions = reactExports.useCallback(async () => {
        executeAll(signResponse, (txn) => {
            sendTransactionSuccessEvent(txn); // not an analytics event
        }, (error, txns) => {
            const details = { transactionId: signResponse?.transactionId };
            sendFailedEvent(error.toString(), error, txns, undefined, details); // checkoutPrimarySalePaymentMethods_FailEventFailed
            goToErrorView(error.type, error.data);
        }, onTxnStepExecuteAll);
    }, [signResponse, environment]);
    const executeUserInitiatedTransaction = reactExports.useCallback(() => {
        const transaction = filteredTransactions[currentTransactionIndex];
        const config = initateExecuteNextTransactionHandover[transaction.methodCall];
        const headingTextBefore = t(config.headingTextKey) || '';
        const ctaButtonTextBefore = t(config.ctaButtonTextKey) || '';
        const handleTransaction = () => {
            try {
                executeNextTransaction((txn) => {
                    sendTransactionSuccessEvent(txn);
                }, (err, txns) => {
                    const details = {
                        transactionId: signResponse?.transactionId,
                    };
                    sendFailedEvent(err.toString(), err, txns, undefined, details); // checkoutPrimarySalePaymentMethods_FailEventFailed
                    goToErrorView(err.type, err.data);
                }, onTxnStepExecuteNextTransaction);
            }
            catch (error) {
                goToErrorView(SaleErrorTypes.SERVICE_BREAKDOWN, { error });
            }
        };
        addHandover({
            animationUrl: getRemoteRive(environment, config.animationUrl),
            inputValue: config.inputValue,
            children: (jsx(HandoverContent, { headingText: headingTextBefore, primaryButtonText: ctaButtonTextBefore, onPrimaryButtonClick: handleTransaction })),
        });
    }, [
        filteredTransactions,
        currentTransactionIndex,
        signResponse,
        environment,
    ]);
    reactExports.useEffect(() => sendPageView(SaleWidgetViews.PAY_WITH_COINS), []); // checkoutPrimarySalePayWithCoinsViewed
    reactExports.useEffect(() => {
        if (!provider || filteredTransactions.length === 0)
            return;
        const hadPendingTransactions = currentTransactionIndex < filteredTransactions.length
            && prevTransactionIndexRef.current !== currentTransactionIndex;
        if (isPassportProvider(provider) && hadPendingTransactions) {
            prevTransactionIndexRef.current = currentTransactionIndex;
            executeUserInitiatedTransaction();
        }
    }, [filteredTransactions, currentTransactionIndex, provider]);
    reactExports.useEffect(() => {
        if (!signResponse || !provider || processing.current)
            return;
        if (!isPassportProvider(provider)) {
            processing.current = true;
            executeAllTransactions();
        }
    }, [signResponse, provider]);
    reactExports.useEffect(() => {
        if (executeResponse?.done) {
            const details = { transactionId: signResponse?.transactionId };
            addHandover({
                duration: HandoverDuration.MEDIUM,
                animationUrl: getRemoteRive(environment, getRiveAnimationName(TransactionMethod.EXECUTE)),
                inputValue: StateMachineInput.COMPLETED,
                children: (jsx(Heading, { sx: { px: 'base.spacing.x6' }, children: t('views.PAYMENT_METHODS.handover.success') })),
                onClose: () => {
                    sendSuccessEvent(SaleWidgetViews.SALE_SUCCESS, executeResponse?.transactions, signTokenIds, details); // checkoutPrimarySaleSaleSuccess_SuccessEventSucceeded
                    sendCloseEvent(SaleWidgetViews.SALE_SUCCESS); // checkoutPrimarySaleSaleSuccess_CloseButtonPressed
                },
            });
        }
    }, [executeResponse]);
    return null;
}

function PaymentOption({ type, onClick, disabled = false, caption, size, rc = jsx("span", {}), }) {
    const { t } = useTranslation();
    const icon = {
        [SalePaymentTypes.CRYPTO]: 'Coins',
        [SalePaymentTypes.DEBIT]: 'BankCard',
        [SalePaymentTypes.CREDIT]: 'BankCard',
    };
    const handleClick = () => onClick(type);
    const menuItemProps = {
        disabled,
        emphasized: true,
        onClick: disabled ? undefined : handleClick,
    };
    return (jsxs(MenuItem, { rc: rc, size: size || 'medium', sx: {
            marginBottom: 'base.spacing.x1',
            userSelect: 'none',
            ...(disabled && {
                filter: 'opacity(0.5)',
                cursor: 'not-allowed !important',
            }),
        }, ...menuItemProps, children: [jsx(MenuItem.FramedIcon, { icon: icon[type] }), jsx(MenuItem.Label, { size: "medium", children: t(`views.PAYMENT_METHODS.options.${type}.heading`) }), !disabled && jsx(MenuItem.IntentIcon, {}), jsx(MenuItem.Caption, { children: caption || t(`views.PAYMENT_METHODS.options.${type}.${disabled ? 'disabledCaption' : 'caption'}`) })] }));
}

const defaultPaymentOptions = [
    SalePaymentTypes.CRYPTO,
    SalePaymentTypes.DEBIT,
    SalePaymentTypes.CREDIT,
];
function PaymentOptions(props) {
    const { disabledOptions = [], paymentOptions, onClick, captions, size, hideDisabledOptions, } = props;
    const options = reactExports.useMemo(() => (paymentOptions || defaultPaymentOptions).filter((option) => !hideDisabledOptions || !disabledOptions.includes(option)), [paymentOptions, disabledOptions, hideDisabledOptions]);
    reactExports.useEffect(() => {
        if (options.length === 1) {
            onClick(options[0]);
        }
    }, [options, onClick]);
    return (jsx(Box, { testId: "payment-options-list", sx: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
        }, rc: jsx(motion.div, { variants: listVariants, initial: "hidden", animate: "show" }), children: options.map((type, idx) => (jsx(PaymentOption, { type: type, size: size, onClick: onClick, disabled: disabledOptions.includes(type), caption: captions?.[type], rc: jsx(motion.div, { custom: idx, variants: listItemVariants }) }, `payment-type-${type}`))) }));
}

function PaymentMethods() {
    const { t } = useTranslation();
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { sign, goToErrorView, paymentMethod, setPaymentMethod, invalidParameters, disabledPaymentTypes, hideExcludedPaymentTypes, } = useSaleContext();
    const { sendPageView, sendCloseEvent, sendSelectedPaymentMethod } = useSaleEvent();
    const handleOptionClick = (type) => {
        setPaymentMethod(type);
    };
    reactExports.useEffect(() => {
        if (paymentMethod) {
            sendSelectedPaymentMethod(paymentMethod, SaleWidgetViews.PAYMENT_METHODS); // checkoutPrimarySalePaymentMethods_SelectMenuItem
        }
        if (paymentMethod
            && [SalePaymentTypes.DEBIT, SalePaymentTypes.CREDIT].includes(paymentMethod)) {
            sign(SignPaymentTypes.FIAT, undefined, () => {
                viewDispatch({
                    payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: {
                            type: SaleWidgetViews.PAY_WITH_CARD,
                        },
                    },
                });
            });
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: SharedViews.LOADING_VIEW,
                        data: { loadingText: t('views.PAYMENT_METHODS.loading.ready1') },
                    },
                },
            });
        }
        if (paymentMethod && paymentMethod === SalePaymentTypes.CRYPTO) {
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: SaleWidgetViews.ORDER_SUMMARY,
                        subView: OrderSummarySubViews.INIT,
                    },
                },
            });
        }
    }, [paymentMethod]);
    reactExports.useEffect(() => sendPageView(SaleWidgetViews.PAYMENT_METHODS), []); // checkoutPrimarySalePaymentMethodsViewed
    reactExports.useEffect(() => {
        if (!invalidParameters)
            return;
        goToErrorView(SaleErrorTypes.INVALID_PARAMETERS);
    }, [invalidParameters]);
    return (jsx(SimpleLayout, { testId: "payment-methods", header: (jsx(HeaderNavigation, { onCloseButtonClick: () => sendCloseEvent(SaleWidgetViews.PAYMENT_METHODS) })), footer: jsx(FooterLogo, {}), children: jsxs(Box, { sx: {
                display: 'flex',
                flexDirection: 'column',
                paddingX: 'base.spacing.x2',
                paddingY: 'base.spacing.x8',
                rowGap: 'base.spacing.x4',
            }, children: [jsx(Heading, { size: "small", sx: {
                        paddingX: 'base.spacing.x4',
                    }, children: t('views.PAYMENT_METHODS.header.heading') }), jsx(Box, { sx: { paddingX: 'base.spacing.x2' }, children: jsx(PaymentOptions, { hideDisabledOptions: hideExcludedPaymentTypes, disabledOptions: disabledPaymentTypes, onClick: handleOptionClick }) })] }) }));
}

function SaleErrorView({ biomeTheme, transactionHash, blockExplorerLink, errorType, }) {
    const { t } = useTranslation();
    const { goBackToPaymentMethods, executeNextTransaction, signResponse, environment, provider, } = useSaleContext();
    const { sendTransactionSuccessEvent, sendFailedEvent } = useSaleEvent();
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { eventTargetState: { eventTarget }, } = reactExports.useContext(EventTargetContext);
    const { addHandover, closeHandover } = useHandover({
        id: HandoverTarget.GLOBAL,
    });
    const { onTxnStepExecuteNextTransaction } = useHandoverSteps(environment);
    const [currentErrorType, setCurrentErrorType] = reactExports.useState(errorType);
    const closeWidget = () => {
        sendSaleWidgetCloseEvent(eventTarget);
    };
    const retryLastTransaction = () => {
        try {
            executeNextTransaction((txn) => {
                sendTransactionSuccessEvent(txn);
                viewDispatch({
                    payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: {
                            type: SaleWidgetViews.PAY_WITH_COINS,
                        },
                    },
                });
            }, (err, txns) => {
                const details = {
                    transactionId: signResponse?.transactionId,
                };
                sendFailedEvent(err.toString(), err, txns, undefined, details);
                setCurrentErrorType(SaleErrorTypes.TRANSACTION_FAILED);
            }, onTxnStepExecuteNextTransaction);
        }
        catch (error) {
            setCurrentErrorType(SaleErrorTypes.SERVICE_BREAKDOWN);
        }
    };
    const errorHandlersConfig = {
        [SaleErrorTypes.TRANSACTION_FAILED]: {
            onActionClick: () => {
                closeHandover();
                goBackToPaymentMethods();
            },
            onSecondaryActionClick: transactionHash
                ? () => {
                    window.open(blockExplorerLink);
                }
                : closeWidget,
            statusType: StatusType.FAILURE,
            statusIconStyles: {
                fill: biomeTheme.color.status.fatal.dim,
            },
        },
        [SaleErrorTypes.SERVICE_BREAKDOWN]: {
            onSecondaryActionClick: closeWidget,
            statusType: StatusType.INFORMATION,
            statusIconStyles: {
                fill: biomeTheme.color.status.fatal.dim,
            },
        },
        [SaleErrorTypes.PRODUCT_NOT_FOUND]: {
            onSecondaryActionClick: closeWidget,
            statusType: StatusType.INFORMATION,
            statusIconStyles: {
                fill: biomeTheme.color.status.fatal.dim,
            },
        },
        [SaleErrorTypes.INSUFFICIENT_STOCK]: {
            onSecondaryActionClick: closeWidget,
            statusType: StatusType.INFORMATION,
            statusIconStyles: {
                fill: biomeTheme.color.status.fatal.dim,
            },
        },
        [SaleErrorTypes.TRANSAK_FAILED]: {
            onActionClick: () => {
                closeHandover();
                goBackToPaymentMethods();
            },
            onSecondaryActionClick: closeWidget,
            statusType: StatusType.INFORMATION,
        },
        [SaleErrorTypes.WALLET_FAILED]: {
            onActionClick: () => {
                if (isPassportProvider(provider)) {
                    retryLastTransaction();
                }
                else {
                    closeHandover();
                    goBackToPaymentMethods();
                }
            },
            onSecondaryActionClick: closeWidget,
            statusType: StatusType.INFORMATION,
            statusIconStyles: {
                fill: biomeTheme.color.status.fatal.dim,
            },
        },
        [SaleErrorTypes.WALLET_REJECTED_NO_FUNDS]: {
            onActionClick: () => {
                closeHandover();
                goBackToPaymentMethods();
            },
            onSecondaryActionClick: closeWidget,
            statusType: StatusType.INFORMATION,
        },
        [SaleErrorTypes.WALLET_REJECTED]: {
            onActionClick: () => {
                if (isPassportProvider(provider)) {
                    retryLastTransaction();
                }
                else {
                    closeHandover();
                    goBackToPaymentMethods();
                }
            },
            onSecondaryActionClick: closeWidget,
            statusType: StatusType.INFORMATION,
        },
        [SaleErrorTypes.WALLET_POPUP_BLOCKED]: {
            onActionClick: () => {
                if (isPassportProvider(provider)) {
                    retryLastTransaction();
                }
                else {
                    closeHandover();
                    goBackToPaymentMethods();
                }
            },
            onSecondaryActionClick: closeWidget,
            statusType: StatusType.INFORMATION,
        },
        [SaleErrorTypes.FUNDING_ROUTE_EXECUTE_ERROR]: {
            onActionClick: () => {
                closeHandover();
                goBackToPaymentMethods();
            },
            onSecondaryActionClick: closeWidget,
            statusType: StatusType.INFORMATION,
        },
        [SaleErrorTypes.INVALID_PARAMETERS]: {
            onSecondaryActionClick: closeWidget,
            statusType: StatusType.ALERT,
            statusIconStyles: {
                fill: biomeTheme.color.status.attention.dim,
                transform: 'none',
            },
        },
        [SaleErrorTypes.DEFAULT]: {
            onActionClick: () => {
                closeHandover();
                goBackToPaymentMethods();
            },
            onSecondaryActionClick: closeWidget,
            statusType: StatusType.INFORMATION,
        },
    };
    const getErrorViewProps = () => {
        const handlers = errorHandlersConfig[currentErrorType || SaleErrorTypes.DEFAULT] || {};
        const secondaryButtonText = currentErrorType === SaleErrorTypes.TRANSACTION_FAILED && transactionHash
            ? t(`views.SALE_FAIL.errors.${currentErrorType}.secondaryAction`)
            : t(`views.SALE_FAIL.errors.${SaleErrorTypes.DEFAULT}.secondaryAction`);
        return {
            headingText: t('views.PAYMENT_METHODS.handover.error.heading'),
            subheadingText: t(`views.SALE_FAIL.errors.${currentErrorType}.description`),
            primaryButtonText: t(`views.SALE_FAIL.errors.${currentErrorType}.primaryAction`),
            onPrimaryButtonClick: handlers?.onActionClick,
            secondaryButtonText,
            onSecondaryButtonClick: handlers?.onSecondaryActionClick,
        };
    };
    reactExports.useEffect(() => {
        if (!environment || !currentErrorType)
            return;
        addHandover({
            animationUrl: getRemoteRive(environment, getRiveAnimationName(TransactionMethod.APPROVE)),
            inputValue: StateMachineInput.ERROR,
            children: jsx(HandoverContent, { ...getErrorViewProps() }),
        });
    }, [currentErrorType, environment]);
    return null;
}

function SelectCoinDropdown({ balance, conversions, isFreeMint, canOpen, onClick, onProceed, loading, priceDisplay, }) {
    const { t } = useTranslation();
    const { environment, config: { theme }, } = useSaleContext();
    const { token, userBalance, fundsRequired } = balance.fundingItem;
    const fiatAmount = calculateCryptoToFiat(fundsRequired.formattedAmount, token.symbol, conversions, '');
    const balanceFiatAmount = calculateCryptoToFiat(userBalance.formattedBalance, token.symbol, conversions, '');
    const displayDropdown = !isFreeMint;
    return (jsxs(Stack, { sx: {
            w: '100%',
            bradtl: 'base.borderRadius.x6',
            bradtr: 'base.borderRadius.x6',
            px: 'base.spacing.x4',
            pt: (displayDropdown ? '0' : 'base.spacing.x6'),
            pb: 'base.spacing.x6',
            bg: 'base.color.neutral.800',
            border: '0px solid transparent',
            borderTopWidth: 'base.border.size.100',
            borderTopColor: 'base.color.translucent.emphasis.400',
        }, children: [displayDropdown && (jsxs(MenuItem, { size: "medium", children: [jsx(MenuItem.FramedImage, { circularFrame: true, use: (jsx(TokenImage, { environment: environment, theme: theme, name: token.name, src: token.icon })) }), jsx(MenuItem.Label, { children: t(`views.ORDER_SUMMARY.orderReview.payWith.${balance.type}`, {
                            symbol: token.symbol,
                        }) }), jsx(MenuItem.Caption, { children: `${t('views.ORDER_SUMMARY.orderReview.balance', {
                            amount: prettyFormatNumber(tokenValueFormat(userBalance.formattedBalance)),
                        })} ${balanceFiatAmount
                            ? t('views.ORDER_SUMMARY.currency.fiat', {
                                amount: prettyFormatNumber(tokenValueFormat(balanceFiatAmount)),
                            })
                            : ''}` }), priceDisplay && (jsx(MenuItem.PriceDisplay, { fiatAmount: fiatAmount
                            ? t('views.ORDER_SUMMARY.currency.fiat', { amount: fiatAmount })
                            : undefined, price: tokenValueFormat(fundsRequired.formattedAmount) })), canOpen && (jsx(MenuItem.StatefulButtCon, { icon: "ChevronExpand", onClick: onClick })), !canOpen && loading && jsx(ShimmerCircle, { radius: "base.icon.size.400" })] })), jsx(Button, { size: "large", onClick: () => onProceed(balance), children: isFreeMint ? (t('views.ORDER_SUMMARY.orderReview.continueFreeMint')) : (t('views.ORDER_SUMMARY.orderReview.continue')) })] }));
}

const getTotalFeesBySymbol = (fees, tokenInfo) => fees
    .filter((fee) => fee.amount.gt(0) && fee.token)
    .reduce((acc, fee) => {
    if (!fee.token)
        return acc;
    const token = {
        ...fee.token,
        address: fee.token.address || '',
        symbol: fee.token.symbol || tokenInfo?.symbol || '',
    };
    const address = abbreviateWalletAddress(token.address, '...').toLowerCase();
    const key = token.symbol || address;
    if (!key)
        return acc;
    if (acc[key]) {
        const newAmount = acc[key].amount.add(fee.amount);
        return {
            ...acc,
            [key]: {
                ...acc[key],
                amount: newAmount,
                formattedAmount: formatUnits(newAmount, token.decimals),
            },
        };
    }
    if (key) {
        return {
            ...acc,
            [key]: {
                ...fee,
                token,
                formattedAmount: formatUnits(fee.amount, token.decimals),
            },
        };
    }
    return acc;
}, {});
const getFundingBalanceTotalFees = (balance) => {
    if (balance.type !== FundingStepType.SWAP) {
        return {};
    }
    const fees = [
        balance.fees.approvalGasFee,
        balance.fees.swapGasFee,
        ...balance.fees.swapFees,
    ];
    const totalFees = getTotalFeesBySymbol(fees, balance.fundingItem.token);
    return totalFees;
};
const getFundingBalanceFeeBreakDown = (balance, conversions, t) => {
    const feesBreakdown = [];
    if (balance.type !== FundingStepType.SWAP) {
        return [];
    }
    const addFee = (fee, label, prefix = '~ ') => {
        if (fee.amount.gt(0)) {
            const formattedFee = formatUnits(fee.amount, fee?.token?.decimals);
            feesBreakdown.push({
                label,
                fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${calculateCryptoToFiat(formattedFee, fee.token?.symbol || '', conversions, '-.--', 4)}`,
                amount: `${tokenValueFormat(formattedFee)}`,
                prefix,
                token: fee?.token,
            });
        }
    };
    // Format gas fee
    addFee(balance.fees.swapGasFee, t('drawers.feesBreakdown.fees.swapGasFee.label'));
    // Format gas fee approval
    addFee(balance.fees.approvalGasFee, t('drawers.feesBreakdown.fees.approvalFee.label'));
    // Format the secondary fees
    const totalSwapFeesBySymbol = Object.entries(getTotalFeesBySymbol(balance.fees.swapFees, balance.fundingItem.token));
    totalSwapFeesBySymbol.forEach(([, swapFee]) => {
        const basisPoints = swapFee?.basisPoints ?? 0;
        addFee(swapFee, t('drawers.feesBreakdown.fees.swapSecondaryFee.label', {
            amount: basisPoints ? `${basisPoints / 100}%` : '',
        }), '');
    });
    return feesBreakdown;
};

function CoinsDrawerItem({ rc = jsx("span", {}), balance, conversions, selected, onClick, size, environment, theme, }) {
    const { t } = useTranslation();
    const { token, userBalance } = balance.fundingItem;
    const fiatAmount = calculateCryptoToFiat(userBalance.formattedBalance, token.symbol, conversions, '');
    const fees = Object.entries(getFundingBalanceTotalFees(balance));
    const menuProps = {
        onClick,
        selected,
    };
    return (jsxs(MenuItem, { rc: rc, sx: { mb: 'base.spacing.x1' }, size: size, emphasized: true, ...menuProps, children: [jsx(MenuItem.FramedImage, { circularFrame: true, alt: token.name, use: (jsx(TokenImage, { environment: environment, theme: theme, name: token.name, src: token.icon })) }), jsx(MenuItem.PriceDisplay, { fiatAmount: fiatAmount
                    ? t('views.ORDER_SUMMARY.currency.fiat', { amount: fiatAmount })
                    : undefined, price: tokenValueFormat(userBalance.formattedBalance) }), jsx(MenuItem.Label, { sx: { display: 'flex', wordBreak: 'default' }, children: token.symbol }), jsx(MenuItem.Caption, { children: fees.length > 0
                    && fees.map(([key, { token: tokenInfo, formattedAmount }]) => (jsx(Box, { rc: jsx("span", {}), sx: { d: 'block' }, children: t('views.ORDER_SUMMARY.coinsDrawer.fee', {
                            symbol: tokenInfo?.symbol || key,
                            amount: prettyFormatNumber(tokenValueFormat(formattedAmount)),
                        }) }, key))) })] }));
}

function CoinsDrawer({ conversions, balances, selectedIndex, visible, loading, transactionRequirement, onClose, onSelect, onPayWithCard, disabledPaymentTypes, theme, environment, }) {
    const { t } = useTranslation();
    const handleOnclick = (index) => () => {
        onSelect(index);
        onClose();
    };
    let size = 'medium';
    if (balances.length > 3) {
        size = 'small';
    }
    const otherPaymentOptions = [SalePaymentTypes.DEBIT, SalePaymentTypes.CREDIT];
    const withOtherOptions = !otherPaymentOptions.every((type) => disabledPaymentTypes?.includes(type));
    return (jsx(Drawer, { size: "full", visible: visible, showHeaderBar: true, onCloseDrawer: onClose, headerBarTitle: t('views.ORDER_SUMMARY.coinsDrawer.header'), children: jsx(Drawer.Content, { rc: jsx(motion.div, { variants: listVariants, initial: "hidden", animate: "show" }), children: jsxs(Box, { sx: {
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    px: 'base.spacing.x4',
                }, children: [jsxs(Box, { children: [jsxs(Box, { sx: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 'base.spacing.x2',
                                }, children: [jsx(Caption, { size: "small", children: t('views.ORDER_SUMMARY.coinsDrawer.caption1') }), jsx(Caption, { size: "small", children: t('views.ORDER_SUMMARY.coinsDrawer.caption2') })] }), balances?.map((balance, idx) => (jsx(CoinsDrawerItem, { onClick: handleOnclick(idx), balance: balance, selected: selectedIndex === idx, conversions: conversions, transactionRequirement: transactionRequirement, size: size, theme: theme, environment: environment, rc: jsx(motion.div, { variants: listItemVariants, custom: idx }) }, `${balance.fundingItem.token.symbol}-${balance.type}`))), loading && (jsx(motion.div, { variants: listItemVariants, custom: balances.length, children: jsx(MenuItem, { shimmer: true, emphasized: true, size: size, testId: "funding-balance-item-shimmer" }) }, "funding-balance-item-shimmer"))] }), onPayWithCard && (jsxs(Box, { sx: { pb: 'base.spacing.x4' }, rc: (jsx(motion.div, { variants: listItemVariants, custom: balances.length + (loading ? 1 : 0) })), children: [withOtherOptions && (jsx(Divider, { size: "small", rc: jsx(Caption, {}), sx: { my: 'base.spacing.x4' }, children: t('views.ORDER_SUMMARY.coinsDrawer.divider') })), jsx(PaymentOptions, { onClick: onPayWithCard, size: size, hideDisabledOptions: true, paymentOptions: otherPaymentOptions, disabledOptions: disabledPaymentTypes, captions: {
                                    [SalePaymentTypes.DEBIT]: t('views.PAYMENT_METHODS.options.debit.caption'),
                                    [SalePaymentTypes.CREDIT]: t('views.PAYMENT_METHODS.options.credit.caption'),
                                } })] }))] }) }) }));
}

function OrderItem({ item, balance, pricing, conversions, size, sx, rc = jsx("span", {}), }) {
    const { t } = useTranslation();
    const { token } = balance.fundingItem;
    const amount = pricing?.amount || 0;
    const fiatAmount = calculateCryptoToFiat(amount.toString(), token.symbol, conversions);
    return (jsxs(MenuItem, { rc: rc, emphasized: true, size: size || 'medium', sx: {
            pointerEvents: 'none',
            mb: 'base.spacing.x1',
            ...sx,
        }, children: [jsx(MenuItem.FramedImage, { use: jsx(TokenImage, { src: item.image, name: item.name, defaultImage: item.image }) }), jsx(MenuItem.Label, { children: item.name }), jsx(MenuItem.Caption, { children: t('views.ORDER_SUMMARY.orderItem.quantity', { qty: item.qty }) }), amount > 0 && (jsx(MenuItem.PriceDisplay, { price: t('views.ORDER_SUMMARY.currency.price', {
                    symbol: token.symbol,
                    amount: tokenValueFormat(amount),
                }), fiatAmount: t('views.ORDER_SUMMARY.currency.fiat', {
                    amount: fiatAmount,
                }) }))] }, item.name));
}

const getPricingBySymbol = (symbol, prices, conversions) => {
    if (!prices) {
        return undefined;
    }
    const lowerSymbol = symbol.toLowerCase();
    const lowerSymbolOverride = tokenSymbolNameOverrides[lowerSymbol]?.toLowerCase();
    // try to find pricing from config
    const pricing = Object.values(prices).find((p) => [lowerSymbol, lowerSymbolOverride].includes(p.currency.toLowerCase()));
    if (pricing) {
        return pricing;
    }
    // try to compute pricing from USDC conversion
    const conversion = conversions.get(lowerSymbol) || conversions.get(lowerSymbolOverride);
    if (conversion && prices.USDC) {
        return {
            currency: symbol,
            type: prices.USDC.type,
            amount: prices.USDC.amount / conversion,
        };
    }
    return undefined;
};

const withFeesSx = {
    mb: '0',
    bradbl: '0',
    bradbr: '0',
};
function OrderItems({ items, balance, pricing, conversions, children: feesChildren, }) {
    return (jsxs(Box, { rc: jsx(motion.div, { variants: listVariants, initial: "hidden", animate: "show" }), children: [items.map((item, idx) => (jsx(OrderItem, { item: item, balance: balance, conversions: conversions, size: items.length >= 3 ? 'small' : 'medium', pricing: getPricingBySymbol(balance.fundingItem.token.symbol, pricing?.[item.productId]?.pricing, conversions), sx: idx === items.length - 1 && feesChildren ? withFeesSx : undefined, rc: jsx(motion.div, { variants: listItemVariants, custom: idx }) }, item.name))), feesChildren] }));
}

function OrderFees({ sx, fees, onFeesClick }) {
    return (jsx(Fees, { gasFeeFiatValue: fees.fiatAmount, gasFeeToken: fees.token, gasFeeValue: fees.amount, fees: fees.formattedFees, onFeesClick: onFeesClick, sx: sx, loading: false }));
}

function OrderReview({ fundingBalances, conversions, collectionName, loadingBalances, transactionRequirement, onBackButtonClick, onPayWithCard, onProceedToBuy, gasFees, }) {
    const { eventTargetState: { eventTarget }, } = reactExports.useContext(EventTargetContext);
    const { t } = useTranslation();
    const { provider, items, orderQuote, disabledPaymentTypes, selectedCurrency, config: { theme, environment }, } = useSaleContext();
    const { sendSelectedPaymentToken, sendViewFeesEvent, sendPageView } = useSaleEvent();
    const [showCoinsDrawer, setShowCoinsDrawer] = reactExports.useState(false);
    const [selectedCurrencyIndex, setSelectedCurrencyIndex] = reactExports.useState(0);
    const [transactionFees, setTransactionFees] = reactExports.useState({
        token: undefined,
        amount: '',
        fiatAmount: '',
        formattedFees: [],
    });
    const isFreeMint = selectedCurrency?.name ? orderQuote.totalAmount[selectedCurrency.name].amount === 0 : false;
    const openDrawer = () => {
        setShowCoinsDrawer(true);
    };
    const closeDrawer = () => {
        setShowCoinsDrawer(false);
    };
    const onSelect = (selectedIndex) => {
        setSelectedCurrencyIndex(selectedIndex);
        sendSelectedPaymentToken(OrderSummarySubViews.REVIEW_ORDER, fundingBalances[selectedIndex], conversions);
        // checkoutPrimarySalePaymentTokenSelected
    };
    const fundingBalance = reactExports.useMemo(() => fundingBalances[selectedCurrencyIndex], [fundingBalances, selectedCurrencyIndex, provider]);
    reactExports.useEffect(() => {
        if (!conversions?.size || !provider) {
            return;
        }
        if (fundingBalance.type !== FundingStepType.SWAP) {
            return;
        }
        const [[, fee]] = Object.entries(getFundingBalanceTotalFees(fundingBalance));
        if (!fee || !fee.token) {
            return;
        }
        setTransactionFees({
            token: fee.token,
            amount: fee.formattedAmount,
            fiatAmount: calculateCryptoToFiat(fee.formattedAmount, fee.token.symbol, conversions),
            formattedFees: getFundingBalanceFeeBreakDown(fundingBalance, conversions, t),
        });
    }, [fundingBalance, conversions, provider]);
    reactExports.useEffect(() => {
        if (fundingBalance.type === FundingStepType.SWAP) {
            return;
        }
        if (!gasFees || gasFees.balance.lte(0)) {
            return;
        }
        const fiatAmount = calculateCryptoToFiat(gasFees.formattedBalance, gasFees.token.symbol, conversions);
        setTransactionFees({
            token: gasFees.token,
            amount: gasFees.formattedBalance,
            fiatAmount,
            formattedFees: [
                {
                    label: t('drawers.feesBreakdown.fees.gasFeeMove.label'),
                    fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${fiatAmount}`,
                    amount: `${tokenValueFormat(gasFees.formattedBalance)}`,
                    prefix: '~ ',
                    token: gasFees.token,
                },
            ],
        });
    }, [gasFees, fundingBalance, conversions]);
    // Trigger page loaded event
    useMount(() => {
        const tokens = fundingBalances.map((fb) => getPaymentTokenDetails(fb, conversions));
        sendPageView(SaleWidgetViews.ORDER_SUMMARY, {
            subView: OrderSummarySubViews.REVIEW_ORDER,
            tokens,
            items,
            collectionName,
        });
        // checkoutPrimarySaleOrderSummaryViewed
    }, () => Boolean(items.length
        && fundingBalances.length
        && !loadingBalances
        && conversions.size), [items, fundingBalances, loadingBalances, conversions]);
    const multiple = items.length > 1;
    const withFees = transactionFees.formattedFees.length > 0;
    return (jsxs(SimpleLayout, { testId: "order-review", header: (jsx(HeaderNavigation, { showBack: true, onCloseButtonClick: () => sendSaleWidgetCloseEvent(eventTarget), onBackButtonClick: onBackButtonClick, title: collectionName })), bodyStyleOverrides: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '0',
        }, children: [jsx(Heading, { size: "small", sx: {
                    px: 'base.spacing.x4',
                    pb: 'base.spacing.x4',
                }, children: t('views.ORDER_SUMMARY.orderReview.heading') }), jsx(Box, { sx: {
                    display: 'flex',
                    flexDirection: 'column',
                    px: 'base.spacing.x2',
                    pb: 'base.spacing.x8',
                    flex: 1,
                    maxh: withFees ? '45%' : '60%',
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                    rowGap: 'base.spacing.x4',
                }, children: jsx(Box, { sx: { px: 'base.spacing.x2' }, children: jsx(OrderItems, { items: items, balance: fundingBalance, pricing: orderQuote.products, conversions: conversions, children: !multiple && withFees && (jsx(OrderFees, { fees: transactionFees, sx: {
                                bradtl: '0',
                                bradtr: '0',
                                brad: 'base.borderRadius.x6',
                                border: '0px solid transparent',
                                borderTopWidth: 'base.border.size.200',
                                borderTopColor: 'base.color.translucent.inverse.1000',
                            }, onFeesClick: () => sendViewFeesEvent(SaleWidgetViews.ORDER_SUMMARY) })) }) }) }), multiple && withFees && (jsx(OrderFees, { fees: transactionFees, sx: {
                    mb: '-12px',
                    bradtl: 'base.borderRadius.x6',
                    bradtr: 'base.borderRadius.x6',
                    border: '0px solid transparent',
                    borderTopWidth: 'base.border.size.100',
                    borderTopColor: 'base.color.translucent.emphasis.400',
                }, onFeesClick: () => sendViewFeesEvent(SaleWidgetViews.ORDER_SUMMARY) })), jsx(SelectCoinDropdown, { onClick: openDrawer, onProceed: onProceedToBuy, balance: fundingBalance, conversions: conversions, isFreeMint: isFreeMint, canOpen: fundingBalances.length > 1, loading: loadingBalances, priceDisplay: items.length > 1 }), jsx(CoinsDrawer, { conversions: conversions, balances: fundingBalances, onSelect: onSelect, onClose: closeDrawer, selectedIndex: selectedCurrencyIndex, visible: showCoinsDrawer, loading: loadingBalances, onPayWithCard: onPayWithCard, transactionRequirement: transactionRequirement, disabledPaymentTypes: disabledPaymentTypes, theme: theme, environment: environment })] }));
}

const MAX_GAS_LIMIT = '30000000';
const getERC20ItemRequirement = (amount, spenderAddress, tokenAddress) => [
    {
        type: ItemType.ERC20,
        tokenAddress,
        spenderAddress,
        amount,
    },
];
const getGasEstimate = () => ({
    type: TransactionOrGasType.GAS,
    gasToken: {
        type: GasTokenType.NATIVE,
        limit: BigNumber.from(MAX_GAS_LIMIT),
    },
});
const wrapPromisesWithOnResolve = async (awaitedFns, onResolve) => {
    const promises = awaitedFns.map(async (fn) => {
        const value = await fn;
        onResolve(value);
        return value;
    });
    return await Promise.all(promises);
};
const getTokenInfoFromRequirement = (req) => (req.current.type !== ItemType.ERC721 && req.current.token); // eslint-disable-line
const getTokenInfo = (tokenInfo, environment) => {
    const address = isNativeToken(tokenInfo.address)
        ? tokenInfo.symbol
        : tokenInfo.address ?? '';
    return {
        ...tokenInfo,
        icon: tokenInfo.icon ?? getTokenImageByAddress(environment, address),
    };
};
const getSufficientFundingStep = (requirement, environment) => ({
    type: FundingBalanceType.SUFFICIENT,
    fundingItem: {
        type: ItemType.ERC20,
        token: getTokenInfo(getTokenInfoFromRequirement(requirement), environment),
        fundsRequired: {
            amount: requirement.required.balance,
            formattedAmount: requirement.required.formattedBalance,
        },
        userBalance: {
            balance: requirement.current.balance,
            formattedBalance: requirement.current.formattedBalance,
        },
    },
});
const getAlternativeFundingSteps = (fundingRoutes, environment) => {
    if (fundingRoutes.length === 0) {
        return [];
    }
    const routes = fundingRoutes.filter((route) => route.steps.length === 1);
    const tokens = [ItemType.ERC20, ItemType.NATIVE];
    const steps = routes.flatMap((route) => route.steps.filter((step) => tokens.includes(step.fundingItem.type)));
    return steps.map((step) => ({
        ...step,
        fundingItem: {
            ...step.fundingItem,
            token: getTokenInfo(step.fundingItem.token, environment),
        },
    }));
};
const getFundingBalances = (smartCheckoutResult, environment) => {
    if (smartCheckoutResult.sufficient === true) {
        const erc20Req = smartCheckoutResult.transactionRequirements.find((req) => req.type === ItemType.ERC20);
        if (erc20Req && erc20Req.type === ItemType.ERC20) {
            return [getSufficientFundingStep(erc20Req, environment)];
        }
    }
    if (smartCheckoutResult.sufficient === false
        && smartCheckoutResult?.router?.routingOutcome.type
            === RoutingOutcomeType.ROUTES_FOUND) {
        return getAlternativeFundingSteps(smartCheckoutResult.router.routingOutcome.fundingRoutes, environment);
    }
    return null;
};
const getFnToSortFundingBalancesByPriority = (baseSymbol) => (a, b) => {
    const aIsBase = a.fundingItem
        && a.fundingItem.token
        && a.fundingItem.token.symbol === baseSymbol
        ? -1
        : 0;
    const bIsBase = b.fundingItem
        && b.fundingItem.token
        && b.fundingItem.token.symbol === baseSymbol
        ? -1
        : 0;
    if (aIsBase !== bIsBase) {
        return aIsBase - bIsBase;
    }
    if (a.type === FundingBalanceType.SUFFICIENT
        && b.type === FundingBalanceType.SUFFICIENT) {
        return 0;
    }
    if (a.type === FundingBalanceType.SUFFICIENT) {
        return -1;
    }
    if (b.type === FundingBalanceType.SUFFICIENT) {
        return 1;
    }
    return 0;
};
const getFnToPushAndSortFundingBalances = (baseCurrency) => {
    let currentBalances = [];
    const sortByBaseAndPriority = getFnToSortFundingBalancesByPriority(baseCurrency.name);
    return (newBalances) => {
        if (newBalances.length === 0) {
            return currentBalances;
        }
        currentBalances = Array.from(new Set([...currentBalances, ...newBalances])).sort(sortByBaseAndPriority);
        return currentBalances;
    };
};
const getZeroFee = (fee) => ({
    ...fee,
    amount: BigNumber.from(0),
    formattedAmount: '0',
});
const getGasFreeBalanceAdjustment = (balance, provider) => {
    if (balance.type !== FundingStepType.SWAP) {
        return balance;
    }
    if (!isGasFree(provider)) {
        return balance;
    }
    const adjustedFees = {
        ...balance.fees,
        approvalGasFee: getZeroFee(balance.fees.approvalGasFee),
        swapGasFee: getZeroFee(balance.fees.swapGasFee),
    };
    return {
        ...balance,
        fees: adjustedFees,
    };
};
const processGasFreeBalances = (balances, provider) => balances.map((balance) => getGasFreeBalanceAdjustment(balance, provider));

const isTokenFee = (balance) => 'token' in balance && balance.token !== undefined;
const fetchFundingBalances = async (params) => {
    const { provider, checkout, currencies, baseCurrency, onFundingBalance, getAmountByCurrency, getIsGasless, onComplete, onFundingRequirement, onUpdateGasFees, } = params;
    const signer = provider?.getSigner();
    const spenderAddress = (await signer?.getAddress()) || '';
    const environment = checkout.config.environment;
    const pushToFoundBalances = getFnToPushAndSortFundingBalances(baseCurrency);
    const updateFundingBalances = (balances) => {
        if (Array.isArray(balances) && balances.length > 0) {
            onFundingBalance(pushToFoundBalances(processGasFreeBalances(balances, provider)));
        }
    };
    const isBaseCurrency = (name) => compareStr(name, baseCurrency.name);
    const balancePromises = currencies
        .map(async (currency) => {
        const amount = getAmountByCurrency(currency);
        if (!amount) {
            return null;
        }
        const itemRequirements = getERC20ItemRequirement(amount, spenderAddress, currency.address);
        const transactionOrGasAmount = getIsGasless()
            ? undefined
            : getGasEstimate();
        const handleOnComplete = () => {
            onComplete?.(pushToFoundBalances([]));
        };
        const handleOnFundingRoute = (route) => {
            updateFundingBalances(getAlternativeFundingSteps([route], environment));
        };
        const smartCheckoutResult = await checkout.smartCheckout({
            provider,
            itemRequirements,
            transactionOrGasAmount,
            routingOptions: { bridge: false, onRamp: false, swap: true },
            fundingRouteFullAmount: true,
            onComplete: isBaseCurrency(currency.name)
                ? handleOnComplete
                : undefined,
            onFundingRoute: isBaseCurrency(currency.name)
                ? handleOnFundingRoute
                : undefined,
        });
        return { currency, smartCheckoutResult };
    })
        .filter(Boolean);
    return await wrapPromisesWithOnResolve(balancePromises, ({ currency, smartCheckoutResult }) => {
        if (isBaseCurrency(currency.name)) {
            const fundingItemRequirement = smartCheckoutResult.transactionRequirements[0];
            onFundingRequirement(fundingItemRequirement);
        }
        if (smartCheckoutResult.sufficient) {
            updateFundingBalances(getFundingBalances(smartCheckoutResult, environment));
            const feeRequirement = smartCheckoutResult.transactionRequirements.find((requirement) => requirement.isFee);
            if (feeRequirement && isTokenFee(feeRequirement.required) && onUpdateGasFees) {
                onUpdateGasFees(feeRequirement.required);
            }
        }
    });
};

const useFundingBalances = () => {
    const fetching = reactExports.useRef(false);
    const { fromTokenAddress, orderQuote, provider, checkout, selectedCurrency, } = useSaleContext();
    const { cryptoFiatState } = reactExports.useContext(CryptoFiatContext);
    const [transactionRequirement, setTransactionRequirement] = reactExports.useState();
    const [fundingBalances, setFundingBalances] = reactExports.useState([]);
    const [fundingBalancesResult, setFundingBalancesResult] = reactExports.useState([]);
    const [loadingBalances, setLoadingBalances] = reactExports.useState(false);
    const [gasFees, setGasFees] = reactExports.useState();
    const queryFundingBalances = () => {
        if (!fromTokenAddress
            || !provider
            || !checkout
            || !orderQuote
            || !selectedCurrency)
            return;
        if (fetching.current || loadingBalances)
            return;
        (async () => {
            fetching.current = true;
            setLoadingBalances(true);
            try {
                const results = await fetchFundingBalances({
                    provider,
                    checkout,
                    currencies: orderQuote.currencies,
                    routingOptions: { bridge: false, onRamp: false, swap: true },
                    baseCurrency: selectedCurrency,
                    getAmountByCurrency: (currency) => {
                        const pricing = getPricingBySymbol(currency.name, orderQuote.totalAmount, cryptoFiatState.conversions);
                        return pricing ? pricing.amount.toString() : '';
                    },
                    getIsGasless: () => provider.provider?.isPassport || false,
                    onFundingBalance: (foundBalances) => {
                        setFundingBalances([...foundBalances]);
                    },
                    onComplete: () => {
                        setLoadingBalances(false);
                    },
                    onFundingRequirement: (requirement) => {
                        setTransactionRequirement(requirement);
                    },
                    onUpdateGasFees: (fees) => {
                        setGasFees(fees);
                    },
                });
                setFundingBalancesResult(results);
            }
            catch {
                setLoadingBalances(false);
            }
            finally {
                fetching.current = false;
            }
        })();
    };
    return {
        fundingBalances,
        loadingBalances,
        fundingBalancesResult,
        transactionRequirement,
        gasFees,
        queryFundingBalances,
    };
};

const tokenInfo = (req) => {
    if (req && req.current.type !== ItemType.ERC721) {
        return req.current.token;
    }
    return undefined;
};
const getTopUpViewData = (transactionRequirements) => {
    const native = transactionRequirements.find(({ type }) => type === ItemType.NATIVE);
    const erc20 = transactionRequirements.find(({ type }) => type === ItemType.ERC20);
    const balances = {
        erc20: {
            value: erc20?.delta.formattedBalance,
            symbol: tokenInfo(erc20)?.symbol,
        },
        native: {
            value: native?.delta.formattedBalance,
            symbol: tokenInfo(native)?.symbol,
        },
    };
    const heading = ['views.PAYMENT_METHODS.topUp.heading'];
    // default to insufficient ERC20
    let subheading = ['views.PAYMENT_METHODS.topUp.subheading.erc20', balances];
    let amount = erc20?.delta.formattedBalance || '0';
    let tokenAddress = tokenInfo(erc20)?.address;
    // if both NATIVE & ERC20 are insufficient
    if (native && erc20 && !native.sufficient && !erc20.sufficient) {
        subheading = ['views.PAYMENT_METHODS.topUp.subheading.both', balances];
    }
    // if only NATIVE is insufficient
    if (native && erc20 && !native.sufficient && erc20.sufficient) {
        amount = native?.delta.formattedBalance || '0';
        tokenAddress = tokenInfo(native)?.address;
        subheading = ['views.PAYMENT_METHODS.topUp.subheading.native', balances];
    }
    return {
        heading,
        subheading,
        amount,
        tokenAddress,
    };
};

var FundingRouteExecuteViews;
(function (FundingRouteExecuteViews) {
    FundingRouteExecuteViews["LOADING"] = "LOADING";
    FundingRouteExecuteViews["EXECUTE_SWAP"] = "EXECUTE_SWAP";
    FundingRouteExecuteViews["EXECUTE_BRIDGE"] = "EXECUTE_BRIDGE";
    FundingRouteExecuteViews["EXECUTE_ON_RAMP"] = "EXECUTE_ON_RAMP";
    FundingRouteExecuteViews["SWITCH_NETWORK_ETH"] = "SWITCH_NETWORK_ETH";
    FundingRouteExecuteViews["SWITCH_NETWORK_ZKEVM"] = "SWITCH_NETWORK_ZKEVM";
})(FundingRouteExecuteViews || (FundingRouteExecuteViews = {}));
function FundingRouteExecute({ fundingRouteStep, onFundingRouteExecuted, }) {
    const { t } = useTranslation();
    const { config, provider, checkout, fromTokenAddress: requiredTokenAddress, } = useSaleContext();
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { connectLoaderDispatch } = reactExports.useContext(ConnectLoaderContext);
    const [swapParams, setSwapParams] = reactExports.useState(undefined);
    const [bridgeParams, setBridgeParams] = reactExports.useState(undefined);
    const [onRampParams, setOnRampParams] = reactExports.useState(undefined);
    const [view, setView] = reactExports.useState(FundingRouteExecuteViews.LOADING);
    const nextView = reactExports.useRef(false);
    const stepSuccess = reactExports.useRef(undefined);
    const stepFailed = reactExports.useRef(undefined);
    const [eventTargetState, eventTargetDispatch] = reactExports.useReducer(eventTargetReducer, initialEventTargetState);
    const eventTargetReducerValues = reactExports.useMemo(() => ({ eventTargetState, eventTargetDispatch }), [eventTargetState, eventTargetDispatch]);
    const eventTarget = new EventTarget();
    const sendFailEvent = (errorData) => {
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SaleWidgetViews.SALE_FAIL,
                    data: {
                        errorType: SaleErrorTypes.FUNDING_ROUTE_EXECUTE_ERROR,
                        errorData,
                    },
                },
            },
        });
    };
    const handleStep = reactExports.useCallback(async (step) => {
        if (!checkout || !provider) {
            throw new Error('checkout or provider not available.');
        }
        const network = await checkout.getNetworkInfo({
            provider,
        });
        if (step.type === FundingStepType.BRIDGE) {
            setBridgeParams({
                tokenAddress: step.fundingItem.token.address,
                amount: step.fundingItem.fundsRequired.formattedAmount,
            });
            if (network.chainId === getL1ChainId(checkout.config)) {
                setView(FundingRouteExecuteViews.EXECUTE_BRIDGE);
                return;
            }
            nextView.current = FundingRouteExecuteViews.EXECUTE_BRIDGE;
            setView(FundingRouteExecuteViews.SWITCH_NETWORK_ETH);
        }
        if (step.type === FundingStepType.SWAP) {
            setSwapParams({
                amount: step.fundingItem.fundsRequired.formattedAmount,
                fromTokenAddress: step.fundingItem.token.address,
                toTokenAddress: requiredTokenAddress,
                autoProceed: true,
            });
            if (network.chainId === getL2ChainId(checkout.config)) {
                setView(FundingRouteExecuteViews.EXECUTE_SWAP);
                return;
            }
            nextView.current = FundingRouteExecuteViews.EXECUTE_SWAP;
            setView(FundingRouteExecuteViews.SWITCH_NETWORK_ZKEVM);
        }
        if (step.type === FundingStepType.ONRAMP) {
            setOnRampParams({
                amount: step.fundingItem.fundsRequired.formattedAmount,
                tokenAddress: step.fundingItem.token.address,
            });
            setView(FundingRouteExecuteViews.EXECUTE_ON_RAMP);
        }
    }, [provider, checkout]);
    reactExports.useEffect(() => {
        if (!fundingRouteStep) {
            return;
        }
        try {
            handleStep(fundingRouteStep);
        }
        catch (err) {
            sendFailEvent(err);
        }
    }, [fundingRouteStep]);
    const onCloseWidget = () => {
        // Need to check SUCCESS first, as it's possible for widget to emit both FAILED and SUCCESS.
        if (stepSuccess.current) {
            stepSuccess.current = undefined;
            stepFailed.current = undefined;
            onFundingRouteExecuted();
        }
        else {
            sendFailEvent(stepFailed.current);
        }
    };
    const handleCustomEvent = (event) => {
        switch (event.detail.type) {
            case SwapEventType.SUCCESS: {
                const successEvent = event.detail.data;
                stepSuccess.current = successEvent;
                onCloseWidget();
                break;
            }
            case BridgeEventType.TRANSACTION_SENT:
            case OnRampEventType.SUCCESS: {
                const successEvent = event.detail.data;
                stepSuccess.current = successEvent;
                break;
            }
            case BridgeEventType.FAILURE:
            case SwapEventType.FAILURE:
            case OnRampEventType.FAILURE: {
                // On FAILURE, widget will prompt user to try again.
                // We need to know if it failed though when they close the widget
                const failureEvent = event.detail.data;
                stepFailed.current = failureEvent;
                break;
            }
            case BridgeEventType.CLOSE_WIDGET:
            case SwapEventType.CLOSE_WIDGET:
            case OnRampEventType.CLOSE_WIDGET: {
                onCloseWidget();
                break;
            }
            case SwapEventType.REJECTED:
        }
    };
    const handleConnectEvent = (event) => {
        switch (event.detail.type) {
            case ConnectEventType.SUCCESS: {
                const eventData = event.detail.data;
                connectLoaderDispatch({
                    payload: {
                        type: ConnectLoaderActions.SET_PROVIDER,
                        provider: eventData.provider,
                    },
                });
                if (nextView.current !== false) {
                    setView(nextView.current);
                    nextView.current = false;
                }
                break;
            }
            case ConnectEventType.FAILURE:
            case ConnectEventType.CLOSE_WIDGET:
            default:
                onCloseWidget();
                break;
        }
    };
    reactExports.useEffect(() => {
        // Handle the connect event when switching networks
        eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT, handleConnectEvent);
        // Handle the other widget events
        eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, handleCustomEvent);
        eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT, handleCustomEvent);
        // Remove the custom event listener when the component unmounts
        return () => {
            eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT, handleConnectEvent);
            eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, handleCustomEvent);
            eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT, handleCustomEvent);
        };
    }, []);
    reactExports.useEffect(() => {
        eventTargetDispatch({
            payload: {
                type: EventTargetActions.SET_EVENT_TARGET,
                eventTarget,
            },
        });
    }, [checkout]);
    return (jsxs(EventTargetContext.Provider, { value: eventTargetReducerValues, children: [view === FundingRouteExecuteViews.LOADING && (jsx(LoadingView, { loadingText: t('views.ORDER_SUMMARY.loading.balances') })), view === FundingRouteExecuteViews.EXECUTE_BRIDGE && (jsx(BridgeWidget, { ...bridgeParams, config: config, checkout: checkout })), view === FundingRouteExecuteViews.EXECUTE_SWAP && (jsx(SwapWidget, { ...swapParams, config: config })), view === FundingRouteExecuteViews.EXECUTE_ON_RAMP && (jsx(OnRampWidget, { config: config, ...onRampParams })), view === FundingRouteExecuteViews.SWITCH_NETWORK_ETH && (jsx(ConnectWidget, { config: config, targetChainId: checkout.config.isProduction ? ChainId.ETHEREUM : ChainId.SEPOLIA, web3Provider: provider, checkout: checkout, deepLink: ConnectWidgetViews.SWITCH_NETWORK })), view === FundingRouteExecuteViews.SWITCH_NETWORK_ZKEVM && (jsx(ConnectWidget, { config: config, targetChainId: checkout.config.isProduction
                    ? ChainId.IMTBL_ZKEVM_MAINNET
                    : ChainId.IMTBL_ZKEVM_TESTNET, web3Provider: provider, checkout: checkout, deepLink: ConnectWidgetViews.SWITCH_NETWORK }))] }));
}

function LoadingHandover({ text, duration, animationUrl, inputValue = 0, }) {
    const { addHandover } = useHandover({
        id: HandoverTarget.GLOBAL,
    });
    useMount(() => {
        addHandover({
            duration,
            animationUrl,
            inputValue,
            children: jsx(Heading, { sx: { px: 'base.spacing.x6' }, children: text }),
        });
    });
    return null;
}

function OrderSummary({ subView }) {
    const { t } = useTranslation();
    const { sendProceedToPay, sendInsufficientFunds } = useSaleEvent();
    const { fromTokenAddress, collectionName, goToErrorView, goBackToPaymentMethods, sign, selectedCurrency, setPaymentMethod, environment, } = useSaleContext();
    const { viewDispatch, viewState } = reactExports.useContext(ViewContext);
    const { cryptoFiatDispatch, cryptoFiatState } = reactExports.useContext(CryptoFiatContext);
    const { addHandover, closeHandover } = useHandover({
        id: HandoverTarget.GLOBAL,
    });
    const onPayWithCard = (paymentType) => goBackToPaymentMethods(paymentType);
    const signAndProceed = (tokenAddress) => {
        addHandover({
            animationUrl: getRemoteRive(environment, getRiveAnimationName(TransactionMethod.APPROVE)),
            inputValue: transactionRiveAnimations[TransactionMethod.APPROVE].inputValues.start,
            children: (jsx(Heading, { sx: { px: 'base.spacing.x6' }, children: t('views.PAYMENT_METHODS.handover.initial') })),
        });
        sign(SignPaymentTypes.CRYPTO, tokenAddress);
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SaleWidgetViews.PAY_WITH_COINS,
                },
            },
        });
    };
    const onFundingRouteExecuted = () => {
        signAndProceed(selectedCurrency?.address);
    };
    const onProceedToBuy = (fundingBalance) => {
        const { type, fundingItem } = fundingBalance;
        sendProceedToPay(SaleWidgetViews.ORDER_SUMMARY, fundingBalance, cryptoFiatState.conversions);
        // checkoutPrimarySaleProceedToPay
        if (type === FundingBalanceType.SUFFICIENT) {
            signAndProceed(fundingItem.token.address);
            return;
        }
        closeHandover();
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SaleWidgetViews.ORDER_SUMMARY,
                    subView: OrderSummarySubViews.EXECUTE_FUNDING_ROUTE,
                    data: {
                        fundingBalance,
                        onFundingRouteExecuted,
                    },
                },
            },
        });
    };
    const { fundingBalances, loadingBalances, fundingBalancesResult, transactionRequirement, gasFees, queryFundingBalances, } = useFundingBalances();
    // Initialise funding balances
    reactExports.useEffect(() => {
        if (subView !== OrderSummarySubViews.INIT || !fromTokenAddress)
            return;
        queryFundingBalances();
    }, [subView, fromTokenAddress]);
    // If one or more balances found, go to Order Review
    reactExports.useEffect(() => {
        if (fundingBalances.length === 0)
            return;
        closeHandover();
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SaleWidgetViews.ORDER_SUMMARY,
                    subView: OrderSummarySubViews.REVIEW_ORDER,
                },
            },
        });
    }, [fundingBalances]);
    // If no balances, Go to Top Up View
    reactExports.useEffect(() => {
        if (loadingBalances || !fundingBalancesResult.length)
            return;
        if (fundingBalances.length > 0)
            return;
        try {
            // suggest to top up base currency balance
            const smartCheckoutResult = fundingBalancesResult.find((result) => result.currency.base)?.smartCheckoutResult;
            const data = getTopUpViewData(smartCheckoutResult.transactionRequirements);
            setPaymentMethod(undefined);
            // Send analytics event to track insufficient funds
            sendInsufficientFunds(SaleWidgetViews.ORDER_SUMMARY, data);
            closeHandover();
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: SharedViews.TOP_UP_VIEW,
                        data,
                    },
                },
            });
        }
        catch (error) {
            goToErrorView(SaleErrorTypes.SERVICE_BREAKDOWN, error);
        }
    }, [fundingBalances, loadingBalances, fundingBalancesResult]);
    // Refresh conversion rates, once all balances are loaded
    reactExports.useEffect(() => {
        if (!cryptoFiatDispatch
            || fundingBalances.length === 0
            || loadingBalances) {
            return;
        }
        const tokenSymbols = fundingBalances.map(({ fundingItem }) => fundingItem.token.symbol);
        cryptoFiatDispatch({
            payload: {
                type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
                tokenSymbols,
            },
        });
    }, [cryptoFiatDispatch, fundingBalances, loadingBalances]);
    return (jsxs(Box, { children: [subView === OrderSummarySubViews.INIT && (jsx(LoadingHandover, { text: t('views.ORDER_SUMMARY.loading.balances'), animationUrl: getRemoteRive(environment, '/preparing_order.riv'), inputValue: 0 })), subView === OrderSummarySubViews.REVIEW_ORDER && (jsx(OrderReview, { fundingBalances: fundingBalances, conversions: cryptoFiatState.conversions, collectionName: collectionName, loadingBalances: loadingBalances, onBackButtonClick: goBackToPaymentMethods, onProceedToBuy: onProceedToBuy, transactionRequirement: transactionRequirement, onPayWithCard: onPayWithCard, gasFees: gasFees })), subView === OrderSummarySubViews.EXECUTE_FUNDING_ROUTE && (jsx(FundingRouteExecute, { fundingRouteStep: viewState.view.data.fundingBalance, onFundingRouteExecuted: onFundingRouteExecuted }))] }));
}

function CreditCardWarningHero() {
    return (jsx(Box, { testId: "credit-card-warning-hero", children: jsx(Box, { children: jsxs("svg", { width: "430", height: "161", viewBox: "0 0 430 161", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsx("path", { d: "M172.973 133.128C171.472 132.262 170.399 130.653 170.399 128.67V91.134C170.399 87.4566 171.381 83.9165 173.158 80.8356C174.934 77.7546 177.509 75.137 180.697 73.2962L199.556 62.4057L231.623 44.1673C233.339 43.1761 235.27 43.3005 236.772 44.1673L229.34 39.8763C227.838 39.0095 225.907 38.8851 224.191 39.8763L192.124 58.1147L173.265 69.0052C170.077 70.8461 166.889 72.6253 165.112 75.7062C163.336 78.7872 162.967 83.1656 162.967 86.843V124.379C162.967 126.361 164.04 127.971 165.541 128.837L172.973 133.128Z", fill: "#F3F3F3", stroke: "#131313", strokeWidth: "1.64647", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M239.133 48.6725V85.9384C239.133 96.0882 236.344 99.3065 228.835 103.776L178.124 133.123C174.691 135.105 170.4 132.629 170.4 128.665V91.3985C170.4 82.7861 172.193 78.066 180.698 73.5609L231.409 44.2142C234.842 42.2317 239.133 44.7076 239.133 48.6725Z", fill: "#F3F3F3", stroke: "#131313", strokeWidth: "1.64647", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M172.973 133.127C171.472 132.26 170.399 130.651 170.399 128.668V91.3681C170.399 87.6907 170.631 83.7216 172.407 80.6406L164.975 76.3496C163.198 79.4306 162.967 83.3997 162.967 87.0771L162.967 124.377C162.967 126.36 164.04 127.969 165.541 128.836L172.973 133.127Z", fill: "#131313", stroke: "#131313", strokeWidth: "1.64647", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M170.261 125.267V114.74L239.346 75.0625V85.3194L170.261 125.267Z", fill: "#0D0D0D", stroke: "black", strokeWidth: "0.823233" }), jsxs("g", { clipPath: "url(#clip0_1548_70742)", children: [jsx("path", { d: "M228.362 71.9146C219.392 76.9925 219.392 93.5869 228.362 108.975C237.331 124.363 251.872 132.721 260.842 127.643L249.638 134.081C240.669 139.159 226.128 130.802 217.158 115.414C208.189 100.026 208.189 83.4311 217.158 78.3532L228.362 71.9146Z", fill: "black", stroke: "black", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M228.361 71.9146C219.392 76.9925 219.392 93.5869 228.361 108.975C237.331 124.363 251.872 132.721 260.841 127.643C269.811 122.565 269.811 105.97 260.841 90.5822C251.872 75.194 237.331 66.8367 228.361 71.9146ZM234.856 83.0619C239.099 80.6582 245.416 83.268 250.539 89.0026L232.165 99.4117C229.72 92.1618 230.612 85.4657 234.856 83.0619ZM254.343 116.5C250.1 118.904 243.782 116.294 238.659 110.559L257.034 100.15C259.479 107.4 258.586 114.096 254.343 116.5Z", fill: "#FAFD7E", stroke: "black", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M234.856 83.0618C239.099 80.658 245.417 83.2678 250.54 89.0024L232.165 99.4115C229.72 92.1617 230.613 85.4655 234.856 83.0618Z", fill: "#FAFD7E", stroke: "black", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M254.347 116.5C250.104 118.903 243.787 116.294 238.664 110.559L257.038 100.15C259.483 107.4 258.591 114.096 254.347 116.5Z", fill: "#FAFD7E", stroke: "black", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M232.165 99.4115C230.94 95.7844 230.552 92.299 231.001 89.4188C231.449 86.5386 232.734 84.2636 234.856 83.0618C236.977 81.8599 239.617 81.9114 242.368 82.9802L232.165 99.4115Z", fill: "black", stroke: "black", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("path", { d: "M246.835 116.581C244.084 115.513 241.225 113.426 238.664 110.559L247.853 105.357L257.042 100.154L246.84 116.586L246.835 116.581Z", fill: "black", stroke: "black", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })] }), jsx("defs", { children: jsx("clipPath", { id: "clip0_1548_70742", children: jsx("rect", { width: "58", height: "66", fill: "white", transform: "translate(210 70)" }) }) })] }) }) }));
}

function CreditCardWarningDrawer() {
    const { t } = useTranslation();
    const { showCreditCardWarning, setShowCreditCardWarning, setPaymentMethod } = useSaleContext();
    const handleCtaButtonClick = () => {
        setPaymentMethod(SalePaymentTypes.CREDIT);
    };
    return (jsx(Drawer, { size: "threeQuarter", visible: showCreditCardWarning, showHeaderBar: false, children: jsxs(Drawer.Content, { children: [jsx(ButtCon, { icon: "Close", variant: "tertiary", sx: {
                        pos: 'absolute',
                        top: 'base.spacing.x5',
                        left: 'base.spacing.x5',
                        backdropFilter: 'blur(30px)',
                    }, onClick: () => setShowCreditCardWarning(false) }), jsx(CreditCardWarningHero, {}), jsxs(Box, { sx: { px: 'base.spacing.x12' }, children: [jsx(Heading, { sx: {
                                marginTop: 'base.spacing.x6',
                                marginBottom: 'base.spacing.x2',
                                textAlign: 'center',
                            }, children: t('views.PAYMENT_METHODS.creditCardWarningDrawer.heading') }), jsx(Body, { size: "medium", sx: {
                                display: 'block',
                                textAlign: 'center',
                                color: 'base.color.text.body.secondary',
                                marginBottom: 'base.spacing.x13',
                            }, children: t('views.PAYMENT_METHODS.creditCardWarningDrawer.body') }), jsx(Button, { sx: { width: '100%' }, testId: "credit-card-button", variant: "primary", size: "large", onClick: handleCtaButtonClick, children: t('views.PAYMENT_METHODS.creditCardWarningDrawer.ctaButton') })] })] }) }));
}

function SaleWidget(props) {
    const { t } = useTranslation();
    const { config, items, environmentId, collectionName, excludePaymentTypes, excludeFiatCurrencies, preferredCurrency, hideExcludedPaymentTypes, waitFulfillmentSettlements = true, } = props;
    const { connectLoaderState } = reactExports.useContext(ConnectLoaderContext);
    const { checkout, provider } = connectLoaderState;
    const chainId = reactExports.useRef();
    const { eventTargetState: { eventTarget }, } = reactExports.useContext(EventTargetContext);
    const { theme } = config;
    const biomeTheme = reactExports.useMemo(() => widgetTheme(theme), [theme]);
    const [viewState, viewDispatch] = reactExports.useReducer(viewReducer, initialViewState);
    const viewReducerValues = reactExports.useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);
    const loadingText = viewState.view.data?.loadingText || t('views.LOADING_VIEW.text');
    reactExports.useEffect(() => {
        if (!checkout || !provider)
            return;
        (async () => {
            const network = await checkout.getNetworkInfo({ provider });
            chainId.current = network.chainId;
        })();
    }, [checkout, provider]);
    const mounted = reactExports.useRef(false);
    const onMount = reactExports.useCallback(() => {
        if (!checkout || !provider)
            return;
        if (!mounted.current) {
            mounted.current = true;
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: { type: SaleWidgetViews.PAYMENT_METHODS },
                },
            });
        }
    }, [checkout, provider]);
    reactExports.useEffect(() => {
        if (!checkout || !provider)
            return;
        onMount();
    }, [checkout, provider]);
    return (jsx(ViewContext.Provider, { value: viewReducerValues, children: jsx(SaleContextProvider, { value: {
                config,
                items,
                environment: config.environment,
                environmentId,
                provider,
                checkout,
                passport: checkout?.passport,
                collectionName,
                excludePaymentTypes,
                excludeFiatCurrencies,
                preferredCurrency,
                waitFulfillmentSettlements,
                hideExcludedPaymentTypes,
            }, children: jsxs(CryptoFiatProvider, { environment: config.environment, children: [viewState.view.type === SharedViews.LOADING_VIEW && (jsx(LoadingView, { loadingText: loadingText })), viewState.view.type === SaleWidgetViews.PAYMENT_METHODS && (jsx(PaymentMethods, {})), viewState.view.type === SaleWidgetViews.PAY_WITH_CARD && (jsx(PayWithCard, {})), viewState.view.type === SaleWidgetViews.PAY_WITH_COINS && (jsx(PayWithCoins, {})), viewState.view.type === SaleWidgetViews.SALE_FAIL && (jsx(SaleErrorView, { biomeTheme: biomeTheme, errorType: viewState.view.data?.errorType, transactionHash: viewState.view.data?.transactionHash, blockExplorerLink: BlockExplorerService.getTransactionLink(chainId.current, viewState.view.data?.transactionHash) })), viewState.view.type === SaleWidgetViews.ORDER_SUMMARY && (jsx(OrderSummary, { subView: viewState.view.subView })), viewState.view.type === SharedViews.TOP_UP_VIEW && (jsx(TopUpView, { analytics: { userJourney: UserJourney.SALE }, widgetEvent: IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT, checkout: checkout, provider: provider, showOnrampOption: config.isOnRampEnabled, showSwapOption: false, showBridgeOption: config.isBridgeEnabled, onCloseButtonClick: () => sendSaleWidgetCloseEvent(eventTarget), onBackButtonClick: () => {
                            viewDispatch({
                                payload: {
                                    type: ViewActions.UPDATE_VIEW,
                                    view: { type: SaleWidgetViews.PAYMENT_METHODS },
                                },
                            });
                        }, amount: viewState.view.data?.amount, tokenAddress: viewState.view.data?.tokenAddress, heading: viewState.view.data?.heading, subheading: viewState.view.data?.subheading })), jsx(CreditCardWarningDrawer, {})] }) }) }));
}

export { SaleWidget as default };
