import { aL as BigNumber, bT as Logger, cN as version$1, cO as hexZeroPad, cP as isBigNumberish, c2 as arrayify, cQ as isBytes, r as reactExports, a3 as Environment, bN as axios, j as jsx, o as jsxs, a4 as MenuItem, G as Box, l as useTranslation, X as ViewContext, a1 as EventTargetContext, $ as useAnalytics, cm as GasEstimateType, ak as HeaderNavigation, as as Heading, Y as Body, ao as SimpleLayout, I as IMTBLWidgetEvents, V as ViewActions, a7 as orchestrationEvents } from './index-Ae2juTF3.js';

const logger$1 = new Logger(version$1);
const _constructorGuard = {};
const Zero = BigNumber.from(0);
const NegativeOne = BigNumber.from(-1);
function throwFault(message, fault, operation, value) {
    const params = { fault: fault, operation: operation };
    if (value !== undefined) {
        params.value = value;
    }
    return logger$1.throwError(message, Logger.errors.NUMERIC_FAULT, params);
}
// Constant to pull zeros from for multipliers
let zeros = "0";
while (zeros.length < 256) {
    zeros += zeros;
}
// Returns a string "1" followed by decimal "0"s
function getMultiplier(decimals) {
    if (typeof (decimals) !== "number") {
        try {
            decimals = BigNumber.from(decimals).toNumber();
        }
        catch (e) { }
    }
    if (typeof (decimals) === "number" && decimals >= 0 && decimals <= 256 && !(decimals % 1)) {
        return ("1" + zeros.substring(0, decimals));
    }
    return logger$1.throwArgumentError("invalid decimal size", "decimals", decimals);
}
function formatFixed(value, decimals) {
    if (decimals == null) {
        decimals = 0;
    }
    const multiplier = getMultiplier(decimals);
    // Make sure wei is a big number (convert as necessary)
    value = BigNumber.from(value);
    const negative = value.lt(Zero);
    if (negative) {
        value = value.mul(NegativeOne);
    }
    let fraction = value.mod(multiplier).toString();
    while (fraction.length < multiplier.length - 1) {
        fraction = "0" + fraction;
    }
    // Strip training 0
    fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
    const whole = value.div(multiplier).toString();
    if (multiplier.length === 1) {
        value = whole;
    }
    else {
        value = whole + "." + fraction;
    }
    if (negative) {
        value = "-" + value;
    }
    return value;
}
function parseFixed(value, decimals) {
    if (decimals == null) {
        decimals = 0;
    }
    const multiplier = getMultiplier(decimals);
    if (typeof (value) !== "string" || !value.match(/^-?[0-9.]+$/)) {
        logger$1.throwArgumentError("invalid decimal value", "value", value);
    }
    // Is it negative?
    const negative = (value.substring(0, 1) === "-");
    if (negative) {
        value = value.substring(1);
    }
    if (value === ".") {
        logger$1.throwArgumentError("missing value", "value", value);
    }
    // Split it into a whole and fractional part
    const comps = value.split(".");
    if (comps.length > 2) {
        logger$1.throwArgumentError("too many decimal points", "value", value);
    }
    let whole = comps[0], fraction = comps[1];
    if (!whole) {
        whole = "0";
    }
    if (!fraction) {
        fraction = "0";
    }
    // Trim trailing zeros
    while (fraction[fraction.length - 1] === "0") {
        fraction = fraction.substring(0, fraction.length - 1);
    }
    // Check the fraction doesn't exceed our decimals size
    if (fraction.length > multiplier.length - 1) {
        throwFault("fractional component exceeds decimals", "underflow", "parseFixed");
    }
    // If decimals is 0, we have an empty string for fraction
    if (fraction === "") {
        fraction = "0";
    }
    // Fully pad the string with zeros to get to wei
    while (fraction.length < multiplier.length - 1) {
        fraction += "0";
    }
    const wholeValue = BigNumber.from(whole);
    const fractionValue = BigNumber.from(fraction);
    let wei = (wholeValue.mul(multiplier)).add(fractionValue);
    if (negative) {
        wei = wei.mul(NegativeOne);
    }
    return wei;
}
class FixedFormat {
    constructor(constructorGuard, signed, width, decimals) {
        if (constructorGuard !== _constructorGuard) {
            logger$1.throwError("cannot use FixedFormat constructor; use FixedFormat.from", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "new FixedFormat"
            });
        }
        this.signed = signed;
        this.width = width;
        this.decimals = decimals;
        this.name = (signed ? "" : "u") + "fixed" + String(width) + "x" + String(decimals);
        this._multiplier = getMultiplier(decimals);
        Object.freeze(this);
    }
    static from(value) {
        if (value instanceof FixedFormat) {
            return value;
        }
        if (typeof (value) === "number") {
            value = `fixed128x${value}`;
        }
        let signed = true;
        let width = 128;
        let decimals = 18;
        if (typeof (value) === "string") {
            if (value === "fixed") ;
            else if (value === "ufixed") {
                signed = false;
            }
            else {
                const match = value.match(/^(u?)fixed([0-9]+)x([0-9]+)$/);
                if (!match) {
                    logger$1.throwArgumentError("invalid fixed format", "format", value);
                }
                signed = (match[1] !== "u");
                width = parseInt(match[2]);
                decimals = parseInt(match[3]);
            }
        }
        else if (value) {
            const check = (key, type, defaultValue) => {
                if (value[key] == null) {
                    return defaultValue;
                }
                if (typeof (value[key]) !== type) {
                    logger$1.throwArgumentError("invalid fixed format (" + key + " not " + type + ")", "format." + key, value[key]);
                }
                return value[key];
            };
            signed = check("signed", "boolean", signed);
            width = check("width", "number", width);
            decimals = check("decimals", "number", decimals);
        }
        if (width % 8) {
            logger$1.throwArgumentError("invalid fixed format width (not byte aligned)", "format.width", width);
        }
        if (decimals > 80) {
            logger$1.throwArgumentError("invalid fixed format (decimals too large)", "format.decimals", decimals);
        }
        return new FixedFormat(_constructorGuard, signed, width, decimals);
    }
}
class FixedNumber {
    constructor(constructorGuard, hex, value, format) {
        if (constructorGuard !== _constructorGuard) {
            logger$1.throwError("cannot use FixedNumber constructor; use FixedNumber.from", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "new FixedFormat"
            });
        }
        this.format = format;
        this._hex = hex;
        this._value = value;
        this._isFixedNumber = true;
        Object.freeze(this);
    }
    _checkFormat(other) {
        if (this.format.name !== other.format.name) {
            logger$1.throwArgumentError("incompatible format; use fixedNumber.toFormat", "other", other);
        }
    }
    addUnsafe(other) {
        this._checkFormat(other);
        const a = parseFixed(this._value, this.format.decimals);
        const b = parseFixed(other._value, other.format.decimals);
        return FixedNumber.fromValue(a.add(b), this.format.decimals, this.format);
    }
    subUnsafe(other) {
        this._checkFormat(other);
        const a = parseFixed(this._value, this.format.decimals);
        const b = parseFixed(other._value, other.format.decimals);
        return FixedNumber.fromValue(a.sub(b), this.format.decimals, this.format);
    }
    mulUnsafe(other) {
        this._checkFormat(other);
        const a = parseFixed(this._value, this.format.decimals);
        const b = parseFixed(other._value, other.format.decimals);
        return FixedNumber.fromValue(a.mul(b).div(this.format._multiplier), this.format.decimals, this.format);
    }
    divUnsafe(other) {
        this._checkFormat(other);
        const a = parseFixed(this._value, this.format.decimals);
        const b = parseFixed(other._value, other.format.decimals);
        return FixedNumber.fromValue(a.mul(this.format._multiplier).div(b), this.format.decimals, this.format);
    }
    floor() {
        const comps = this.toString().split(".");
        if (comps.length === 1) {
            comps.push("0");
        }
        let result = FixedNumber.from(comps[0], this.format);
        const hasFraction = !comps[1].match(/^(0*)$/);
        if (this.isNegative() && hasFraction) {
            result = result.subUnsafe(ONE.toFormat(result.format));
        }
        return result;
    }
    ceiling() {
        const comps = this.toString().split(".");
        if (comps.length === 1) {
            comps.push("0");
        }
        let result = FixedNumber.from(comps[0], this.format);
        const hasFraction = !comps[1].match(/^(0*)$/);
        if (!this.isNegative() && hasFraction) {
            result = result.addUnsafe(ONE.toFormat(result.format));
        }
        return result;
    }
    // @TODO: Support other rounding algorithms
    round(decimals) {
        if (decimals == null) {
            decimals = 0;
        }
        // If we are already in range, we're done
        const comps = this.toString().split(".");
        if (comps.length === 1) {
            comps.push("0");
        }
        if (decimals < 0 || decimals > 80 || (decimals % 1)) {
            logger$1.throwArgumentError("invalid decimal count", "decimals", decimals);
        }
        if (comps[1].length <= decimals) {
            return this;
        }
        const factor = FixedNumber.from("1" + zeros.substring(0, decimals), this.format);
        const bump = BUMP.toFormat(this.format);
        return this.mulUnsafe(factor).addUnsafe(bump).floor().divUnsafe(factor);
    }
    isZero() {
        return (this._value === "0.0" || this._value === "0");
    }
    isNegative() {
        return (this._value[0] === "-");
    }
    toString() { return this._value; }
    toHexString(width) {
        if (width == null) {
            return this._hex;
        }
        if (width % 8) {
            logger$1.throwArgumentError("invalid byte width", "width", width);
        }
        const hex = BigNumber.from(this._hex).fromTwos(this.format.width).toTwos(width).toHexString();
        return hexZeroPad(hex, width / 8);
    }
    toUnsafeFloat() { return parseFloat(this.toString()); }
    toFormat(format) {
        return FixedNumber.fromString(this._value, format);
    }
    static fromValue(value, decimals, format) {
        // If decimals looks more like a format, and there is no format, shift the parameters
        if (format == null && decimals != null && !isBigNumberish(decimals)) {
            format = decimals;
            decimals = null;
        }
        if (decimals == null) {
            decimals = 0;
        }
        if (format == null) {
            format = "fixed";
        }
        return FixedNumber.fromString(formatFixed(value, decimals), FixedFormat.from(format));
    }
    static fromString(value, format) {
        if (format == null) {
            format = "fixed";
        }
        const fixedFormat = FixedFormat.from(format);
        const numeric = parseFixed(value, fixedFormat.decimals);
        if (!fixedFormat.signed && numeric.lt(Zero)) {
            throwFault("unsigned value cannot be negative", "overflow", "value", value);
        }
        let hex = null;
        if (fixedFormat.signed) {
            hex = numeric.toTwos(fixedFormat.width).toHexString();
        }
        else {
            hex = numeric.toHexString();
            hex = hexZeroPad(hex, fixedFormat.width / 8);
        }
        const decimal = formatFixed(numeric, fixedFormat.decimals);
        return new FixedNumber(_constructorGuard, hex, decimal, fixedFormat);
    }
    static fromBytes(value, format) {
        if (format == null) {
            format = "fixed";
        }
        const fixedFormat = FixedFormat.from(format);
        if (arrayify(value).length > fixedFormat.width / 8) {
            throw new Error("overflow");
        }
        let numeric = BigNumber.from(value);
        if (fixedFormat.signed) {
            numeric = numeric.fromTwos(fixedFormat.width);
        }
        const hex = numeric.toTwos((fixedFormat.signed ? 0 : 1) + fixedFormat.width).toHexString();
        const decimal = formatFixed(numeric, fixedFormat.decimals);
        return new FixedNumber(_constructorGuard, hex, decimal, fixedFormat);
    }
    static from(value, format) {
        if (typeof (value) === "string") {
            return FixedNumber.fromString(value, format);
        }
        if (isBytes(value)) {
            return FixedNumber.fromBytes(value, format);
        }
        try {
            return FixedNumber.fromValue(value, 0, format);
        }
        catch (error) {
            // Allow NUMERIC_FAULT to bubble up
            if (error.code !== Logger.errors.INVALID_ARGUMENT) {
                throw error;
            }
        }
        return logger$1.throwArgumentError("invalid FixedNumber value", "value", value);
    }
    static isFixedNumber(value) {
        return !!(value && value._isFixedNumber);
    }
}
const ONE = FixedNumber.from(1);
const BUMP = FixedNumber.from("0.5");

const version = "units/5.7.0";

const logger = new Logger(version);
const names = [
    "wei",
    "kwei",
    "mwei",
    "gwei",
    "szabo",
    "finney",
    "ether",
];
function formatUnits(value, unitName) {
    if (typeof (unitName) === "string") {
        const index = names.indexOf(unitName);
        if (index !== -1) {
            unitName = 3 * index;
        }
    }
    return formatFixed(value, (unitName != null) ? unitName : 18);
}
function parseUnits(value, unitName) {
    if (typeof (value) !== "string") {
        logger.throwArgumentError("value must be a string", "value", value);
    }
    if (typeof (unitName) === "string") {
        const index = names.indexOf(unitName);
        if (index !== -1) {
            unitName = 3 * index;
        }
    }
    return parseFixed(value, (unitName != null) ? unitName : 18);
}
function parseEther(ether) {
    return parseUnits(ether, 18);
}

var FiatSymbols;
(function (FiatSymbols) {
    FiatSymbols["USD"] = "usd";
})(FiatSymbols || (FiatSymbols = {}));
const initialCryptoFiatState = {
    cryptoFiat: null,
    fiatSymbol: FiatSymbols.USD,
    tokenSymbols: [],
    conversions: new Map(),
};
var CryptoFiatActions;
(function (CryptoFiatActions) {
    CryptoFiatActions["SET_CRYPTO_FIAT"] = "SET_CRYPTO_FIAT";
    CryptoFiatActions["SET_FIAT_SYMBOL"] = "SET_FIAT_SYMBOL";
    CryptoFiatActions["SET_TOKEN_SYMBOLS"] = "SET_TOKEN_SYMBOLS";
    CryptoFiatActions["SET_CONVERSIONS"] = "SET_CONVERSIONS";
})(CryptoFiatActions || (CryptoFiatActions = {}));
// eslint-disable-next-line @typescript-eslint/naming-convention
const CryptoFiatContext = reactExports.createContext({
    cryptoFiatState: initialCryptoFiatState,
    cryptoFiatDispatch: () => { },
});
const cryptoFiatReducer = (state, action) => {
    switch (action.payload.type) {
        case CryptoFiatActions.SET_CRYPTO_FIAT:
            return {
                ...state,
                cryptoFiat: action.payload.cryptoFiat,
            };
        case CryptoFiatActions.SET_FIAT_SYMBOL:
            return {
                ...state,
                fiatSymbol: action.payload.fiatSymbol,
            };
        case CryptoFiatActions.SET_TOKEN_SYMBOLS:
            return {
                ...state,
                tokenSymbols: action.payload.tokenSymbols,
            };
        case CryptoFiatActions.SET_CONVERSIONS:
            return {
                ...state,
                conversions: action.payload.conversions,
            };
        default:
            return state;
    }
};

var SwapWidgetViews;
(function (SwapWidgetViews) {
    SwapWidgetViews["SWAP"] = "SWAP";
    SwapWidgetViews["IN_PROGRESS"] = "IN_PROGRESS";
    SwapWidgetViews["SUCCESS"] = "SUCCESS";
    SwapWidgetViews["FAIL"] = "FAIL";
    SwapWidgetViews["PRICE_SURGE"] = "PRICE_SURGE";
    SwapWidgetViews["APPROVE_ERC20"] = "APPROVE_ERC20_SWAP";
})(SwapWidgetViews || (SwapWidgetViews = {}));

/**
 * Class representing the configuration for the CryptoFiatModule.
 */
class CryptoFiatConfiguration {
    baseConfig;
    /**
     * Creates an instance of CryptoFiatConfiguration.
     */
    constructor({ baseConfig }) {
        this.baseConfig = baseConfig;
    }
}

const CHECKOUT_API_BASE_URL = {
    [Environment.SANDBOX]: 'https://checkout-api.sandbox.immutable.com',
    [Environment.PRODUCTION]: 'https://checkout-api.immutable.com',
};
const DEFAULT_FIAT_SYMBOL = 'usd';
/**
 * CryptoFiat module class
 */
class CryptoFiat {
    coinsCache;
    overridesCache;
    config;
    /**
     * Creates an instance of CryptoFiat.
     * @param {CryptoFiatConfiguration} config - configuration parameters for the module
     */
    constructor(config) {
        this.coinsCache = null;
        this.overridesCache = null;
        this.config = config.baseConfig;
    }
    urlWithPath(path) {
        return CHECKOUT_API_BASE_URL[this.config.environment] + path;
    }
    // Given that we could have multiple coins with the same symbol
    // and we do not have the contract address we are forcing the
    // conversion because we are using coingecko under the hood.
    async fetchOverrides() {
        if (this.overridesCache !== null)
            return;
        const url = this.urlWithPath('/v1/fiat/coins/overrides');
        const response = await axios.get(url);
        if (response.status !== 200) {
            throw new Error(`Error fetching coins overrides: ${response.status} ${response.statusText}`);
        }
        this.overridesCache = new Map(Object.entries(response.data));
    }
    async fetchCoins() {
        if (this.coinsCache !== null)
            return;
        await this.fetchOverrides();
        const url = this.urlWithPath('/v1/fiat/coins/all');
        const response = await axios.get(url);
        if (response.status !== 200) {
            throw new Error(`Error fetching coins list: ${response.status} ${response.statusText}`);
        }
        const { data } = response;
        this.coinsCache = new Map();
        for (const coin of data) {
            const override = this.overridesCache.get(coin.symbol.toLowerCase());
            this.coinsCache.set(coin.symbol.toLowerCase(), override || coin.id.toLowerCase());
        }
    }
    /**
     * Converts tokens with fiat currencies.
     * @param {CryptoFiatConvertParams} - object containing the token symbols to get a conversion
     *                                    for and the optional fiat symbols to convert to.
     * @returns {Promise<CryptoFiatConvertReturn>} - promise to return the map that associates
     *                                               token symbol to its conversion value object
     *                                               with fiat currencies.
     */
    async convert({ tokenSymbols, fiatSymbols = [], }) {
        if (!tokenSymbols || tokenSymbols.length === 0) {
            throw new Error('Error missing token symbols to convert');
        }
        const currencies = fiatSymbols.filter((fiatSymbol) => fiatSymbol !== '');
        if (currencies.length === 0)
            currencies.push(DEFAULT_FIAT_SYMBOL);
        await this.fetchCoins();
        const idsParam = tokenSymbols
            .map((tokenSymbol) => this.coinsCache.get(tokenSymbol.toLowerCase()))
            .filter((tokenSymbol) => tokenSymbol !== '' && tokenSymbol !== undefined)
            .join(',');
        const currenciesParam = currencies
            .join(',')
            .toLowerCase();
        const url = this.urlWithPath(`/v1/fiat/conversion?ids=${idsParam}&currencies=${currenciesParam}`);
        const response = await axios.get(url);
        if (response.status !== 200) {
            throw new Error(`Error fetching prices: ${response.status} ${response.statusText}`);
        }
        const { data } = response;
        const result = {};
        for (const symbol of tokenSymbols) {
            const symbolKey = symbol.toLowerCase();
            const coinId = this.coinsCache.get(symbolKey);
            result[symbolKey] = {};
            if (coinId)
                result[symbolKey] = data[coinId] || {};
        }
        return result;
    }
}

const updateConversions = (cryptoToFiatResult, fiatSymbol) => {
    const conversionMap = new Map();
    // TODO: Consider using Object.keys(cryptoToFiatResult) instead of for...in
    // for...in includes properties from the prototype chain
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const tokenSymbol in cryptoToFiatResult) {
        const conversion = cryptoToFiatResult[tokenSymbol];
        const usdAmount = conversion[fiatSymbol];
        if (usdAmount !== undefined) {
            conversionMap.set(tokenSymbol, usdAmount);
        }
    }
    return conversionMap;
};
const getCryptoToFiatConversion = async (cryptoFiat, fiatSymbol, tokenSymbols) => {
    try {
        if (tokenSymbols.length === 0)
            return new Map();
        const cryptoToFiatResult = await cryptoFiat.convert({
            tokenSymbols,
            fiatSymbols: [fiatSymbol],
        });
        return updateConversions(cryptoToFiatResult, fiatSymbol);
    }
    catch (err) {
        return new Map();
    }
};

const DEFAULT_TOKEN_SYMBOLS = ['ETH', 'IMX'];
function CryptoFiatProvider({ environment, children }) {
    const [cryptoFiatState, cryptoFiatDispatch] = reactExports.useReducer(cryptoFiatReducer, initialCryptoFiatState);
    const { cryptoFiat, fiatSymbol, tokenSymbols } = cryptoFiatState;
    reactExports.useEffect(() => {
        cryptoFiatDispatch({
            payload: {
                type: CryptoFiatActions.SET_CRYPTO_FIAT,
                cryptoFiat: new CryptoFiat(new CryptoFiatConfiguration({
                    baseConfig: {
                        environment,
                    },
                })),
            },
        });
    }, []);
    reactExports.useEffect(() => {
        if (!cryptoFiat || !fiatSymbol)
            return;
        (async () => {
            const conversions = await getCryptoToFiatConversion(cryptoFiat, fiatSymbol, [...new Set([...tokenSymbols, ...DEFAULT_TOKEN_SYMBOLS])]);
            cryptoFiatDispatch({
                payload: {
                    type: CryptoFiatActions.SET_CONVERSIONS,
                    conversions,
                },
            });
        })();
    }, [cryptoFiat, tokenSymbols, fiatSymbol]);
    return (
    // TODO: The object passed as the value prop to the Context provider changes every render.
    // To fix this consider wrapping it in a useMemo hook.
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    jsx(CryptoFiatContext.Provider, { value: { cryptoFiatState, cryptoFiatDispatch }, children: children }));
}

var BridgeWidgetViews;
(function (BridgeWidgetViews) {
    BridgeWidgetViews["WALLET_NETWORK_SELECTION"] = "WALLET_NETWORK_SELECTION";
    BridgeWidgetViews["BRIDGE_FORM"] = "BRIDGE_FORM";
    BridgeWidgetViews["BRIDGE_REVIEW"] = "BRIDGE_REVIEW";
    BridgeWidgetViews["IN_PROGRESS"] = "IN_PROGRESS";
    BridgeWidgetViews["BRIDGE_FAILURE"] = "BRIDGE_FAILURE";
    BridgeWidgetViews["APPROVE_TRANSACTION"] = "APPROVE_TRANSACTION";
    BridgeWidgetViews["TRANSACTIONS"] = "TRANSACTIONS";
    BridgeWidgetViews["CLAIM_WITHDRAWAL"] = "CLAIM_WITHDRAWAL";
    BridgeWidgetViews["CLAIM_WITHDRAWAL_IN_PROGRESS"] = "CLAIM_WITHDRAWAL_IN_PROGRESS";
    BridgeWidgetViews["CLAIM_WITHDRAWAL_SUCCESS"] = "CLAIM_WITHDRAWAL_SUCCESS";
    BridgeWidgetViews["CLAIM_WITHDRAWAL_FAILURE"] = "CLAIM_WITHDRAWAL_FAILURE";
})(BridgeWidgetViews || (BridgeWidgetViews = {}));

/**
 * useMount hook to runs only once when the component mounts
 * after mounting condition is met
 *
 * @param fn function to run
 * @param shouldMount function to check mount condition
 * @param deps dependencies to watch for changes
 */
const useMount = (fn, shouldMount, deps) => {
    const isMounted = reactExports.useRef(false);
    const shouldMountCheck = () => {
        if (typeof shouldMount === 'function') {
            return shouldMount();
        }
        return true;
    };
    reactExports.useEffect(() => {
        if (isMounted.current)
            return;
        if (!shouldMountCheck())
            return;
        fn();
        isMounted.current = true;
    }, deps || []);
};

const convertFeeToFiat = (fee, token, conversions) => {
    let feeAmountInFiat = -1;
    if (fee && token) {
        const formattedAmount = formatUnits(fee, token.decimals);
        const gasFeeTokenConversion = conversions.get(token.symbol.toLocaleLowerCase());
        if (gasFeeTokenConversion) {
            const parsedAmount = parseFloat(formattedAmount);
            if (Number.isNaN(parsedAmount))
                return feeAmountInFiat;
            feeAmountInFiat = parsedAmount * gasFeeTokenConversion;
        }
    }
    return feeAmountInFiat;
};
// Formats a value to 2 decimal places unless the value is less than 0.01, in which case it will show the first non-zero digit of the decimal places
function formatFiatDecimals(value) {
    if (value < 0) {
        return '-.--';
    }
    const str = value.toString();
    if (str.includes('e') || value === 0) {
        // In this scenario, converting the fee to fiat has given us an exponent from
        // parseFloat as the fee value is very low. If the value is low enough that converting
        // the fee to fiat has returned an exponent, then it is significantly low enough to
        // be considered essentially zero.
        return '0.00';
    }
    if (value < 0.01) {
        for (let i = 0; i < str.length; i++) {
            if (str[i] !== '0' && str[i] !== '.') {
                return value.toFixed(i - 1);
            }
        }
    }
    return value.toFixed(2);
}
const getOnRampFeeEstimation = (onRampFees) => {
    const { minPercentage, maxPercentage } = onRampFees;
    if (minPercentage === undefined || maxPercentage === undefined)
        return '-.--';
    return `${minPercentage}% to ${maxPercentage}`;
};
const getBridgeFeeEstimation = (bridgeFees, conversions) => {
    const { fees, token } = bridgeFees;
    const feeAmount = fees.totalFees;
    if (feeAmount === undefined)
        return '-.--';
    if (token === undefined)
        return '-.--';
    const feesInFiat = convertFeeToFiat(fees.totalFees, token, conversions);
    if (feesInFiat < 0)
        return '-.--';
    return formatFiatDecimals(feesInFiat);
};

var OnRampWidgetViews;
(function (OnRampWidgetViews) {
    OnRampWidgetViews["ONRAMP"] = "ONRAMP";
    OnRampWidgetViews["IN_PROGRESS_LOADING"] = "IN_PROGRESS_LOADING";
    OnRampWidgetViews["IN_PROGRESS"] = "IN_PROGRESS";
    OnRampWidgetViews["SUCCESS"] = "SUCCESS";
    OnRampWidgetViews["FAIL"] = "FAIL";
})(OnRampWidgetViews || (OnRampWidgetViews = {}));

function TopUpMenuItem({ testId, icon, iconVariant, intentIcon, heading, caption, onClick, renderFeeFunction, isDisabled, }) {
    return (jsx(Box, { testId: "top-up-view", sx: { paddingY: '1px' }, children: jsxs(MenuItem, { testId: `menu-item-${testId}`, size: "small", emphasized: true, onClick: !isDisabled ? onClick : undefined, sx: isDisabled ? { opacity: '0.5', cursor: 'not-allowed' } : {}, children: [jsx(MenuItem.Icon, { icon: icon, variant: iconVariant }), jsx(MenuItem.Label, { size: "medium", children: heading }), jsx(MenuItem.IntentIcon, { icon: intentIcon }), jsxs(MenuItem.Caption, { testId: `menu-item-caption-${testId}`, children: [caption, jsx("br", {}), isDisabled ? '' : renderFeeFunction('-.--', false)] })] }) }));
}

const TOOLKIT_BASE_URL = {
    [Environment.SANDBOX]: 'https://checkout-playground.sandbox.immutable.com',
    [Environment.PRODUCTION]: 'https://toolkit.immutable.com',
};
function TopUpView({ widgetEvent, checkout, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
provider, // Keep this for future use
showOnrampOption, showSwapOption, showBridgeOption, tokenAddress, amount, analytics, onCloseButtonClick, onBackButtonClick, heading, subheading, }) {
    const { t } = useTranslation();
    const { userJourney } = analytics;
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { cryptoFiatState, cryptoFiatDispatch } = reactExports.useContext(CryptoFiatContext);
    const { conversions, fiatSymbol } = cryptoFiatState;
    const environment = checkout?.config.environment ?? Environment.SANDBOX;
    const { eventTargetState: { eventTarget }, } = reactExports.useContext(EventTargetContext);
    const [onRampFeesPercentage, setOnRampFeesPercentage] = reactExports.useState('-.--');
    const swapFeesInFiat = '0.05';
    const [, setBridgeFeesInFiat] = reactExports.useState('-.--');
    const [isSwapAvailable, setIsSwapAvailable] = reactExports.useState(true);
    const title = heading ? t(...heading) : t('views.TOP_UP_VIEW.header.title');
    const description = subheading ? t(...subheading) : null;
    const { page, track } = useAnalytics();
    useMount(() => {
        page({
            userJourney,
            screen: 'TopUp',
        });
    });
    reactExports.useEffect(() => {
        if (!cryptoFiatDispatch)
            return;
        cryptoFiatDispatch({
            payload: {
                type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
                tokenSymbols: DEFAULT_TOKEN_SYMBOLS,
            },
        });
    }, [cryptoFiatDispatch]);
    // Bridge fees estimation
    reactExports.useEffect(() => {
        if (!checkout)
            return;
        (async () => {
            const bridgeEstimate = await checkout.gasEstimate({
                gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
            });
            const est = await getBridgeFeeEstimation(bridgeEstimate, conversions);
            setBridgeFeesInFiat(est);
        })();
    }, [checkout !== undefined]);
    // Onramp fees estimation
    reactExports.useEffect(() => {
        if (!checkout)
            return;
        (async () => {
            const onRampFeesEstimate = await checkout.getExchangeFeeEstimate();
            const onRampFees = getOnRampFeeEstimation(onRampFeesEstimate);
            setOnRampFeesPercentage(onRampFees);
        })();
    }, [checkout !== undefined]);
    // Check if swap is available
    reactExports.useEffect(() => {
        if (!checkout)
            return;
        (async () => {
            setIsSwapAvailable(await checkout.isSwapAvailable());
        })();
    }, [checkout !== undefined]);
    const localTrack = (control, extras, controlType = 'Button') => {
        track({
            userJourney,
            screen: 'TopUp',
            control,
            controlType,
            extras,
        });
    };
    const onClickSwap = () => {
        if (widgetEvent === IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT) {
            const data = {
                toTokenAddress: '',
                fromAmount: '',
                fromTokenAddress: '',
            };
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: SwapWidgetViews.SWAP,
                        data,
                    },
                },
            });
            localTrack('Swap', { ...data, widgetEvent });
            return;
        }
        const data = {
            fromTokenAddress: '',
            toTokenAddress: tokenAddress ?? '',
            amount: '',
        };
        orchestrationEvents.sendRequestSwapEvent(eventTarget, widgetEvent, data);
        localTrack('Swap', { ...data, widgetEvent });
    };
    const onClickBridge = () => {
        if (widgetEvent === IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT) {
            const data = {
                fromTokenAddress: '',
                fromAmount: '',
            };
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: BridgeWidgetViews.WALLET_NETWORK_SELECTION,
                        data,
                    },
                },
            });
            localTrack('Bridge', { ...data, widgetEvent });
            return;
        }
        const data = {
            tokenAddress: '',
            amount: '',
        };
        orchestrationEvents.sendRequestBridgeEvent(eventTarget, widgetEvent, data);
        localTrack('Bridge', { ...data, widgetEvent });
    };
    const onClickOnRamp = () => {
        if (widgetEvent === IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT) {
            const data = {
                tokenAddress: '',
                amount: '',
            };
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: OnRampWidgetViews.ONRAMP,
                        data,
                    },
                },
            });
            localTrack('OnRamp', { ...data, widgetEvent });
            return;
        }
        const data = {
            tokenAddress: tokenAddress ?? '',
            amount: amount ?? '',
        };
        orchestrationEvents.sendRequestOnrampEvent(eventTarget, widgetEvent, data);
        localTrack('OnRamp', { ...data, widgetEvent });
    };
    const onClickAdvancedOptions = () => {
        const toolkitBaseUrl = TOOLKIT_BASE_URL[environment];
        const data = {
            tokenAddress: tokenAddress ?? '',
            amount: amount ?? '',
        };
        localTrack('AdvancedOptions', { ...data, widgetEvent });
        window.open(`${toolkitBaseUrl}/squid-bridge/`, '_blank');
    };
    const renderFees = (txt) => (jsx(Box, { sx: {
            fontSize: 'base.text.caption.small.regular.fontSize',
            c: 'base.color.translucent.standard.600',
        }, children: txt }));
    const topUpFeatures = [
        {
            testId: 'onramp',
            icon: 'BankCard',
            iconVariant: 'bold',
            textConfigKey: 'views.TOP_UP_VIEW.topUpOptions.debit',
            onClickEvent: onClickOnRamp,
            fee: () => renderFees(`${t('views.TOP_UP_VIEW.topUpOptions.debit.subcaption')} ≈ ${onRampFeesPercentage}%`),
            isAvailable: true,
            isEnabled: showOnrampOption,
        },
        {
            testId: 'onramp',
            icon: 'BankCard',
            textConfigKey: 'views.TOP_UP_VIEW.topUpOptions.credit',
            onClickEvent: onClickOnRamp,
            fee: () => renderFees(`${t('views.TOP_UP_VIEW.topUpOptions.credit.subcaption')} ≈ ${onRampFeesPercentage}%`),
            isAvailable: true,
            isEnabled: showOnrampOption,
        },
        {
            testId: 'advanced',
            icon: 'Minting',
            iconVariant: 'bold',
            intentIcon: 'JumpTo',
            textConfigKey: 'views.TOP_UP_VIEW.topUpOptions.advanced',
            onClickEvent: onClickAdvancedOptions,
            fee: () => renderFees(''),
            isAvailable: true,
            isEnabled: true,
        },
        {
            testId: 'swap',
            icon: 'Swap',
            textConfigKey: 'views.TOP_UP_VIEW.topUpOptions.swap',
            onClickEvent: onClickSwap,
            fee: () => renderFees(`${t('views.TOP_UP_VIEW.topUpOptions.swap.subcaption')} ≈ $${swapFeesInFiat} ${fiatSymbol.toUpperCase()}`),
            isAvailable: isSwapAvailable,
            isEnabled: showSwapOption,
        },
        {
            testId: 'bridge',
            icon: 'ArrowForward',
            textConfigKey: 'views.TOP_UP_VIEW.topUpOptions.bridge',
            onClickEvent: onClickBridge,
            fee: () => renderFees(''),
            isAvailable: true,
            isEnabled: showBridgeOption,
        },
    ];
    return (jsx(SimpleLayout, { header: (jsx(HeaderNavigation, { onBackButtonClick: onBackButtonClick, onCloseButtonClick: onCloseButtonClick, showBack: true })), children: jsxs(Box, { sx: { paddingX: 'base.spacing.x4', paddingY: 'base.spacing.x4' }, children: [jsx(Heading, { size: "small", children: title }), description && (jsx(Body, { size: "small", sx: { color: 'base.color.text.body.secondary' }, children: description })), jsx(Box, { sx: { paddingY: 'base.spacing.x4' }, children: topUpFeatures
                        .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable))
                        .map((element) => element.isEnabled && (jsx(TopUpMenuItem, { testId: element.testId, icon: element.icon, iconVariant: element.iconVariant, intentIcon: element.intentIcon, heading: t(`${element.textConfigKey}.heading`), caption: !element.isAvailable
                            ? t(`${element.textConfigKey}.disabledCaption`)
                            : t(`${element.textConfigKey}.caption`), onClick: element.onClickEvent, renderFeeFunction: element.fee, isDisabled: !element.isAvailable }, t(`${element.textConfigKey}.heading`).toLowerCase()))) })] }) }));
}

export { BridgeWidgetViews as B, CryptoFiatContext as C, OnRampWidgetViews as O, SwapWidgetViews as S, TopUpView as T, CryptoFiatActions as a, CryptoFiatProvider as b, parseEther as c, formatUnits as f, parseUnits as p, useMount as u };
