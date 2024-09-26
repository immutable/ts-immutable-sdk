import { l as useTranslation, bj as WidgetTheme, bk as getRemoteImage, o as jsxs, bl as quickswapFooterStyles, G as Box, bm as quickswapFooterLogoStyles, j as jsx, Y as Body, bn as quickswapFooterDisclaimerTextStyles, r as reactExports, N as Button, bo as getImxTokenImage, at as Drawer, bp as CloudImage, as as Heading, bq as Logo, br as Icon, aL as BigNumber, aj as calculateCryptoToFiat, a5 as tokenValueFormat, bb as isGasFree, a0 as formatZeroAmount, Z as ConnectLoaderContext, bs as getDefaultTokenImage, a9 as isNativeToken, bt as NATIVE, X as ViewContext, $ as useAnalytics, bu as DEFAULT_QUOTE_REFRESH_INTERVAL, a2 as isPassportProvider, bv as amountInputValidation, bw as Tooltip, a6 as UserJourney, a3 as Environment, V as ViewActions, p as SharedViews, h as getL2ChainId, aV as Fragment, bx as ESTIMATE_DEBOUNCE, by as DEFAULT_TOKEN_VALIDATION_DECIMALS, bz as DEFAULT_TOKEN_DECIMALS, a1 as EventTargetContext, bA as sendSwapWidgetCloseEvent, a7 as orchestrationEvents, I as IMTBLWidgetEvents, ak as HeaderNavigation, L as LoadingView, ao as SimpleLayout, bB as IMX_TOKEN_SYMBOL, ab as CheckoutErrorType, aA as SimpleTextBody, bC as FooterButton, aD as viewReducer, aE as initialViewState, U as TokenFilterTypes, ag as DEFAULT_BALANCE_RETRY_POLICY, bD as SwapDirection$1, bE as StatusView, bF as sendSwapSuccessEvent, b1 as StatusType, bG as sendSwapFailedEvent, bH as sendSwapRejectedEvent, E as ErrorView } from './index-Ae2juTF3.js';
import { S as SelectForm, F as Fees, T as TransactionRejected, N as NetworkSwitchDrawer, W as WalletApproveHero, g as getAllowedBalances } from './balance-BAruSdXS.js';
import { f as formatUnits, p as parseUnits, C as CryptoFiatContext, a as CryptoFiatActions, c as parseEther, S as SwapWidgetViews, T as TopUpView, b as CryptoFiatProvider } from './TopUpView-BinG-jkK.js';
import { T as TextInputForm } from './TextInputForm-B89J7hRS.js';
import { u as useInterval } from './retry-CDK--oGi.js';
import { S as SpendingCapHero } from './SpendingCapHero-4IkTT4Hc.js';

function QuickswapFooter({ theme, environment }) {
    const { t } = useTranslation();
    const logo = theme === WidgetTheme.DARK
        ? getRemoteImage(environment, '/quickswapdark.webp')
        : getRemoteImage(environment, '/quickswaplight.webp');
    return (jsxs(Box, { testId: "quickswap-footer-container", sx: quickswapFooterStyles, children: [jsxs(Box, { testId: "quickswap-logo", sx: quickswapFooterLogoStyles, children: [jsx(Body, { size: "xSmall", sx: { paddingRight: 'base.spacing.x1' }, children: "By" }), jsx("img", { style: { height: '26px' }, alt: "Quickswap logo", src: logo })] }), jsx(Body, { testId: "quickswap-footer-disclaimer-text", size: "xSmall", sx: quickswapFooterDisclaimerTextStyles, children: t('footers.quickswapFooter.disclaimerText') })] }));
}

const initialSwapState = {
    exchange: null,
    walletProviderName: null,
    network: null,
    tokenBalances: [],
    supportedTopUps: null,
    allowedTokens: [],
    autoProceed: false,
};
var SwapActions;
(function (SwapActions) {
    SwapActions["SET_EXCHANGE"] = "SET_EXCHANGE";
    SwapActions["SET_WALLET_PROVIDER_NAME"] = "SET_WALLET_PROVIDER_NAME";
    SwapActions["SET_NETWORK"] = "SET_NETWORK";
    SwapActions["SET_SUPPORTED_TOP_UPS"] = "SET_SUPPORTED_TOP_UPS";
    SwapActions["SET_TOKEN_BALANCES"] = "SET_TOKEN_BALANCES";
    SwapActions["SET_ALLOWED_TOKENS"] = "SET_ALLOWED_TOKENS";
    SwapActions["SET_AUTO_PROCEED"] = "SET_AUTO_PROCEED";
})(SwapActions || (SwapActions = {}));
// eslint-disable-next-line @typescript-eslint/naming-convention
const SwapContext = reactExports.createContext({
    swapState: initialSwapState,
    swapDispatch: () => { },
});
SwapContext.displayName = 'SwapContext'; // help with debugging Context in browser
const swapReducer = (state, action) => {
    switch (action.payload.type) {
        case SwapActions.SET_EXCHANGE:
            return {
                ...state,
                exchange: action.payload.exchange,
            };
        case SwapActions.SET_WALLET_PROVIDER_NAME:
            return {
                ...state,
                walletProviderName: action.payload.walletProviderName,
            };
        case SwapActions.SET_NETWORK:
            return {
                ...state,
                network: action.payload.network,
            };
        case SwapActions.SET_SUPPORTED_TOP_UPS:
            return {
                ...state,
                supportedTopUps: {
                    isSwapEnabled: action.payload.supportedTopUps.isSwapEnabled ?? true,
                    isOnRampEnabled: action.payload.supportedTopUps.isOnRampEnabled ?? true,
                    isBridgeEnabled: action.payload.supportedTopUps.isBridgeEnabled ?? true,
                },
            };
        case SwapActions.SET_TOKEN_BALANCES:
            return {
                ...state,
                tokenBalances: action.payload.tokenBalances,
            };
        case SwapActions.SET_ALLOWED_TOKENS:
            return {
                ...state,
                allowedTokens: action.payload.allowedTokens,
            };
        case SwapActions.SET_AUTO_PROCEED:
            return {
                ...state,
                autoProceed: action.payload.autoProceed,
                direction: action.payload.direction,
            };
        default:
            return state;
    }
};

const selectInputBoxStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 'base.spacing.x1',
};
const selectStyle = {
    flex: 1,
};
const inputStyle = {
    flex: 2,
};

function SelectInput({ testId, options, textInputValue, textInputPlaceholder, textInputValidator, textInputType, onTextInputChange, onTextInputBlur, onTextInputFocus, textInputTextAlign, textInputSubtext, textInputErrorMessage, testInputMode, selectTextAlign, selectSubtext, selectErrorMessage, textInputMaxButtonClick, onSelectChange, textInputDisabled, selectInputDisabled, selectedOption, coinSelectorHeading, defaultTokenImage, environment, theme, }) {
    return (jsxs(Box, { sx: selectInputBoxStyle, children: [jsx(Box, { sx: selectStyle, children: jsx(SelectForm, { testId: `${testId}-select-form`, options: options, subtext: selectSubtext, textAlign: selectTextAlign, errorMessage: selectErrorMessage, onSelectChange: onSelectChange, disabled: selectInputDisabled, selectedOption: selectedOption, coinSelectorHeading: coinSelectorHeading, defaultTokenImage: defaultTokenImage, environment: environment, theme: theme }) }), jsx(Box, { sx: inputStyle, children: jsx(TextInputForm, { type: textInputType, testId: `${testId}-text-form`, value: textInputValue, placeholder: textInputPlaceholder, subtext: textInputSubtext, textAlign: textInputTextAlign, errorMessage: textInputErrorMessage, validator: textInputValidator, onTextInputChange: onTextInputChange, onTextInputBlur: onTextInputBlur, onTextInputFocus: onTextInputFocus, maxButtonClick: textInputMaxButtonClick, disabled: textInputDisabled, inputMode: testInputMode }) })] }));
}

function validateFromToken(fromToken) {
    if (!fromToken)
        return 'views.SWAP.validation.noFromTokenSelected';
    return '';
}
function validateFromAmount(amount, balance) {
    if (!amount || parseFloat(amount) === 0)
        return 'views.SWAP.validation.noAmountInputted';
    if (balance && Number(amount) > Number(balance))
        return 'views.SWAP.validation.insufficientBalance';
    return '';
}
function validateToToken(toToken) {
    if (!toToken)
        return 'views.SWAP.validation.noToTokenSelected';
    return '';
}
function validateToAmount(amount) {
    if (!amount || parseFloat(amount) === 0)
        return 'views.SWAP.validation.noAmountInputted';
    return '';
}

const swapButtonBoxStyle = {
    display: 'flex',
    flexDirection: 'column',
    paddingY: 'base.spacing.x6',
    paddingX: 'base.spacing.x4',
};
const swapButtonIconLoadingStyle = {
    width: 'base.icon.size.400',
};

function SwapButton({ loading, validator, sendTransaction, }) {
    const { t } = useTranslation();
    const handleClick = async () => {
        const canSwap = validator();
        if (canSwap) {
            await sendTransaction();
        }
    };
    return (jsx(Box, { sx: swapButtonBoxStyle, children: jsx(Button, { testId: "swap-button", disabled: loading, variant: "primary", onClick: handleClick, size: "large", children: loading ? (jsx(Button.Icon, { icon: "Loading", sx: swapButtonIconLoadingStyle })) : t('views.SWAP.swapForm.buttonText') }) }));
}

const containerStyles$1 = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 'base.spacing.x6',
    paddingBottom: 'base.spacing.x1',
    height: '100%',
};
const contentTextStyles$1 = {
    color: 'base.color.text.body.secondary',
    fontFamily: 'base.font.family.heading.secondary',
    textAlign: 'center',
    marginTop: 'base.spacing.x4',
};
const actionButtonContainerStyles$1 = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 'base.spacing.x2',
    height: '100%',
    width: '100%',
};
const actionButtonStyles$1 = {
    width: '100%',
    height: 'base.spacing.x16',
};
const logoContainerStyles$1 = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 'base.spacing.x6',
};

function NotEnoughImx({ environment, visible, showAdjustAmount, hasZeroImx, onCloseDrawer, onAddCoinsClick, }) {
    const { t } = useTranslation();
    const imxLogo = getImxTokenImage(environment);
    return (jsx(Drawer, { size: "full", onCloseDrawer: onCloseDrawer, visible: visible, showHeaderBar: false, children: jsx(Drawer.Content, { children: jsxs(Box, { testId: "not-enough-gas-bottom-sheet", sx: containerStyles$1, children: [jsx(CloudImage, { sx: { w: 'base.icon.size.600', h: 'base.icon.size.600' }, use: (jsx("img", { src: imxLogo, alt: t(`drawers.notEnoughImx.content.${hasZeroImx ? 'noImx' : 'insufficientImx'}.heading`) })) }), jsx(Heading, { size: "small", sx: contentTextStyles$1, testId: "not-enough-gas-heading", children: t(`drawers.notEnoughImx.content.${hasZeroImx ? 'noImx' : 'insufficientImx'}.heading`) }), jsx(Body, { sx: contentTextStyles$1, children: t(`drawers.notEnoughImx.content.${hasZeroImx ? 'noImx' : 'insufficientImx'}.body`) }), jsxs(Box, { sx: actionButtonContainerStyles$1, children: [showAdjustAmount && (jsx(Button, { testId: "not-enough-gas-adjust-amount-button", sx: actionButtonStyles$1, variant: "tertiary", onClick: onCloseDrawer, children: t('drawers.notEnoughImx.buttons.adjustAmount') })), jsx(Button, { testId: "not-enough-gas-add-imx-button", sx: actionButtonStyles$1, variant: "tertiary", onClick: onAddCoinsClick, children: t('drawers.notEnoughImx.buttons.addMoreImx') }), jsx(Button, { sx: actionButtonStyles$1, variant: "tertiary", onClick: onCloseDrawer, testId: "not-enough-gas-cancel-button", children: t('drawers.notEnoughImx.buttons.cancel') })] }), jsx(Box, { sx: logoContainerStyles$1, children: jsx(Logo, { testId: "footer-logo-image", logo: "ImmutableHorizontalLockup", sx: { width: 'base.spacing.x25' } }) })] }) }) }));
}

const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 'base.spacing.x6',
    paddingBottom: 'base.spacing.x4',
    paddingX: 'base.spacing.x4',
    height: '100%',
};
const contentTextStyles = {
    color: 'base.color.text.body.secondary',
    fontFamily: 'base.font.family.heading.secondary',
    textAlign: 'center',
    marginTop: 'base.spacing.x4',
};
const actionButtonContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 'base.spacing.x2',
    height: '100%',
    width: '100%',
};
const actionButtonStyles = {
    width: '100%',
    height: 'base.spacing.x16',
    marginBottom: 'base.spacing.x16',
};
const logoContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 'base.spacing.x6',
};
const statusStyles = {
    width: 'base.icon.size.600',
    fill: 'base.color.status.fatal.bright',
};

function UnableToSwap({ visible, onCloseDrawer }) {
    const { t } = useTranslation();
    return (jsx(Drawer, { size: "full", onCloseDrawer: onCloseDrawer, visible: visible, showHeaderBar: false, children: jsx(Drawer.Content, { children: jsxs(Box, { testId: "unable-to-swap-bottom-sheet", sx: containerStyles, children: [jsx(Icon, { icon: "Alert", testId: "unable-to-swap-icon", variant: "bold", sx: statusStyles }), jsx(Heading, { size: "small", sx: contentTextStyles, testId: "unable-to-swap-heading", children: t('drawers.unableToSwap.heading') }), jsx(Body, { sx: contentTextStyles, children: t('drawers.unableToSwap.body') }), jsx(Box, { sx: actionButtonContainerStyles, children: jsx(Button, { sx: actionButtonStyles, variant: "tertiary", onClick: onCloseDrawer, testId: "unable-to-swap-cancel-button", children: t('drawers.unableToSwap.buttons.cancel') }) }), jsx(Box, { sx: logoContainerStyles, children: jsx(Logo, { testId: "footer-logo-image", logo: "ImmutableHorizontalLockup", sx: { width: 'base.spacing.x25' } }) })] }) }) }));
}

const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = reactExports.useState(value);
    reactExports.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        // Cleanup the timer used by debounce
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);
    return debouncedValue;
};

/**
 * CancellablePromise extends a promise by adding the ability to flag it as cancelled.
 */
class CancellablePromise {
    static id = 0;
    promiseId = 0;
    promise;
    isCancelled = false;
    onCancel = null;
    rejectPromise = () => { };
    constructor(executor) {
        CancellablePromise.id += 1;
        this.promiseId = CancellablePromise.id;
        this.promise = new Promise((resolve, reject) => {
            // Save the reject function to use it for cancellation
            this.rejectPromise = reject;
            executor((value) => {
                if (!this.isCancelled) {
                    resolve(value);
                }
                else {
                    reject({ cancelled: true });
                }
            }, (reason) => {
                if (!this.isCancelled) {
                    reject(reason);
                }
                else {
                    reject({ cancelled: true });
                }
            });
        });
    }
    static all(values) {
        return new CancellablePromise((resolve, reject) => {
            Promise.all(values.map((value) => {
                if (value instanceof CancellablePromise) {
                    return value.promise;
                }
                return value;
            })).then(resolve, reject);
        });
    }
    then(onfulfilled, onrejected) {
        return new CancellablePromise((resolve, reject) => {
            this.promise.then((value) => (onfulfilled ? resolve(onfulfilled(value)) : resolve(value)), (reason) => (onrejected ? resolve(onrejected(reason)) : reject(reason)));
        });
    }
    catch(onrejected) {
        return this.then(undefined, onrejected);
    }
    finally(onfinally) {
        return new CancellablePromise((resolve, reject) => {
            this.promise
                .then(resolve, reject)
                .finally(() => {
                if (onfinally) {
                    onfinally();
                }
            });
        });
    }
    cancel() {
        if (!this.isCancelled) {
            this.isCancelled = true;
            if (this.onCancel) {
                this.onCancel();
            }
            this.rejectPromise({ cancelled: true });
        }
    }
    onCancelled(callback) {
        this.onCancel = callback;
    }
    get cancelled() {
        return this.isCancelled;
    }
}

/**
 * Formats a quote into a list of fees for the fee drawer
 * @param swapQuote
 * @param cryptoFiatState
 * @param t
 */
const formatSwapFees = (swapQuote, cryptoFiatState, t) => {
    const fees = [];
    if (!swapQuote.swap)
        return fees;
    const addFee = (estimate, label, prefix = '≈ ') => {
        const value = BigNumber.from(estimate?.value ?? 0);
        if (estimate && value.gt(0)) {
            const formattedFee = formatUnits(value, estimate.token.decimals);
            fees.push({
                label,
                fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${calculateCryptoToFiat(formattedFee, estimate.token.symbol || '', cryptoFiatState.conversions)}`,
                amount: `${tokenValueFormat(formattedFee)}`,
                prefix,
                token: estimate.token,
            });
        }
    };
    // Format gas fee
    if (swapQuote.swap && swapQuote.swap.gasFeeEstimate) {
        addFee(swapQuote.swap.gasFeeEstimate, t('drawers.feesBreakdown.fees.swapGasFee.label'));
    }
    // Format gas fee approval
    if (swapQuote.approval && swapQuote.approval.gasFeeEstimate) {
        addFee(swapQuote.approval.gasFeeEstimate, t('drawers.feesBreakdown.fees.approvalFee.label'));
    }
    // Format the secondary fees
    swapQuote.quote?.fees?.forEach((fee) => {
        addFee(fee.amount, t('drawers.feesBreakdown.fees.swapSecondaryFee.label', { amount: `${(fee.basisPoints / 100)}%` }), '');
    });
    return fees;
};

/**
 * Adjusts the quote for gas free txn so we don't have to adjust it everywhere
 * @param checkProvider
 * @param currentQuote
 */
const processGasFree = (checkProvider, currentQuote) => {
    if (!isGasFree(checkProvider)) {
        return currentQuote;
    }
    // Remove the quote gas fees as they are being covered by Relayer
    const adjustedQuote = { ...currentQuote };
    if (adjustedQuote.swap?.gasFeeEstimate) {
        adjustedQuote.swap.gasFeeEstimate.value = BigNumber.from(0);
    }
    if (adjustedQuote.approval?.gasFeeEstimate) {
        adjustedQuote.approval.gasFeeEstimate.value = BigNumber.from(0);
    }
    return adjustedQuote;
};

/**
 * Ensures that the fees token has the correct symbol. At the moment the dex quote doesn't return it.
 * Assumes the fee token is the from token. If it's not, it will be incorrect.
 * TODO: Fix this when the canonical tokens list comes into play so we can look up the symbol based on address
 * @param fromToken Assumption is fees are delineated in this from token
 * @param currentQuote
 */
const processSecondaryFees = (fromToken, currentQuote) => {
    if (!currentQuote.quote.fees)
        return currentQuote;
    const adjustedFees = currentQuote.quote.fees.map((fee) => {
        if (fee.amount.token.symbol)
            return fee;
        return {
            ...fee,
            amount: {
                ...fee.amount,
                token: {
                    ...fee.amount.token,
                    symbol: (fromToken.address === fee.amount.token.address) ? fromToken.symbol : fee.amount.token.symbol,
                },
            },
        };
    });
    return { ...currentQuote, quote: { ...currentQuote.quote, fees: adjustedFees } };
};

/**
 * Ensures that the quote token has the correct symbol. At the moment the dex quote doesn't return it.
 * @param toToken
 * @param currentQuote
 */
const processQuoteToken = (toToken, currentQuote) => {
    if (!currentQuote.quote.amount && !currentQuote.quote.amountWithMaxSlippage)
        return currentQuote;
    const adjustedAmount = {
        ...currentQuote.quote.amount,
        token: {
            ...currentQuote.quote.amount.token,
            symbol: (toToken.address === currentQuote.quote.amount.token.address)
                ? toToken.symbol : currentQuote.quote.amount.token.symbol,
        },
    };
    const adjustedAmountWithMaxSlippage = {
        ...currentQuote.quote.amountWithMaxSlippage,
        token: {
            ...currentQuote.quote.amountWithMaxSlippage.token,
            symbol: (toToken.address === currentQuote.quote.amountWithMaxSlippage.token.address)
                ? toToken.symbol : currentQuote.quote.amountWithMaxSlippage.token.symbol,
        },
    };
    return {
        ...currentQuote,
        quote: {
            ...currentQuote.quote,
            amount: adjustedAmount,
            amountWithMaxSlippage: adjustedAmountWithMaxSlippage,
        },
    };
};

const formatQuoteConversionRate = (amount, token, quote, labelKey, t) => {
    // Grab the token from the quote secondary fees
    // NOTE: This has a dependency on the secondary fee and needs to change if we change that fee
    const secondaryFee = quote.quote.fees[0];
    const fromToken = token;
    const toToken = quote.quote.amount.token;
    // Parse the fromAmount input, multiply by 10^decimals to convert to integer units
    const parsedFromAmount = parseFloat(amount);
    const relativeFromAmount = parseUnits(parsedFromAmount.toString(), fromToken.decimals);
    const relativeToAmount = BigNumber.from(quote.quote.amount.value);
    // Determine the maximum decimal places to equalize to
    const fromDecimals = fromToken.decimals;
    const toDecimals = quote.quote.amount.token.decimals;
    const maxDecimals = Math.max(fromDecimals, toDecimals);
    // Calculate scale factors based on maximum decimals
    const fromScaleFactor = BigNumber.from('10').pow(maxDecimals - fromDecimals);
    const toScaleFactor = BigNumber.from('10').pow(maxDecimals - toDecimals);
    // Adjust amounts to the same decimal scale
    const adjustedFromAmount = relativeFromAmount.mul(fromScaleFactor);
    const adjustedToAmount = relativeToAmount.mul(toScaleFactor);
    // Calculate conversion rate
    const initialRate = adjustedToAmount.div(adjustedFromAmount);
    // Calculate the remainder and adjust it correctly
    const conversionRemainder = adjustedToAmount.mod(adjustedFromAmount);
    const remainderAdjustmentFactor = BigNumber.from('10').pow(maxDecimals);
    const adjustedRemainder = conversionRemainder.mul(remainderAdjustmentFactor).div(adjustedFromAmount);
    // Compose the total conversion rate by adding the adjusted remainder
    const accurateRate = initialRate.mul(remainderAdjustmentFactor).add(adjustedRemainder);
    const formattedConversion = formatZeroAmount(tokenValueFormat(formatUnits(accurateRate, maxDecimals)), true);
    return t(labelKey, {
        fromSymbol: fromToken.symbol,
        toSymbol: toToken.symbol,
        rate: formattedConversion,
        fee: (secondaryFee?.basisPoints ?? 0) / 100,
    });
};

var SwapDirection;
(function (SwapDirection) {
    SwapDirection["FROM"] = "FROM";
    SwapDirection["TO"] = "TO";
})(SwapDirection || (SwapDirection = {}));
// Ensures that the to token address does not match the from token address
const shouldSetToAddress = (toAddress, fromAddress) => {
    if (toAddress === undefined)
        return false;
    if (toAddress === '')
        return false;
    if (fromAddress === toAddress)
        return false;
    return true;
};
let quoteRequest;
function SwapForm({ data, theme, cancelAutoProceed }) {
    const { t } = useTranslation();
    const { swapState: { allowedTokens, tokenBalances, network, autoProceed, }, } = reactExports.useContext(SwapContext);
    const { connectLoaderState } = reactExports.useContext(ConnectLoaderContext);
    const { checkout, provider } = connectLoaderState;
    const defaultTokenImage = getDefaultTokenImage(checkout?.config.environment, theme);
    const formatTokenOptionsId = reactExports.useCallback((symbol, address) => (isNativeToken(address)
        ? NATIVE
        : `${symbol.toLowerCase()}-${address.toLowerCase()}`), []);
    const { cryptoFiatState, cryptoFiatDispatch } = reactExports.useContext(CryptoFiatContext);
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const [direction, setDirection] = reactExports.useState(SwapDirection.FROM);
    const [loading, setLoading] = reactExports.useState(false);
    const { track } = useAnalytics();
    // Form State
    const [fromAmount, setFromAmount] = reactExports.useState(data?.fromAmount || '');
    const [fromAmountError, setFromAmountError] = reactExports.useState('');
    const debouncedFromAmount = useDebounce(fromAmount, ESTIMATE_DEBOUNCE);
    const [fromToken, setFromToken] = reactExports.useState();
    const [fromBalance, setFromBalance] = reactExports.useState('');
    const [fromTokenError, setFromTokenError] = reactExports.useState('');
    const [fromMaxTrigger, setFromMaxTrigger] = reactExports.useState(0);
    const [toAmount, setToAmount] = reactExports.useState(data?.toAmount || '');
    const [toAmountError, setToAmountError] = reactExports.useState('');
    const debouncedToAmount = useDebounce(toAmount, ESTIMATE_DEBOUNCE);
    const [toToken, setToToken] = reactExports.useState();
    const [toTokenError, setToTokenError] = reactExports.useState('');
    const [fromFiatValue, setFromFiatValue] = reactExports.useState('');
    const [loadedToAndFromTokens, setLoadedToAndFromTokens] = reactExports.useState(false);
    // Quote
    const [quote, setQuote] = reactExports.useState(null);
    const [gasFeeValue, setGasFeeValue] = reactExports.useState('');
    const [gasFeeToken, setGasFeeToken] = reactExports.useState(undefined);
    const [gasFeeFiatValue, setGasFeeFiatValue] = reactExports.useState('');
    const [tokensOptionsFrom, setTokensOptionsForm] = reactExports.useState([]);
    const formattedFees = reactExports.useMemo(() => (quote ? formatSwapFees(quote, cryptoFiatState, t) : []), [quote, cryptoFiatState, t]);
    const [conversionToken, setConversionToken] = reactExports.useState(null);
    const [conversionAmount, setConversionAmount] = reactExports.useState('');
    const swapConversionRateTooltip = reactExports.useMemo(() => {
        if (!quote || !conversionAmount || !conversionToken)
            return '';
        return formatQuoteConversionRate(conversionAmount, conversionToken, quote, 'views.SWAP.swapForm.conversionRate', t);
    }, [conversionAmount, conversionToken, quote, t]);
    // Drawers
    const [showNotEnoughImxDrawer, setShowNotEnoughImxDrawer] = reactExports.useState(false);
    const [showUnableToSwapDrawer, setShowUnableToSwapDrawer] = reactExports.useState(false);
    const [showNetworkSwitchDrawer, setShowNetworkSwitchDrawer] = reactExports.useState(false);
    const [showTxnRejectedState, setShowTxnRejectedState] = reactExports.useState(false);
    reactExports.useEffect(() => {
        if (tokenBalances.length === 0)
            return;
        if (!network)
            return;
        const fromOptions = tokenBalances
            .filter((b) => b.balance.gt(0))
            .map((tokenBalance) => ({
            id: formatTokenOptionsId(tokenBalance.token.symbol, tokenBalance.token.address),
            name: tokenBalance.token.name,
            symbol: tokenBalance.token.symbol,
            icon: tokenBalance.token.icon,
            balance: {
                formattedAmount: tokenValueFormat(tokenBalance.formattedBalance),
                formattedFiatAmount: cryptoFiatState.conversions.size === 0 ? formatZeroAmount('') : calculateCryptoToFiat(tokenBalance.formattedBalance, tokenBalance.token.symbol || '', cryptoFiatState.conversions),
            },
        }));
        setTokensOptionsForm(fromOptions);
        // Set initial token options if provided
        if (data?.fromTokenAddress && !fromToken) {
            setFromToken(allowedTokens.find((token) => (isNativeToken(token.address)
                && data?.fromTokenAddress?.toLowerCase() === NATIVE)
                || token.address?.toLowerCase()
                    === data?.fromTokenAddress?.toLowerCase()));
            setFromBalance(tokenBalances.find((tokenBalance) => (isNativeToken(tokenBalance.token.address)
                && data?.fromTokenAddress?.toLowerCase() === NATIVE)
                || (tokenBalance.token.address?.toLowerCase() === data?.fromTokenAddress?.toLowerCase()))?.formattedBalance ?? '');
        }
        if (shouldSetToAddress(data?.toTokenAddress, data?.fromTokenAddress) && !toToken) {
            setToToken(allowedTokens.find((token) => (isNativeToken(token.address) && data?.toTokenAddress?.toLowerCase() === NATIVE) || (token.address?.toLowerCase() === data?.toTokenAddress?.toLowerCase())));
        }
        setLoadedToAndFromTokens(true);
    }, [
        tokenBalances,
        allowedTokens,
        cryptoFiatState.conversions,
        data?.fromTokenAddress,
        data?.toTokenAddress,
        setFromToken,
        setFromBalance,
        setToToken,
        setTokensOptionsForm,
        formatTokenOptionsId,
        formatZeroAmount,
        network,
    ]);
    const tokensOptionsTo = reactExports.useMemo(() => allowedTokens
        .map((token) => ({
        id: formatTokenOptionsId(token.symbol, token.address),
        name: token.name,
        symbol: token.symbol,
        icon: token.icon,
    })), [allowedTokens, fromToken]);
    reactExports.useEffect(() => {
        cryptoFiatDispatch({
            payload: {
                type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
                tokenSymbols: allowedTokens.map((token) => token.symbol),
            },
        });
    }, [cryptoFiatDispatch, allowedTokens]);
    // ------------------//
    //    FETCH QUOTES   //
    // ------------------//
    const resetFormErrors = () => {
        setFromAmountError('');
        setFromTokenError('');
        setToAmountError('');
        setToTokenError('');
    };
    const resetQuote = () => {
        if (quoteRequest) {
            quoteRequest.cancel();
        }
        setConversionAmount('');
        setConversionToken(null);
        setGasFeeFiatValue('');
        setQuote(null);
    };
    const processFetchQuoteFrom = async (silently = false) => {
        if (!provider)
            return;
        if (!checkout)
            return;
        if (!fromToken)
            return;
        if (!toToken)
            return;
        try {
            const quoteResultPromise = checkout.swapQuote({
                provider,
                fromToken,
                toToken,
                fromAmount,
            });
            const currentQuoteRequest = CancellablePromise.all([
                quoteResultPromise,
            ]);
            quoteRequest = currentQuoteRequest;
            const resolved = await currentQuoteRequest;
            let quoteResult = processGasFree(provider, resolved[0]);
            quoteResult = processSecondaryFees(fromToken, quoteResult);
            quoteResult = processQuoteToken(toToken, quoteResult);
            const estimate = quoteResult.swap.gasFeeEstimate;
            let gasFeeTotal = BigNumber.from(estimate?.value || 0);
            if (quoteResult.approval?.gasFeeEstimate) {
                gasFeeTotal = gasFeeTotal.add(quoteResult.approval.gasFeeEstimate.value);
            }
            const gasFee = formatUnits(gasFeeTotal, DEFAULT_TOKEN_DECIMALS);
            const estimateToken = estimate?.token;
            const gasToken = allowedTokens.find((token) => token.address?.toLocaleLowerCase() === estimateToken?.address?.toLocaleLowerCase());
            setConversionToken(fromToken);
            setConversionAmount(fromAmount);
            setQuote(quoteResult);
            setGasFeeValue(gasFee);
            setGasFeeToken({
                name: gasToken?.name || '',
                symbol: gasToken?.symbol || '',
                decimals: gasToken?.decimals || 0,
                address: gasToken?.address,
                icon: gasToken?.icon,
            });
            setGasFeeFiatValue(calculateCryptoToFiat(gasFee, gasToken?.symbol || '', cryptoFiatState.conversions));
            setToAmount(formatZeroAmount(tokenValueFormat(formatUnits(quoteResult.quote.amount.value, quoteResult.quote.amount.token.decimals), quoteResult.quote.amount.token.decimals)));
            resetFormErrors();
        }
        catch (error) {
            if (!error.cancelled) {
                // eslint-disable-next-line no-console
                console.error('Error fetching quote.', error);
                resetQuote();
                setShowNotEnoughImxDrawer(false);
                setShowUnableToSwapDrawer(true);
            }
        }
        if (!silently) {
            setLoading(false);
        }
    };
    const processFetchQuoteTo = async (silently = false) => {
        if (!provider)
            return;
        if (!checkout)
            return;
        if (!fromToken)
            return;
        if (!toToken)
            return;
        try {
            const quoteResultPromise = checkout.swapQuote({
                provider,
                fromToken,
                toToken,
                fromAmount: undefined,
                toAmount,
            });
            const currentQuoteRequest = CancellablePromise.all([
                quoteResultPromise,
            ]);
            quoteRequest = currentQuoteRequest;
            const resolved = await currentQuoteRequest;
            let quoteResult = processGasFree(provider, resolved[0]);
            quoteResult = processSecondaryFees(fromToken, quoteResult);
            const estimate = quoteResult.swap.gasFeeEstimate;
            let gasFeeTotal = BigNumber.from(estimate?.value || 0);
            if (quoteResult.approval?.gasFeeEstimate) {
                gasFeeTotal = gasFeeTotal.add(quoteResult.approval.gasFeeEstimate.value);
            }
            const gasFee = formatUnits(gasFeeTotal, DEFAULT_TOKEN_DECIMALS);
            const estimateToken = estimate?.token;
            const gasToken = allowedTokens.find((token) => token.symbol === estimateToken?.symbol);
            setConversionToken(toToken);
            setConversionAmount(toAmount);
            setQuote(quoteResult);
            setGasFeeValue(gasFee);
            setGasFeeToken({
                name: gasToken?.name || '',
                symbol: gasToken?.symbol || '',
                decimals: gasToken?.decimals || 0,
                address: gasToken?.address,
                icon: gasToken?.icon,
            });
            setGasFeeFiatValue(calculateCryptoToFiat(gasFee, gasToken?.symbol || '', cryptoFiatState.conversions));
            setFromAmount(formatZeroAmount(tokenValueFormat(formatUnits(quoteResult.quote.amount.value, quoteResult.quote.amount.token.decimals))));
            resetFormErrors();
        }
        catch (error) {
            if (!error.cancelled) {
                resetQuote();
                setShowNotEnoughImxDrawer(false);
                setShowUnableToSwapDrawer(true);
            }
        }
        if (!silently) {
            setLoading(false);
        }
    };
    const canRunFromQuote = (amount, silently) => {
        if (Number.isNaN(parseFloat(amount)))
            return false;
        if (parseFloat(amount) <= 0)
            return false;
        if (!fromToken)
            return false;
        if (!toToken)
            return false;
        if (silently && loading)
            return false;
        return true;
    };
    const fetchQuoteFrom = async (silently = false) => {
        if (!canRunFromQuote(fromAmount, silently))
            return;
        // Cancel any existing quote
        if (quoteRequest) {
            quoteRequest.cancel();
        }
        if (!silently) {
            setLoading(true);
        }
        await processFetchQuoteFrom(silently);
    };
    const canRunToQuote = (amount, silently) => {
        if (Number.isNaN(parseFloat(amount)))
            return false;
        if (parseFloat(amount) <= 0)
            return false;
        if (!fromToken)
            return false;
        if (!toToken)
            return false;
        if (silently && loading)
            return false;
        return true;
    };
    const fetchQuoteTo = async (silently = false) => {
        if (!canRunToQuote(toAmount, silently))
            return;
        // Cancel any existing quote
        if (quoteRequest) {
            quoteRequest.cancel();
        }
        if (!silently) {
            setLoading(true);
        }
        await processFetchQuoteTo(silently);
    };
    const fetchQuote = async (silently = false) => {
        if (direction === SwapDirection.FROM)
            await fetchQuoteFrom(silently);
        else
            await fetchQuoteTo(silently);
    };
    // Silently refresh the quote
    useInterval(() => {
        fetchQuote(true);
    }, DEFAULT_QUOTE_REFRESH_INTERVAL);
    // Fetch quote triggers
    reactExports.useEffect(() => {
        if (direction === SwapDirection.FROM) {
            if (debouncedFromAmount <= 0) {
                setLoading(false);
                resetQuote();
                return;
            }
            (async () => await fetchQuote())();
        }
    }, [debouncedFromAmount, fromToken, toToken, fromMaxTrigger]);
    reactExports.useEffect(() => {
        if (direction === SwapDirection.TO) {
            if (debouncedToAmount <= 0) {
                setLoading(false);
                resetQuote();
                return;
            }
            (async () => await fetchQuote())();
        }
    }, [debouncedToAmount, toToken, fromToken]);
    // during swaps, having enough IMX to cover the gas fee means (only relevant for non-Passport wallets)
    // 1. swapping from any token to any token costs IMX - so do a check
    // 2. If the swap from token is also IMX, include the additional amount into the calc
    //    as user will need enough imx for the swap amount and the gas
    const insufficientFundsForGas = reactExports.useMemo(() => {
        if (!provider)
            return true;
        if (isPassportProvider(provider))
            return false;
        const imxBalance = tokenBalances.find((b) => b.token.address?.toLowerCase() === NATIVE);
        if (!imxBalance)
            return true;
        const fromTokenIsImx = fromToken?.address?.toLowerCase() === NATIVE;
        const gasAmount = parseEther(gasFeeValue.length !== 0 ? gasFeeValue : '0');
        const additionalAmount = fromTokenIsImx && !Number.isNaN(parseFloat(fromAmount))
            ? parseUnits(fromAmount, fromToken?.decimals || 18)
            : BigNumber.from('0');
        return gasAmount.add(additionalAmount).gt(imxBalance.balance);
    }, [gasFeeValue, tokenBalances, fromToken, fromAmount, provider]);
    // -------------//
    //     FROM     //
    // -------------//
    reactExports.useEffect(() => {
        if (!fromAmount)
            return;
        if (!fromToken)
            return;
        setFromFiatValue(calculateCryptoToFiat(fromAmount, fromToken.symbol, cryptoFiatState.conversions));
    }, [fromAmount, fromToken, cryptoFiatState.conversions]);
    const onFromSelectChange = reactExports.useCallback((value) => {
        const selected = tokenBalances
            .find((tokenBalance) => value === formatTokenOptionsId(tokenBalance.token.symbol, tokenBalance.token.address));
        if (!selected)
            return;
        if (toToken && value === formatTokenOptionsId(toToken.symbol, toToken?.address)) {
            setToToken(undefined);
        }
        setFromToken(selected.token);
        setFromBalance(selected.formattedBalance);
        setFromTokenError('');
    }, [toToken]);
    const onFromTextInputFocus = () => {
        setDirection(SwapDirection.FROM);
    };
    const onFromTextInputChange = (value) => {
        if (value === fromAmount) {
            return;
        }
        resetFormErrors();
        resetQuote();
        setToAmount('');
        if (canRunFromQuote(value, false)) {
            setLoading(true);
        }
        setFromAmount(value);
    };
    const textInputMaxButtonClick = () => {
        if (!fromBalance)
            return;
        const fromBalanceTruncated = fromBalance.slice(0, fromBalance.indexOf('.') + DEFAULT_TOKEN_VALIDATION_DECIMALS + 1);
        resetFormErrors();
        resetQuote();
        setDirection(SwapDirection.FROM);
        setToAmount('');
        if (canRunFromQuote(fromBalanceTruncated, false)) {
            setLoading(true);
        }
        if (fromAmount === fromBalanceTruncated) {
            setFromMaxTrigger(fromMaxTrigger + 1);
        }
        else {
            setFromAmount(fromBalanceTruncated);
        }
        track({
            userJourney: UserJourney.SWAP,
            screen: 'SwapCoins',
            control: 'MaxFrom',
            controlType: 'Button',
            extras: {
                fromBalance,
                fromBalanceTruncated,
            },
        });
    };
    // ------------//
    //      TO     //
    // ------------//
    const onToSelectChange = reactExports.useCallback((value) => {
        const selected = allowedTokens.find((token) => value === formatTokenOptionsId(token.symbol, token.address));
        if (!selected)
            return;
        if (fromToken && value === formatTokenOptionsId(fromToken.symbol, fromToken?.address)) {
            setFromToken(undefined);
        }
        setToToken(selected);
        setToTokenError('');
    }, [fromToken]);
    const onToTextInputFocus = () => {
        setDirection(SwapDirection.TO);
    };
    const onToTextInputChange = (value) => {
        if (value === toAmount) {
            return;
        }
        resetFormErrors();
        resetQuote();
        setFromFiatValue('');
        setFromAmount('');
        if (canRunToQuote(value, false)) {
            setLoading(true);
        }
        setToAmount(value);
    };
    const openNotEnoughImxDrawer = () => {
        setShowUnableToSwapDrawer(false);
        setShowNotEnoughImxDrawer(true);
    };
    const SwapFormValidator = () => {
        const validateFromTokenError = validateFromToken(fromToken);
        const validateFromAmountError = validateFromAmount(fromAmount, fromBalance);
        const validateToTokenError = validateToToken(toToken);
        const validateToAmountError = validateToAmount(toAmount);
        if (direction === SwapDirection.FROM) {
            setToAmountError('');
            if (validateFromAmountError) {
                setFromAmountError(validateFromAmountError);
            }
        }
        else if (direction === SwapDirection.TO) {
            setFromAmountError('');
            if (validateToAmountError) {
                setToAmountError(validateToAmountError);
            }
        }
        if (validateFromTokenError)
            setFromTokenError(validateFromTokenError);
        if (validateToTokenError)
            setToTokenError(validateToTokenError);
        let isSwapFormValid = true;
        if (validateFromTokenError
            || validateToTokenError
            || (validateFromAmountError && direction === SwapDirection.FROM)
            || (validateToAmountError && direction === SwapDirection.TO))
            isSwapFormValid = false;
        track({
            userJourney: UserJourney.SWAP,
            screen: 'SwapCoins',
            control: 'FormValid',
            controlType: 'Button',
            extras: {
                isSwapFormValid,
                swapFromAddress: fromToken?.address,
                swapFromAmount: fromAmount,
                swapFromTokenSymbol: fromToken?.symbol,
                swapToAddress: toToken?.address,
                swapToAmount: toAmount,
                swapToTokenSymbol: toToken?.symbol,
                autoProceed,
            },
        });
        return isSwapFormValid;
    };
    const isFormValidForAutoProceed = reactExports.useMemo(() => {
        if (!autoProceed)
            return false;
        if (loadedToAndFromTokens === false)
            return false;
        return !loading;
    }, [autoProceed, loading, loadedToAndFromTokens]);
    const canAutoSwap = reactExports.useMemo(() => {
        if (!autoProceed)
            return false;
        if (!isFormValidForAutoProceed)
            return false;
        const isFormValid = SwapFormValidator();
        if (!isFormValid) {
            cancelAutoProceed();
            return false;
        }
        return true;
    }, [isFormValidForAutoProceed]);
    const sendTransaction = async () => {
        if (!quote)
            return;
        const transaction = quote;
        const isValid = SwapFormValidator();
        // Tracking swap from data here and is valid or not to understand behaviour
        track({
            userJourney: UserJourney.SWAP,
            screen: 'SwapCoins',
            control: 'Swap',
            controlType: 'Button',
            extras: {
                swapFromAddress: data?.fromTokenAddress,
                swapFromAmount: data?.fromAmount,
                swapFromTokenSymbol: data?.fromTokenSymbol,
                swapToAddress: data?.toTokenAddress,
                swapToAmount: data?.toAmount,
                swapToTokenSymbol: data?.toTokenSymbol,
                isSwapFormValid: isValid,
                hasFundsForGas: !insufficientFundsForGas,
                autoProceed,
            },
        });
        if (!isValid)
            return;
        if (!checkout || !provider || !transaction)
            return;
        if (insufficientFundsForGas) {
            cancelAutoProceed();
            openNotEnoughImxDrawer();
            return;
        }
        try {
            // check for switch network here
            const currentChainId = await provider.provider.request({ method: 'eth_chainId', params: [] });
            // eslint-disable-next-line radix
            const parsedChainId = parseInt(currentChainId.toString());
            if (parsedChainId !== getL2ChainId(checkout.config)) {
                setShowNetworkSwitchDrawer(true);
                return;
            }
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error('Current network check failed', err);
        }
        if (!transaction)
            return;
        setLoading(true);
        const prefilledSwapData = {
            fromAmount: data?.fromAmount || '',
            fromTokenAddress: data?.fromTokenAddress || '',
            toTokenAddress: data?.toTokenAddress || '',
            toAmount: data?.toAmount || '',
        };
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SwapWidgetViews.APPROVE_ERC20,
                    data: {
                        approveTransaction: transaction.approval?.transaction,
                        transaction: transaction.swap.transaction,
                        info: transaction.quote,
                        swapFormInfo: prefilledSwapData,
                        autoProceed,
                    },
                },
            },
        });
    };
    const shouldSendTransaction = reactExports.useMemo(() => {
        if (canAutoSwap === true && autoProceed === true) {
            return true;
        }
        return undefined;
    }, [canAutoSwap, autoProceed]);
    reactExports.useEffect(() => {
        if (shouldSendTransaction === undefined)
            return;
        sendTransaction();
    }, [shouldSendTransaction]);
    return (jsxs(Fragment, { children: [jsxs(Box, { sx: {
                    visibility: autoProceed ? 'hidden' : 'visible',
                    paddingX: 'base.spacing.x4',
                    marginBottom: 'base.spacing.x2',
                }, children: [jsx(Heading, { size: "small", weight: "regular", sx: { paddingBottom: 'base.spacing.x4' }, children: t('views.SWAP.content.title') }), jsxs(Box, { sx: {
                            display: 'flex',
                            flexDirection: 'column',
                            rowGap: 'base.spacing.x6',
                            paddingBottom: 'base.spacing.x2',
                        }, children: [jsxs(Box, { children: [jsx(Heading, { size: "xSmall", sx: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            paddingBottom: 'base.spacing.x1',
                                        }, children: t('views.SWAP.swapForm.from.label') }), jsx(SelectInput, { testId: "fromTokenInputs", options: tokensOptionsFrom, selectSubtext: fromToken
                                            ? `${t('views.SWAP.content.availableBalancePrefix')} ${tokenValueFormat(fromBalance)}`
                                            : '', selectTextAlign: "left", textInputType: "number", testInputMode: "decimal", textInputValue: fromAmount, textInputPlaceholder: t('views.SWAP.swapForm.from.inputPlaceholder'), textInputSubtext: `${t('views.SWAP.content.fiatPricePrefix')} 
              $${formatZeroAmount(fromFiatValue, true)}`, textInputTextAlign: "right", textInputValidator: amountInputValidation, onTextInputChange: (v) => onFromTextInputChange(v), onTextInputFocus: onFromTextInputFocus, textInputMaxButtonClick: textInputMaxButtonClick, onSelectChange: onFromSelectChange, textInputErrorMessage: t(fromAmountError), selectErrorMessage: t(fromTokenError), selectedOption: fromToken
                                            ? formatTokenOptionsId(fromToken.symbol, fromToken.address)
                                            : undefined, coinSelectorHeading: t('views.SWAP.swapForm.from.selectorTitle'), defaultTokenImage: defaultTokenImage, environment: checkout?.config.environment, theme: theme })] }), jsxs(Box, { children: [jsxs(Box, { sx: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            paddingBottom: 'base.spacing.x1',
                                        }, children: [jsx(Heading, { size: "xSmall", children: t('views.SWAP.swapForm.to.label') }), swapConversionRateTooltip?.length > 0 && (jsxs(Tooltip, { children: [jsx(Tooltip.Target, { children: jsx(Icon, { icon: "InformationCircle", sx: {
                                                                w: 'base.icon.size.300',
                                                            } }) }), jsx(Tooltip.Content, { children: swapConversionRateTooltip })] }))] }), jsx(SelectInput, { testId: "toTokenInputs", options: tokensOptionsTo, selectTextAlign: "left", textInputType: "number", testInputMode: "decimal", textInputValue: toAmount, textInputPlaceholder: t('views.SWAP.swapForm.to.inputPlaceholder'), textInputTextAlign: "right", textInputValidator: amountInputValidation, onTextInputChange: (v) => onToTextInputChange(v), onTextInputFocus: onToTextInputFocus, onSelectChange: onToSelectChange, textInputErrorMessage: t(toAmountError), selectErrorMessage: t(toTokenError), selectedOption: toToken
                                            ? formatTokenOptionsId(toToken.symbol, toToken.address)
                                            : undefined, coinSelectorHeading: t('views.SWAP.swapForm.to.selectorTitle'), defaultTokenImage: defaultTokenImage, environment: checkout?.config.environment, theme: theme })] })] }), !isPassportProvider(provider) && (jsx(Fees, { gasFeeFiatValue: gasFeeFiatValue, gasFeeToken: gasFeeToken, gasFeeValue: gasFeeValue, fees: formattedFees, onFeesClick: () => {
                            track({
                                userJourney: UserJourney.SWAP,
                                screen: 'SwapCoins',
                                control: 'ViewFees',
                                controlType: 'Button',
                            });
                        }, sx: {
                            paddingBottom: '0',
                        }, loading: loading }))] }), !autoProceed && (jsx(SwapButton, { validator: SwapFormValidator, loading: loading, sendTransaction: sendTransaction })), jsx(TransactionRejected, { visible: showTxnRejectedState, showHeaderBar: false, onCloseDrawer: () => setShowTxnRejectedState(false), onRetry: () => {
                    sendTransaction();
                    setShowTxnRejectedState(false);
                } }), jsx(NotEnoughImx, { environment: checkout?.config.environment ?? Environment.PRODUCTION, visible: showNotEnoughImxDrawer, showAdjustAmount: fromToken?.address === NATIVE, hasZeroImx: false, onAddCoinsClick: () => {
                    viewDispatch({
                        payload: {
                            type: ViewActions.UPDATE_VIEW,
                            view: {
                                type: SharedViews.TOP_UP_VIEW,
                            },
                            currentViewData: {
                                fromTokenAddress: fromToken?.address ?? '',
                                fromAmount,
                                toTokenAddress: toToken?.address ?? '',
                            },
                        },
                    });
                }, onCloseDrawer: () => setShowNotEnoughImxDrawer(false) }), jsx(UnableToSwap, { visible: showUnableToSwapDrawer, onCloseDrawer: () => {
                    setShowUnableToSwapDrawer(false);
                    setFromToken(undefined);
                    setFromAmount('');
                    setToToken(undefined);
                    setToAmount('');
                } }), jsx(NetworkSwitchDrawer, { visible: showNetworkSwitchDrawer, targetChainId: getL2ChainId(checkout?.config), provider: provider, checkout: checkout, onCloseDrawer: () => setShowNetworkSwitchDrawer(false) })] }));
}

const hasZeroBalance = (tokenBalances, symbol) => {
    if (tokenBalances.length === 0)
        return true;
    let zeroBalance = false;
    tokenBalances
        .forEach((t) => {
        if (t.token.symbol === symbol && t.balance.eq(0)) {
            zeroBalance = true;
        }
    });
    return zeroBalance;
};

function SwapCoins({ theme, cancelAutoProceed, fromAmount, toAmount, fromTokenAddress, toTokenAddress, showBackButton, }) {
    const { t } = useTranslation();
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { eventTargetState: { eventTarget } } = reactExports.useContext(EventTargetContext);
    const { swapState: { tokenBalances, autoProceed, }, } = reactExports.useContext(SwapContext);
    const { connectLoaderState: { checkout, provider, }, } = reactExports.useContext(ConnectLoaderContext);
    const [showNotEnoughImxDrawer, setShowNotEnoughImxDrawer] = reactExports.useState(false);
    const { page } = useAnalytics();
    reactExports.useEffect(() => {
        page({
            userJourney: UserJourney.SWAP,
            screen: 'SwapCoins',
            extras: {
                fromAmount,
                toAmount,
                fromTokenAddress,
                toTokenAddress,
            },
        });
    }, []);
    reactExports.useEffect(() => {
        if (hasZeroBalance(tokenBalances, IMX_TOKEN_SYMBOL) && !isPassportProvider(provider)) {
            setShowNotEnoughImxDrawer(true);
        }
    }, [tokenBalances]);
    return (jsxs(SimpleLayout, { header: !autoProceed ? (jsx(HeaderNavigation, { title: t('views.SWAP.header.title'), onCloseButtonClick: () => sendSwapWidgetCloseEvent(eventTarget), showBack: showBackButton, onBackButtonClick: () => {
                orchestrationEvents.sendRequestGoBackEvent(eventTarget, IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT, {});
            } })) : '', footer: jsx(QuickswapFooter, { environment: checkout?.config.environment, theme: theme }), children: [jsxs(Box, { sx: {
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }, children: [jsx(SwapForm, { cancelAutoProceed: cancelAutoProceed, data: {
                            fromAmount,
                            toAmount,
                            fromTokenAddress,
                            toTokenAddress,
                        }, theme: theme }), jsx(NotEnoughImx, { environment: checkout?.config.environment ?? Environment.PRODUCTION, visible: showNotEnoughImxDrawer, showAdjustAmount: false, hasZeroImx: true, onAddCoinsClick: () => {
                            viewDispatch({
                                payload: {
                                    type: ViewActions.UPDATE_VIEW,
                                    view: {
                                        type: SharedViews.TOP_UP_VIEW,
                                    },
                                },
                            });
                        }, onCloseDrawer: () => {
                            setShowNotEnoughImxDrawer(false);
                        } })] }), autoProceed && jsx(LoadingView, { loadingText: t('views.SWAP.PREPARE_SWAP.loading.text') })] }));
}

function SwapInProgress({ transactionResponse, swapForm, }) {
    const { t } = useTranslation();
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { page } = useAnalytics();
    reactExports.useEffect(() => {
        page({
            userJourney: UserJourney.SWAP,
            screen: 'SwapInProgress',
            extras: {
                swapFormInfo: swapForm,
            },
        });
    }, []);
    reactExports.useEffect(() => {
        (async () => {
            try {
                const receipt = await transactionResponse.wait();
                if (receipt.status === 1) {
                    viewDispatch({
                        payload: {
                            type: ViewActions.UPDATE_VIEW,
                            view: {
                                type: SwapWidgetViews.SUCCESS,
                                data: {
                                    fromTokenAddress: swapForm.fromTokenAddress,
                                    fromAmount: swapForm.fromAmount,
                                    toTokenAddress: swapForm.toTokenAddress,
                                    toAmount: swapForm.toAmount || '',
                                    transactionHash: receipt.transactionHash,
                                },
                            },
                        },
                    });
                    return;
                }
                viewDispatch({
                    payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: {
                            type: SwapWidgetViews.FAIL,
                            data: swapForm,
                            reason: 'Transaction failed',
                        },
                    },
                });
            }
            catch {
                viewDispatch({
                    payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: {
                            type: SwapWidgetViews.FAIL,
                            data: swapForm,
                            reason: 'Transaction failed',
                        },
                    },
                });
            }
        })();
    }, [transactionResponse]);
    return (jsx(LoadingView, { loadingText: t('views.SWAP.IN_PROGRESS.loading.text') }));
}

function ApproveERC20Onboarding({ data }) {
    const { t } = useTranslation();
    const { swapState: { allowedTokens } } = reactExports.useContext(SwapContext);
    const { connectLoaderState } = reactExports.useContext(ConnectLoaderContext);
    const { checkout, provider } = connectLoaderState;
    const { viewDispatch } = reactExports.useContext(ViewContext);
    const { eventTargetState: { eventTarget } } = reactExports.useContext(EventTargetContext);
    const isPassport = isPassportProvider(provider);
    const noApprovalTransaction = data.approveTransaction === undefined;
    // Local state
    const [actionDisabled, setActionDisabled] = reactExports.useState(false);
    const [approvalTxnLoading, setApprovalTxnLoading] = reactExports.useState(false);
    const [showSwapTxnStep, setShowSwapTxnStep] = reactExports.useState(noApprovalTransaction);
    const [loading, setLoading] = reactExports.useState(false);
    // reject transaction flags
    const [rejectedSpending, setRejectedSpending] = reactExports.useState(false);
    const [rejectedSwap, setRejectedSwap] = reactExports.useState(false);
    const { page, track } = useAnalytics();
    reactExports.useEffect(() => {
        page({
            userJourney: UserJourney.SWAP,
            screen: 'ApproveERC20',
            extras: {
                swapFormInfo: data.swapFormInfo,
            },
        });
    }, []);
    // Get symbol from swap info for approve amount text
    const fromToken = reactExports.useMemo(() => allowedTokens.find((token) => token.address === data.swapFormInfo.fromTokenAddress), [allowedTokens, data.swapFormInfo.fromTokenAddress]);
    // Common error view function
    const showErrorView = reactExports.useCallback(() => {
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SharedViews.ERROR_VIEW,
                    error: new Error('No checkout object or no provider object found'),
                },
            },
        });
    }, [viewDispatch]);
    const goBackWithSwapData = reactExports.useCallback(() => {
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SwapWidgetViews.SWAP,
                    data: data.swapFormInfo,
                },
            },
        });
    }, [viewDispatch]);
    const handleExceptions = (err, swapFormData) => {
        if (err.type === CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT) {
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: SwapWidgetViews.PRICE_SURGE,
                        data: swapFormData,
                    },
                },
            });
            return;
        }
        if (err.type === CheckoutErrorType.TRANSACTION_FAILED
            || err.type === CheckoutErrorType.INSUFFICIENT_FUNDS
            || (err.receipt && err.receipt.status === 0)) {
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: SwapWidgetViews.FAIL,
                        reason: 'Transaction failed',
                        data: swapFormData,
                    },
                },
            });
            return;
        }
        // eslint-disable-next-line no-console
        console.error('Approve ERC20 failed', err);
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SharedViews.ERROR_VIEW,
                    error: err,
                },
            },
        });
    };
    const prepareTransaction = (transaction, isGasFree = false) => ({
        ...transaction,
        gasPrice: (isGasFree ? BigNumber.from(0) : undefined),
    });
    /* --------------------- */
    // Approve spending step //
    /* --------------------- */
    const handleApproveSpendingClick = reactExports.useCallback(async () => {
        if (loading)
            return;
        track({
            userJourney: UserJourney.SWAP,
            screen: 'ApproveERC20',
            control: 'ApproveSpending',
            controlType: 'Button',
            extras: {
                autoProceed: data.autoProceed,
            },
        });
        setLoading(true);
        if (!checkout || !provider) {
            showErrorView();
            return;
        }
        if (actionDisabled)
            return;
        setActionDisabled(true);
        try {
            const txnResult = await checkout.sendTransaction({
                provider,
                transaction: prepareTransaction(data.approveTransaction, isPassport),
            });
            setApprovalTxnLoading(true);
            const approvalReceipt = await txnResult.transactionResponse.wait();
            if (approvalReceipt.status !== 1) {
                viewDispatch({
                    payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: {
                            type: SwapWidgetViews.FAIL,
                            data: data.swapFormInfo,
                        },
                    },
                });
                return;
            }
            setApprovalTxnLoading(false);
            setActionDisabled(false);
            setShowSwapTxnStep(true);
        }
        catch (err) {
            setApprovalTxnLoading(false);
            setActionDisabled(false);
            if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
                setRejectedSpending(true);
                return;
            }
            handleExceptions(err, data.swapFormInfo);
        }
        finally {
            setLoading(false);
        }
    }, [
        checkout,
        provider,
        showErrorView,
        viewDispatch,
        setRejectedSwap,
        data.approveTransaction,
        data.swapFormInfo,
        actionDisabled,
        setActionDisabled,
        setApprovalTxnLoading,
    ]);
    const approveSpendingContent = reactExports.useMemo(() => (jsxs(SimpleTextBody, { heading: t(`views.APPROVE_ERC20.approveSpending.content.${isPassport ? 'passport' : 'metamask'}.heading`), children: [isPassport && (jsx(Box, { children: t('views.APPROVE_ERC20.approveSpending.content.passport.body') })), !isPassport
                // eslint-disable-next-line max-len
                && (jsx(Box, { children: t('views.APPROVE_ERC20.approveSpending.content.metamask.body', { amount: `${data.swapFormInfo.fromAmount} ${fromToken?.symbol || ''}` }) }))] })), [data.swapFormInfo, fromToken, isPassport]);
    const approveSpendingFooter = reactExports.useMemo(() => (jsx(FooterButton, { loading: loading, actionText: t(rejectedSpending
            ? 'views.APPROVE_ERC20.approveSpending.footer.retryText'
            : 'views.APPROVE_ERC20.approveSpending.footer.buttonText'), onActionClick: handleApproveSpendingClick })), [rejectedSpending, handleApproveSpendingClick, loading]);
    /* ----------------- */
    // Approve swap step //
    /* ----------------- */
    const handleApproveSwapClick = reactExports.useCallback(async () => {
        if (loading)
            return;
        track({
            userJourney: UserJourney.SWAP,
            screen: 'ApproveERC20',
            control: 'ApproveSwap',
            controlType: 'Button',
            extras: {
                autoProceed: data.autoProceed,
            },
        });
        setLoading(true);
        if (!checkout || !provider) {
            showErrorView();
            return;
        }
        if (actionDisabled)
            return;
        setActionDisabled(true);
        try {
            const txn = await checkout.sendTransaction({
                provider,
                transaction: prepareTransaction(data.transaction, isPassport),
            });
            setActionDisabled(false);
            // user approves swap
            // go to the Swap In Progress View
            viewDispatch({
                payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: {
                        type: SwapWidgetViews.IN_PROGRESS,
                        data: {
                            transactionResponse: txn.transactionResponse,
                            swapForm: data.swapFormInfo,
                        },
                    },
                },
            });
        }
        catch (err) {
            setActionDisabled(false);
            if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
                setRejectedSwap(true);
                return;
            }
            handleExceptions(err, data.swapFormInfo);
        }
        finally {
            setLoading(false);
        }
    }, [
        checkout,
        provider,
        showErrorView,
        viewDispatch,
        setRejectedSwap,
        data.transaction,
        data.swapFormInfo,
        actionDisabled,
        setActionDisabled,
    ]);
    const approveSwapContent = (jsx(SimpleTextBody, { heading: t('views.APPROVE_ERC20.approveSwap.content.heading'), children: jsx(Box, { children: t('views.APPROVE_ERC20.approveSwap.content.body') }) }));
    const approveSwapFooter = reactExports.useMemo(() => (jsx(FooterButton, { loading: loading, actionText: t(rejectedSwap
            ? 'views.APPROVE_ERC20.approveSwap.footer.retryText'
            : 'views.APPROVE_ERC20.approveSwap.footer.buttonText'), onActionClick: handleApproveSwapClick })), [rejectedSwap, handleApproveSwapClick, loading]);
    return (jsxs(Fragment, { children: [approvalTxnLoading && (jsx(LoadingView, { loadingText: t('views.APPROVE_ERC20.approveSpending.loading.text') })), !approvalTxnLoading && (jsx(SimpleLayout, { header: (jsx(HeaderNavigation, { transparent: true, showBack: true, onCloseButtonClick: () => sendSwapWidgetCloseEvent(eventTarget), onBackButtonClick: goBackWithSwapData })), floatHeader: true, heroContent: showSwapTxnStep ? jsx(WalletApproveHero, {}) : jsx(SpendingCapHero, {}), footer: showSwapTxnStep ? approveSwapFooter : approveSpendingFooter, children: showSwapTxnStep ? approveSwapContent : approveSpendingContent }))] }));
}

function SwapWidget({ amount, fromTokenAddress, toTokenAddress, config, autoProceed, direction, showBackButton, }) {
    const { t } = useTranslation();
    const { eventTargetState: { eventTarget }, } = reactExports.useContext(EventTargetContext);
    const { environment, theme, isOnRampEnabled, isSwapEnabled, isBridgeEnabled, } = config;
    const { connectLoaderState: { checkout, provider }, } = reactExports.useContext(ConnectLoaderContext);
    const [viewState, viewDispatch] = reactExports.useReducer(viewReducer, {
        ...initialViewState,
        history: [],
    });
    const [swapState, swapDispatch] = reactExports.useReducer(swapReducer, initialSwapState);
    const { page } = useAnalytics();
    const [errorViewLoading, setErrorViewLoading] = reactExports.useState(false);
    const swapReducerValues = reactExports.useMemo(() => ({ swapState, swapDispatch }), [swapState, swapDispatch]);
    const viewReducerValues = reactExports.useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);
    const showErrorView = reactExports.useCallback((error, tryAgain) => {
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                    type: SharedViews.ERROR_VIEW,
                    tryAgain,
                    error,
                },
            },
        });
    }, [viewDispatch]);
    const showSwapView = reactExports.useCallback(() => {
        viewDispatch({
            payload: {
                type: ViewActions.UPDATE_VIEW,
                view: { type: SwapWidgetViews.SWAP },
            },
        });
    }, [viewDispatch]);
    const loadBalances = reactExports.useCallback(async () => {
        if (!checkout)
            throw new Error('loadBalances: missing checkout');
        if (!provider)
            throw new Error('loadBalances: missing provider');
        try {
            const tokensAndBalances = await getAllowedBalances({
                checkout,
                provider,
                allowTokenListType: TokenFilterTypes.SWAP,
            });
            // Why? Check getAllowedBalances
            if (tokensAndBalances === undefined)
                return false;
            swapDispatch({
                payload: {
                    type: SwapActions.SET_ALLOWED_TOKENS,
                    allowedTokens: tokensAndBalances.allowList.tokens,
                },
            });
            swapDispatch({
                payload: {
                    type: SwapActions.SET_TOKEN_BALANCES,
                    tokenBalances: tokensAndBalances.allowedBalances,
                },
            });
        }
        catch (err) {
            if (DEFAULT_BALANCE_RETRY_POLICY.nonRetryable(err)) {
                showErrorView(err, loadBalances);
                return false;
            }
        }
        return true;
    }, [checkout, provider]);
    reactExports.useEffect(() => {
        (async () => {
            if (!checkout || !provider)
                return;
            const network = await checkout.getNetworkInfo({ provider });
            // If the provider's network is not the correct network, return out of this and let the
            // connect loader handle the switch network functionality
            if (network.chainId !== getL2ChainId(checkout.config))
                return;
            swapDispatch({
                payload: {
                    type: SwapActions.SET_NETWORK,
                    network,
                },
            });
            if (!(await loadBalances()))
                return;
            if (viewState.view.type === SharedViews.LOADING_VIEW) {
                showSwapView();
            }
        })();
    }, [checkout, provider]);
    reactExports.useEffect(() => {
        swapDispatch({
            payload: {
                type: SwapActions.SET_AUTO_PROCEED,
                autoProceed: autoProceed ?? false,
                direction: direction ?? SwapDirection$1.FROM,
            },
        });
    }, [autoProceed, direction]);
    const cancelAutoProceed = reactExports.useCallback(() => {
        if (autoProceed) {
            swapDispatch({
                payload: {
                    type: SwapActions.SET_AUTO_PROCEED,
                    autoProceed: false,
                    direction: SwapDirection$1.FROM,
                },
            });
        }
    }, [autoProceed, swapDispatch]);
    const fromAmount = direction === SwapDirection$1.FROM || direction == null ? amount : undefined;
    const toAmount = direction === SwapDirection$1.TO ? amount : undefined;
    return (jsx(ViewContext.Provider, { value: viewReducerValues, children: jsx(SwapContext.Provider, { value: swapReducerValues, children: jsxs(CryptoFiatProvider, { environment: environment, children: [viewState.view.type === SharedViews.LOADING_VIEW && (jsx(LoadingView, { loadingText: t('views.LOADING_VIEW.text') })), viewState.view.type === SwapWidgetViews.SWAP && (jsx(SwapCoins, { theme: theme, cancelAutoProceed: cancelAutoProceed, fromAmount: viewState.view.data?.fromAmount ?? fromAmount, toAmount: viewState.view.data?.toAmount ?? toAmount, fromTokenAddress: viewState.view.data?.fromTokenAddress ?? fromTokenAddress, toTokenAddress: viewState.view.data?.toTokenAddress ?? toTokenAddress, showBackButton: showBackButton })), viewState.view.type === SwapWidgetViews.IN_PROGRESS && (jsx(SwapInProgress, { transactionResponse: viewState.view.data.transactionResponse, swapForm: viewState.view.data.swapForm })), viewState.view.type === SwapWidgetViews.APPROVE_ERC20 && (jsx(ApproveERC20Onboarding, { data: viewState.view.data })), viewState.view.type === SwapWidgetViews.SUCCESS && (jsx(StatusView, { statusText: t('views.SWAP.success.text'), actionText: t('views.SWAP.success.actionText'), onRenderEvent: () => {
                            page({
                                userJourney: UserJourney.SWAP,
                                screen: 'SwapSuccess',
                                extras: {
                                    fromTokenAddress: viewState.view.data?.fromTokenAddress,
                                    fromAmount: viewState.view.data?.fromAmount,
                                    toTokenAddress: viewState.view.data?.toTokenAddress,
                                    toAmount: viewState.view.data?.toAmount,
                                },
                            });
                            sendSwapSuccessEvent(eventTarget, viewState.view.data.transactionHash);
                        }, onActionClick: () => sendSwapWidgetCloseEvent(eventTarget), statusType: StatusType.SUCCESS, testId: "success-view" })), viewState.view.type === SwapWidgetViews.FAIL && (jsx(StatusView, { statusText: t('views.SWAP.failed.text'), actionText: t('views.SWAP.failed.actionText'), onRenderEvent: () => {
                            page({
                                userJourney: UserJourney.SWAP,
                                screen: 'SwapFailed',
                            });
                            sendSwapFailedEvent(eventTarget, 'Transaction failed');
                        }, onActionClick: () => {
                            if (viewState.view.type === SwapWidgetViews.FAIL) {
                                viewDispatch({
                                    payload: {
                                        type: ViewActions.UPDATE_VIEW,
                                        view: {
                                            type: SwapWidgetViews.SWAP,
                                            data: viewState.view.data,
                                        },
                                    },
                                });
                            }
                        }, statusType: StatusType.FAILURE, onCloseClick: () => sendSwapWidgetCloseEvent(eventTarget), testId: "fail-view" })), viewState.view.type === SwapWidgetViews.PRICE_SURGE && (jsx(StatusView, { statusText: t('views.SWAP.rejected.text'), actionText: t('views.SWAP.rejected.actionText'), onRenderEvent: () => {
                            page({
                                userJourney: UserJourney.SWAP,
                                screen: 'PriceSurge',
                            });
                            sendSwapRejectedEvent(eventTarget, 'Price surge');
                        }, onActionClick: () => {
                            if (viewState.view.type === SwapWidgetViews.PRICE_SURGE) {
                                viewDispatch({
                                    payload: {
                                        type: ViewActions.UPDATE_VIEW,
                                        view: {
                                            type: SwapWidgetViews.SWAP,
                                            data: viewState.view.data,
                                        },
                                    },
                                });
                            }
                        }, statusType: StatusType.WARNING, onCloseClick: () => sendSwapWidgetCloseEvent(eventTarget), testId: "price-surge-view" })), viewState.view.type === SharedViews.ERROR_VIEW && (jsx(ErrorView, { actionText: t('views.ERROR_VIEW.actionText'), onActionClick: async () => {
                            setErrorViewLoading(true);
                            const data = viewState.view;
                            if (!data.tryAgain) {
                                showSwapView();
                                setErrorViewLoading(false);
                                return;
                            }
                            if (await data.tryAgain())
                                showSwapView();
                            setErrorViewLoading(false);
                        }, onCloseClick: () => sendSwapWidgetCloseEvent(eventTarget), errorEventActionLoading: errorViewLoading })), viewState.view.type === SharedViews.TOP_UP_VIEW && (jsx(TopUpView, { analytics: { userJourney: UserJourney.SWAP }, checkout: checkout, provider: provider, widgetEvent: IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT, showOnrampOption: isOnRampEnabled, showSwapOption: isSwapEnabled, showBridgeOption: isBridgeEnabled, onCloseButtonClick: () => sendSwapWidgetCloseEvent(eventTarget) }))] }) }) }));
}

export { SwapWidget as default };
