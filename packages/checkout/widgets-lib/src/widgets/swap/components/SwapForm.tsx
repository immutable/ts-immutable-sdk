import {
  useCallback,
  useContext, useEffect, useMemo, useState,
} from 'react';
import {
  Box, Heading, Icon, OptionKey, Tooltip,
} from '@biom3/react';
import { isAddressSanctioned, TokenInfo, WidgetTheme } from '@imtbl/checkout-sdk';

import { TransactionResponse } from '@imtbl/dex-sdk';
import { useTranslation } from 'react-i18next';
import { Environment } from '@imtbl/config';
import { formatUnits, parseEther, parseUnits } from 'ethers';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { NetworkSwitchDrawer } from '../../../components/NetworkSwitchDrawer/NetworkSwitchDrawer';
import { amountInputValidation as textInputValidator } from '../../../lib/validations/amountInputValidations';
import { SwapContext } from '../context/SwapContext';
import { CryptoFiatActions, CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import {
  calculateCryptoToFiat, formatZeroAmount, getDefaultTokenImage, isNativeToken, tokenValueFormat,
} from '../../../lib/utils';
import {
  DEFAULT_TOKEN_DECIMALS,
  DEFAULT_QUOTE_REFRESH_INTERVAL,
  NATIVE,
  DEFAULT_TOKEN_VALIDATION_DECIMALS,
  ESTIMATE_DEBOUNCE,
  getL2ChainId,
} from '../../../lib';
import { SelectInput } from '../../../components/FormComponents/SelectInput/SelectInput';
import {
  validateFromAmount,
  validateFromToken,
  validateToAmount,
  validateToToken,
} from '../functions/SwapValidator';
import { Fees } from '../../../components/Fees/Fees';
import { SwapButton } from './SwapButton';
import { SwapFormData } from './swapFormTypes';
import { CoinSelectorOptionProps } from '../../../components/CoinSelector/CoinSelectorOption';
import { useInterval } from '../../../lib/hooks/useInterval';
import { NotEnoughImx } from '../../../components/NotEnoughImx/NotEnoughImx';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { UnableToSwap } from './UnableToSwap';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import useDebounce from '../../../lib/hooks/useDebounce';
import { CancellablePromise } from '../../../lib/async/cancellablePromise';
import { isPassportProvider } from '../../../lib/provider';
import { formatSwapFees } from '../functions/swapFees';
import { processGasFree } from '../functions/processGasFree';
import { processSecondaryFees } from '../functions/processSecondaryFees';
import { processQuoteToken } from '../functions/processQuoteToken';
import { formatQuoteConversionRate } from '../functions/swapConversionRate';
import { PrefilledSwapForm, SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { TransactionRejected } from '../../../components/TransactionRejected/TransactionRejected';

enum SwapDirection {
  FROM = 'FROM',
  TO = 'TO',
}

// Ensures that the to token address does not match the from token address
const shouldSetToAddress = (toAddress: string | undefined, fromAddress: string | undefined): boolean => {
  if (toAddress === undefined) return false;
  if (toAddress === '') return false;
  if (fromAddress === toAddress) return false;
  return true;
};

let quoteRequest: CancellablePromise<any>;

export interface SwapFromProps {
  data?: SwapFormData;
  theme: WidgetTheme;
  cancelAutoProceed: () => void;
}

export function SwapForm({ data, theme, cancelAutoProceed }: SwapFromProps) {
  const { t } = useTranslation();
  const {
    swapState: {
      allowedTokens,
      tokenBalances,
      network,
      autoProceed,
      riskAssessment,
    },
  } = useContext(SwapContext);

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const defaultTokenImage = getDefaultTokenImage(checkout?.config.environment, theme);

  const formatTokenOptionsId = useCallback((symbol: string, address?: string) => (isNativeToken(address)
    ? NATIVE
    : `${symbol.toLowerCase()}-${address!.toLowerCase()}`), []);

  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { viewDispatch } = useContext(ViewContext);

  const [direction, setDirection] = useState<SwapDirection>(SwapDirection.FROM);
  const [loading, setLoading] = useState(false);
  const { track } = useAnalytics();

  // Form State
  const [fromAmount, setFromAmount] = useState<string>(data?.fromAmount || '');
  const [fromAmountError, setFromAmountError] = useState<string>('');
  const debouncedFromAmount = useDebounce(fromAmount, ESTIMATE_DEBOUNCE);
  const [fromToken, setFromToken] = useState<TokenInfo | undefined>();
  const [fromBalance, setFromBalance] = useState<string>('');
  const [fromTokenError, setFromTokenError] = useState<string>('');
  const [fromMaxTrigger, setFromMaxTrigger] = useState<number>(0);
  const [toAmount, setToAmount] = useState<string>(data?.toAmount || '');
  const [toAmountError, setToAmountError] = useState<string>('');
  const debouncedToAmount = useDebounce(toAmount, ESTIMATE_DEBOUNCE);
  const [toToken, setToToken] = useState<TokenInfo | undefined>();
  const [toTokenError, setToTokenError] = useState<string>('');
  const [fromFiatValue, setFromFiatValue] = useState('');
  const [loadedToAndFromTokens, setLoadedToAndFromTokens] = useState(false);

  // Quote
  const [quote, setQuote] = useState<TransactionResponse | null>(null);
  const [gasFeeValue, setGasFeeValue] = useState<string>('');
  const [gasFeeToken, setGasFeeToken] = useState<TokenInfo | undefined>(undefined);
  const [gasFeeFiatValue, setGasFeeFiatValue] = useState<string>('');
  const [tokensOptionsFrom, setTokensOptionsForm] = useState<CoinSelectorOptionProps[]>([]);
  const formattedFees = useMemo(
    () => (quote ? formatSwapFees(quote, cryptoFiatState, t) : []),
    [quote, cryptoFiatState, t],
  );
  const [conversionToken, setConversionToken] = useState<TokenInfo | null>(null);
  const [conversionAmount, setConversionAmount] = useState<string>('');
  const swapConversionRateTooltip = useMemo(
    () => {
      if (!quote || !conversionAmount || !conversionToken) return '';
      return formatQuoteConversionRate(
        conversionAmount,
        conversionToken as TokenInfo,
        quote,
        'views.SWAP.swapForm.conversionRate',
        t,
      );
    },
    [conversionAmount, conversionToken, quote, t],
  );

  // Drawers
  const [showNotEnoughImxDrawer, setShowNotEnoughImxDrawer] = useState(false);
  const [showUnableToSwapDrawer, setShowUnableToSwapDrawer] = useState(false);
  const [showNetworkSwitchDrawer, setShowNetworkSwitchDrawer] = useState(false);

  const [showTxnRejectedState, setShowTxnRejectedState] = useState(false);

  useEffect(() => {
    if (tokenBalances.length === 0) return;
    if (!network) return;
    const fromOptions = tokenBalances
      .filter((b) => b.balance > 0)
      .map(
        (tokenBalance) => ({
          id: formatTokenOptionsId(tokenBalance.token.symbol, tokenBalance.token.address),
          name: tokenBalance.token.name,
          symbol: tokenBalance.token.symbol,
          icon: tokenBalance.token.icon,
          balance: {
            formattedAmount: tokenValueFormat(tokenBalance.formattedBalance),
            formattedFiatAmount: cryptoFiatState.conversions.size === 0 ? formatZeroAmount('') : calculateCryptoToFiat(
              tokenBalance.formattedBalance,
              tokenBalance.token.symbol || '',
              cryptoFiatState.conversions,
            ),
          },
        } as CoinSelectorOptionProps),
      );

    setTokensOptionsForm(fromOptions);

    // Set initial token options if provided
    if (data?.fromTokenAddress && !fromToken) {
      setFromToken(
        allowedTokens.find((token) => (isNativeToken(token.address)
            && data?.fromTokenAddress?.toLowerCase() === NATIVE)
            || token.address?.toLowerCase()
           === data?.fromTokenAddress?.toLowerCase()),
      );
      setFromBalance(
        tokenBalances.find(
          (tokenBalance) => (
            isNativeToken(tokenBalance.token.address)
              && data?.fromTokenAddress?.toLowerCase() === NATIVE)
              || (tokenBalance.token.address?.toLowerCase() === data?.fromTokenAddress?.toLowerCase()),
        )?.formattedBalance ?? '',
      );
    }

    if (shouldSetToAddress(data?.toTokenAddress, data?.fromTokenAddress) && !toToken) {
      setToToken(allowedTokens.find((token) => (
        isNativeToken(token.address) && data?.toTokenAddress?.toLowerCase() === NATIVE
      ) || (token.address?.toLowerCase() === data?.toTokenAddress?.toLowerCase())));
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

  const tokensOptionsTo = useMemo(() => allowedTokens
    .map(
      (token) => ({
        id: formatTokenOptionsId(token.symbol, token.address),
        name: token.name,
        symbol: token.symbol,
        icon: token.icon,
      } as CoinSelectorOptionProps),
    ), [allowedTokens, fromToken]);

  useEffect(() => {
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

  const processFetchQuoteFrom = async (silently: boolean = false) => {
    if (!provider) return;
    if (!checkout) return;
    if (!fromToken) return;
    if (!toToken) return;

    try {
      const quoteResultPromise = checkout.swapQuote({
        provider,
        fromToken,
        toToken,
        fromAmount,
      });

      const currentQuoteRequest = CancellablePromise.all<TransactionResponse>([
        quoteResultPromise,
      ]);
      quoteRequest = currentQuoteRequest;

      const resolved = await currentQuoteRequest;

      let quoteResult = processGasFree(provider, resolved[0]);
      quoteResult = processSecondaryFees(fromToken, quoteResult);
      quoteResult = processQuoteToken(toToken, quoteResult);

      const estimate = quoteResult.swap.gasFeeEstimate;
      let gasFeeTotal = BigInt(estimate?.value || 0);
      if (quoteResult.approval?.gasFeeEstimate) {
        gasFeeTotal += quoteResult.approval.gasFeeEstimate.value;
      }
      const gasFee = formatUnits(
        gasFeeTotal,
        DEFAULT_TOKEN_DECIMALS,
      );
      const estimateToken = estimate?.token;
      const gasToken = allowedTokens.find(
        (token) => token.address?.toLocaleLowerCase() === estimateToken?.address?.toLocaleLowerCase(),
      );

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
      setGasFeeFiatValue(calculateCryptoToFiat(
        gasFee,
        gasToken?.symbol || '',
        cryptoFiatState.conversions,
      ));

      setToAmount(
        formatZeroAmount(
          tokenValueFormat(
            formatUnits(
              quoteResult.quote.amount.value,
              quoteResult.quote.amount.token.decimals,
            ),
            quoteResult.quote.amount.token.decimals,
          ),
        ),
      );

      resetFormErrors();
    } catch (error: any) {
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

  const processFetchQuoteTo = async (silently: boolean = false) => {
    if (!provider) return;
    if (!checkout) return;
    if (!fromToken) return;
    if (!toToken) return;

    try {
      const quoteResultPromise = checkout.swapQuote({
        provider,
        fromToken,
        toToken,
        fromAmount: undefined,
        toAmount,
      });

      const currentQuoteRequest = CancellablePromise.all<TransactionResponse>([
        quoteResultPromise,
      ]);
      quoteRequest = currentQuoteRequest;
      const resolved = await currentQuoteRequest;

      let quoteResult = processGasFree(provider, resolved[0]);
      quoteResult = processSecondaryFees(fromToken, quoteResult);

      const estimate = quoteResult.swap.gasFeeEstimate;
      let gasFeeTotal = BigInt(estimate?.value || 0);
      if (quoteResult.approval?.gasFeeEstimate) {
        gasFeeTotal += quoteResult.approval.gasFeeEstimate.value;
      }
      const gasFee = formatUnits(
        gasFeeTotal,
        DEFAULT_TOKEN_DECIMALS,
      );
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

      setGasFeeFiatValue(calculateCryptoToFiat(
        gasFee,
        gasToken?.symbol || '',
        cryptoFiatState.conversions,
      ));

      setFromAmount(
        formatZeroAmount(
          tokenValueFormat(formatUnits(
            quoteResult.quote.amount.value,
            quoteResult.quote.amount.token.decimals,
          )),
        ),
      );

      resetFormErrors();
    } catch (error: any) {
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

  const canRunFromQuote = (amount: string, silently: boolean): boolean => {
    if (Number.isNaN(parseFloat(amount))) return false;
    if (parseFloat(amount) <= 0) return false;
    if (!fromToken) return false;
    if (!toToken) return false;
    if (silently && loading) return false;
    return true;
  };

  const fetchQuoteFrom = async (silently: boolean = false) => {
    if (!canRunFromQuote(fromAmount, silently)) return;

    // Cancel any existing quote
    if (quoteRequest) {
      quoteRequest.cancel();
    }

    if (!silently) {
      setLoading(true);
    }

    await processFetchQuoteFrom(silently);
  };

  const canRunToQuote = (amount:string, silently): boolean => {
    if (Number.isNaN(parseFloat(amount))) return false;
    if (parseFloat(amount) <= 0) return false;
    if (!fromToken) return false;
    if (!toToken) return false;
    if (silently && loading) return false;
    return true;
  };

  const fetchQuoteTo = async (silently: boolean = false) => {
    if (!canRunToQuote(toAmount, silently)) return;

    // Cancel any existing quote
    if (quoteRequest) {
      quoteRequest.cancel();
    }

    if (!silently) {
      setLoading(true);
    }

    await processFetchQuoteTo(silently);
  };

  const fetchQuote = async (silently: boolean = false) => {
    if (direction === SwapDirection.FROM) await fetchQuoteFrom(silently);
    else await fetchQuoteTo(silently);
  };

  // Silently refresh the quote
  useInterval(() => {
    fetchQuote(true);
  }, DEFAULT_QUOTE_REFRESH_INTERVAL);

  // Fetch quote triggers
  useEffect(() => {
    if (direction === SwapDirection.FROM) {
      if (debouncedFromAmount <= 0) {
        setLoading(false);
        resetQuote();
        return;
      }
      (async () => await fetchQuote())();
    }
  }, [debouncedFromAmount, fromToken, toToken, fromMaxTrigger]);

  useEffect(() => {
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
  const insufficientFundsForGas = useMemo(() => {
    if (!provider) return true;
    if (isPassportProvider(provider)) return false;

    const imxBalance = tokenBalances.find((b) => b.token.address?.toLowerCase() === NATIVE);
    if (!imxBalance) return true;

    const fromTokenIsImx = fromToken?.address?.toLowerCase() === NATIVE;
    const gasAmount = parseEther(gasFeeValue.length !== 0 ? gasFeeValue : '0');
    const additionalAmount = fromTokenIsImx && !Number.isNaN(parseFloat(fromAmount))
      ? parseUnits(fromAmount, fromToken?.decimals || 18)
      : BigInt('0');

    return (gasAmount + additionalAmount) > imxBalance.balance;
  }, [gasFeeValue, tokenBalances, fromToken, fromAmount, provider]);

  // -------------//
  //     FROM     //
  // -------------//
  useEffect(() => {
    if (!fromAmount) return;
    if (!fromToken) return;

    setFromFiatValue(calculateCryptoToFiat(
      fromAmount,
      fromToken.symbol,
      cryptoFiatState.conversions,
    ));
  }, [fromAmount, fromToken, cryptoFiatState.conversions]);

  const onFromSelectChange = useCallback((value: OptionKey) => {
    const selected = tokenBalances
      .find((tokenBalance) => value === formatTokenOptionsId(tokenBalance.token.symbol, tokenBalance.token.address));
    if (!selected) return;

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
    if (!fromBalance) return;
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
    } else {
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
  const onToSelectChange = useCallback((value: OptionKey) => {
    const selected = allowedTokens.find((token) => value === formatTokenOptionsId(token.symbol, token.address));
    if (!selected) return;

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

  const SwapFormValidator = (): boolean => {
    const validateFromTokenError = validateFromToken(fromToken);
    const validateFromAmountError = validateFromAmount(fromAmount, fromBalance);
    const validateToTokenError = validateToToken(toToken);
    const validateToAmountError = validateToAmount(toAmount);

    if (direction === SwapDirection.FROM) {
      setToAmountError('');
      if (validateFromAmountError) {
        setFromAmountError(validateFromAmountError);
      }
    } else if (direction === SwapDirection.TO) {
      setFromAmountError('');
      if (validateToAmountError) {
        setToAmountError(validateToAmountError);
      }
    }
    if (validateFromTokenError) setFromTokenError(validateFromTokenError);
    if (validateToTokenError) setToTokenError(validateToTokenError);
    let isSwapFormValid = true;
    if (
      validateFromTokenError
      || validateToTokenError
      || (validateFromAmountError && direction === SwapDirection.FROM)
      || (validateToAmountError && direction === SwapDirection.TO)) isSwapFormValid = false;

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

  const isFormValidForAutoProceed = useMemo(() => {
    if (!autoProceed) return false;
    if (loadedToAndFromTokens === false) return false;

    return !loading;
  }, [autoProceed, loading, loadedToAndFromTokens]);

  const canAutoSwap = useMemo(() => {
    if (!autoProceed) return false;
    if (!isFormValidForAutoProceed) return false;

    const isFormValid = SwapFormValidator();

    if (!isFormValid) {
      cancelAutoProceed();
      return false;
    }

    return true;
  }, [isFormValidForAutoProceed]);

  const sendTransaction = async () => {
    if (!quote) return;
    if (riskAssessment && isAddressSanctioned(riskAssessment)) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SwapWidgetViews.SERVICE_UNAVAILABLE,
          },
        },
      });

      return;
    }
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
    if (!isValid) return;
    if (!checkout || !provider || !transaction) return;
    if (insufficientFundsForGas) {
      cancelAutoProceed();
      openNotEnoughImxDrawer();
      return;
    }

    try {
    // check for switch network here
      const currentChainId = await (provider.provider as any).request({ method: 'eth_chainId', params: [] });
      // eslint-disable-next-line radix
      const parsedChainId = parseInt(currentChainId.toString());
      if (parsedChainId !== getL2ChainId(checkout.config)) {
        setShowNetworkSwitchDrawer(true);
        return;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Current network check failed', err);
    }

    if (!transaction) return;

    setLoading(true);
    const prefilledSwapData:PrefilledSwapForm = {
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

  const shouldSendTransaction = useMemo(() => {
    if (canAutoSwap === true && autoProceed === true) {
      return true;
    }
    return undefined;
  }, [canAutoSwap, autoProceed]);

  useEffect(() => {
    if (shouldSendTransaction === undefined) return;
    sendTransaction();
  }, [shouldSendTransaction]);

  return (
    <>
      <Box sx={{
        visibility: autoProceed ? 'hidden' : 'visible',
        paddingX: 'base.spacing.x4',
        marginBottom: 'base.spacing.x2',
      }}
      >
        <Heading
          size="small"
          weight="regular"
          sx={{ paddingBottom: 'base.spacing.x4' }}
        >
          {t('views.SWAP.content.title')}
        </Heading>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: 'base.spacing.x6',
            paddingBottom: 'base.spacing.x2',
          }}
        >

          {/* FROM */}
          <Box>
            <Heading
              size="xSmall"
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: 'base.spacing.x1',
              }}
            >
              {t('views.SWAP.swapForm.from.label')}
            </Heading>
            <SelectInput
              testId="fromTokenInputs"
              options={tokensOptionsFrom}
              selectSubtext={
                fromToken
                  ? `${t('views.SWAP.content.availableBalancePrefix')} ${tokenValueFormat(
                    fromBalance,
                  )}`
                  : ''
              }
              selectTextAlign="left"
              textInputType="number"
              testInputMode="decimal"
              textInputValue={fromAmount}
              textInputPlaceholder={t('views.SWAP.swapForm.from.inputPlaceholder')}
              textInputSubtext={`${t('views.SWAP.content.fiatPricePrefix')} 
              $${formatZeroAmount(
                fromFiatValue,
                true,
              )}`}
              textInputTextAlign="right"
              textInputValidator={textInputValidator}
              onTextInputChange={(v) => onFromTextInputChange(v)}
              onTextInputFocus={onFromTextInputFocus}
              textInputMaxButtonClick={textInputMaxButtonClick}
              onSelectChange={onFromSelectChange}
              textInputErrorMessage={t(fromAmountError)}
              selectErrorMessage={t(fromTokenError)}
              selectedOption={fromToken
                ? formatTokenOptionsId(fromToken.symbol, fromToken.address)
                : undefined}
              coinSelectorHeading={t('views.SWAP.swapForm.from.selectorTitle')}
              defaultTokenImage={defaultTokenImage}
              environment={checkout?.config.environment}
              theme={theme}
            />
          </Box>

          {/* TO */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: 'base.spacing.x1',
              }}
            >
              <Heading size="xSmall">{t('views.SWAP.swapForm.to.label')}</Heading>
              {swapConversionRateTooltip?.length > 0 && (
                <Tooltip>
                  <Tooltip.Target>
                    <Icon
                      icon="InformationCircle"
                      sx={{
                        w: 'base.icon.size.300',
                      }}
                    />
                  </Tooltip.Target>
                  <Tooltip.Content>
                    {swapConversionRateTooltip}
                  </Tooltip.Content>
                </Tooltip>
              )}
            </Box>
            <SelectInput
              testId="toTokenInputs"
              options={tokensOptionsTo}
              selectTextAlign="left"
              textInputType="number"
              testInputMode="decimal"
              textInputValue={toAmount}
              textInputPlaceholder={t('views.SWAP.swapForm.to.inputPlaceholder')}
              textInputTextAlign="right"
              textInputValidator={textInputValidator}
              onTextInputChange={(v) => onToTextInputChange(v)}
              onTextInputFocus={onToTextInputFocus}
              onSelectChange={onToSelectChange}
              textInputErrorMessage={t(toAmountError)}
              selectErrorMessage={t(toTokenError)}
              selectedOption={toToken
                ? formatTokenOptionsId(toToken.symbol, toToken.address)
                : undefined}
              coinSelectorHeading={t('views.SWAP.swapForm.to.selectorTitle')}
              defaultTokenImage={defaultTokenImage}
              environment={checkout?.config.environment}
              theme={theme}
            />
          </Box>
        </Box>
        {!isPassportProvider(provider) && (
        <Fees
          gasFeeFiatValue={gasFeeFiatValue}
          gasFeeToken={gasFeeToken}
          gasFeeValue={gasFeeValue}
          fees={formattedFees}
          onFeesClick={() => {
            track({
              userJourney: UserJourney.SWAP,
              screen: 'SwapCoins',
              control: 'ViewFees',
              controlType: 'Button',
            });
          }}
          sx={{
            paddingBottom: '0',
          }}
          loading={loading}
        />
        )}
      </Box>
      {!autoProceed && (
        <SwapButton
          validator={SwapFormValidator}
          loading={loading}
          sendTransaction={sendTransaction}
        />
      )}
      <TransactionRejected
        visible={showTxnRejectedState}
        showHeaderBar={false}
        onCloseDrawer={() => setShowTxnRejectedState(false)}
        onRetry={() => {
          sendTransaction();
          setShowTxnRejectedState(false);
        }}
      />
      <NotEnoughImx
        environment={checkout?.config.environment ?? Environment.PRODUCTION}
        visible={showNotEnoughImxDrawer}
        showAdjustAmount={fromToken?.address === NATIVE}
        hasZeroImx={false}
        onAddCoinsClick={() => {
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
        }}
        onCloseDrawer={() => setShowNotEnoughImxDrawer(false)}
      />
      <UnableToSwap
        visible={showUnableToSwapDrawer}
        onCloseDrawer={() => {
          setShowUnableToSwapDrawer(false);
          setFromToken(undefined);
          setFromAmount('');
          setToToken(undefined);
          setToAmount('');
        }}
      />
      <NetworkSwitchDrawer
        visible={showNetworkSwitchDrawer}
        targetChainId={getL2ChainId(checkout?.config!)}
        provider={provider!}
        checkout={checkout!}
        onCloseDrawer={() => setShowNetworkSwitchDrawer(false)}
      />
    </>
  );
}
