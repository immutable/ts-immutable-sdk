import {
  useCallback,
  useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  Body, Box, Heading, OptionKey,
} from '@biom3/react';
import { BigNumber, utils } from 'ethers';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { TransactionResponse } from '@imtbl/dex-sdk';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
import { Environment } from '@imtbl/config';
import { amountInputValidation as textInputValidator } from '../../../lib/validations/amountInputValidations';
import { SwapContext } from '../context/SwapContext';
import { CryptoFiatActions, CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import {
  calculateCryptoToFiat, formatZeroAmount, isNativeToken, tokenValueFormat,
} from '../../../lib/utils';
import {
  DEFAULT_TOKEN_DECIMALS, DEFAULT_QUOTE_REFRESH_INTERVAL, NATIVE, DEFAULT_TOKEN_VALIDATION_DECIMALS,
} from '../../../lib';
import { quotesProcessor } from '../functions/FetchQuote';
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

enum SwapDirection {
  FROM = 'FROM',
  TO = 'TO',
}

const swapValuesToText = ({
  swapFromToken,
  swapToToken,
  swapFromAmount,
  swapToAmount,
  conversion,
}: {
  swapFromToken?: TokenInfo;
  swapFromAmount: string;
  swapToToken?: TokenInfo;
  swapToAmount: string;
  conversion: BigNumber;
}): {
  fromToConversion: string,
  swapToAmount: string,
} => {
  const resp = {
    fromToConversion: '',
    swapToAmount: '',
  };

  if (!swapToAmount) return resp;
  resp.swapToAmount = tokenValueFormat(swapToAmount);

  if (swapFromAmount && swapFromToken && swapToToken) {
    const formattedConversion = formatZeroAmount(tokenValueFormat(
      utils.formatUnits(conversion, swapToToken.decimals),
    ), true);

    resp.fromToConversion = `1 ${swapFromToken.symbol} ≈ ${formattedConversion} ${swapToToken.symbol}`;
  }

  return resp;
};

// Ensures that the to token address does not match the from token address
const shouldSetToAddress = (toAddress: string | undefined, fromAddress: string | undefined): boolean => {
  if (toAddress === undefined) return false;
  if (toAddress === '') return false;
  if (fromAddress === toAddress) return false;
  return true;
};

export interface SwapFromProps {
  data?: SwapFormData;
}

export function SwapForm({ data }: SwapFromProps) {
  const { t } = useTranslation();
  const {
    swapState: {
      allowedTokens,
      exchange,
      tokenBalances,
      network,
    },
  } = useContext(SwapContext);
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

  const formatTokenOptionsId = useCallback((symbol: string, address?: string) => (isNativeToken(address)
    ? `${symbol.toLowerCase()}-${NATIVE}`
    : `${symbol.toLowerCase()}-${address!.toLowerCase()}`), []);

  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { viewDispatch } = useContext(ViewContext);

  const [editing, setEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [direction, setDirection] = useState<SwapDirection>(SwapDirection.FROM);
  const [loading, setLoading] = useState(false);
  const [conversion, setConversion] = useState(BigNumber.from(0));
  const [swapFromToConversionText, setSwapFromToConversionText] = useState('');
  const hasSetDefaultState = useRef(false);

  const { track } = useAnalytics();

  // Form State
  const [fromAmount, setFromAmount] = useState<string>(data?.fromAmount || '');
  const [fromAmountError, setFromAmountError] = useState<string>('');
  const [fromToken, setFromToken] = useState<TokenInfo | undefined>();
  const [fromBalance, setFromBalance] = useState<string>('');
  const [fromTokenError, setFromTokenError] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>(data?.toAmount || '');
  const [toAmountError, setToAmountError] = useState<string>('');
  const [toToken, setToToken] = useState<TokenInfo | undefined>();
  const [toTokenError, setToTokenError] = useState<string>('');
  const [fromFiatValue, setFromFiatValue] = useState('');

  // Quote
  const [quote, setQuote] = useState<TransactionResponse | null>(null);
  const [gasFeeValue, setGasFeeValue] = useState<string>('');
  const [gasFeeToken, setGasFeeToken] = useState<TokenInfo | undefined>(undefined);
  const [gasFeeFiatValue, setGasFeeFiatValue] = useState<string>('');
  const [tokensOptionsFrom, setTokensOptionsForm] = useState<CoinSelectorOptionProps[]>([]);

  // Drawers
  const [showNotEnoughImxDrawer, setShowNotEnoughImxDrawer] = useState(false);
  const [showUnableToSwapDrawer, setShowUnableToSwapDrawer] = useState(false);

  useEffect(() => {
    if (tokenBalances.length === 0) return;
    if (!network) return;
    const fromOptions = tokenBalances
      .filter((b) => b.balance.gt(0))
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
    if (!hasSetDefaultState.current) {
      hasSetDefaultState.current = true;

      if (data?.fromTokenAddress) {
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

      if (shouldSetToAddress(data?.toTokenAddress, data?.fromTokenAddress)) {
        setToToken(allowedTokens.find((token) => (
          isNativeToken(token.address) && data?.toTokenAddress?.toLowerCase() === NATIVE
        ) || (token.address?.toLowerCase() === data?.toTokenAddress?.toLowerCase())));
      }
    }
  }, [
    tokenBalances,
    allowedTokens,
    cryptoFiatState.conversions,
    data?.fromTokenAddress,
    data?.toTokenAddress,
    hasSetDefaultState.current,
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
        icon: undefined, // todo: add correct image once available on token info
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
  const processFetchQuoteFrom = async (silently: boolean = false) => {
    if (!provider) return;
    if (!exchange) return;
    if (!fromToken) return;
    if (!toToken) return;

    try {
      if (!silently) setSwapFromToConversionText('');

      const quoteResultPromise = quotesProcessor.fromAmountIn(
        exchange,
        provider,
        fromToken,
        fromAmount,
        toToken,
      );
      const conversionResultPromise = quotesProcessor.fromAmountIn(
        exchange,
        provider,
        fromToken,
        '1',
        toToken,
      );

      const resolved = await Promise.all([quoteResultPromise, conversionResultPromise]);
      const quoteResult = resolved[0];
      const conversionResult = resolved[1];
      setConversion(conversionResult.quote.amount.value);

      // Prevent to silently fetch and set a new quote
      // if the user has updated and the widget is already
      // fetching or the user is updating the inputs.
      if (silently && (loading || editing)) return;

      const estimate = quoteResult.swap.gasFeeEstimate;
      let gasFeeTotal = BigNumber.from(estimate?.value || 0);
      if (quoteResult.approval?.gasFeeEstimate) {
        gasFeeTotal = gasFeeTotal.add(quoteResult.approval.gasFeeEstimate.value);
      }
      const gasFee = utils.formatUnits(
        gasFeeTotal,
        DEFAULT_TOKEN_DECIMALS,
      );
      const estimateToken = estimate?.token;

      const gasToken = allowedTokens.find(
        (token) => token.address?.toLocaleLowerCase() === estimateToken?.address?.toLocaleLowerCase(),
      );

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
            utils.formatUnits(
              quoteResult.quote.amount.value,
              quoteResult.quote.amount.token.decimals,
            ),
            quoteResult.quote.amount.token.decimals,
          ),
        ),
      );

      setFromAmountError('');
      setFromTokenError('');
      setToAmountError('');
      setToTokenError('');
    } catch (error: any) {
      setQuote(null);
      setShowNotEnoughImxDrawer(false);
      setShowUnableToSwapDrawer(true);
    }
    setIsFetching(false);
  };

  const processFetchQuoteTo = async (silently: boolean = false) => {
    if (!provider) return;
    if (!exchange) return;
    if (!fromToken) return;
    if (!toToken) return;

    try {
      if (!silently) setSwapFromToConversionText('');

      const quoteResultPromise = quotesProcessor.fromAmountOut(
        exchange,
        provider,
        toToken,
        toAmount,
        fromToken,
      );
      const conversionResultPromise = quotesProcessor.fromAmountIn(
        exchange,
        provider,
        fromToken,
        '1',
        toToken,
      );

      const resolved = await Promise.all([quoteResultPromise, conversionResultPromise]);
      const quoteResult = resolved[0];
      const conversionResult = resolved[1];
      setConversion(conversionResult.quote.amount.value);

      // Prevent to silently fetch and set a new quote
      // if the user has updated and the widget is already
      // fetching or the user is updating the inputs.
      if (silently && (loading || editing)) return;

      const estimate = quoteResult.swap.gasFeeEstimate;
      let gasFeeTotal = BigNumber.from(estimate?.value || 0);
      if (quoteResult.approval?.gasFeeEstimate) {
        gasFeeTotal = gasFeeTotal.add(quoteResult.approval.gasFeeEstimate.value);
      }
      const gasFee = utils.formatUnits(
        gasFeeTotal,
        DEFAULT_TOKEN_DECIMALS,
      );
      const estimateToken = estimate?.token;

      const gasToken = allowedTokens.find((token) => token.symbol === estimateToken?.symbol);
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
          tokenValueFormat(utils.formatUnits(
            quoteResult.quote.amount.value,
            quoteResult.quote.amount.token.decimals,
          )),
        ),
      );

      setFromAmountError('');
      setFromTokenError('');
      setToAmountError('');
      setToTokenError('');
    } catch (error: any) {
      setQuote(null);
      setShowNotEnoughImxDrawer(false);
      setShowUnableToSwapDrawer(true);
    }

    setIsFetching(false);
  };

  const canRunFromQuote = (): boolean => {
    if (Number.isNaN(parseFloat(fromAmount))) return false;
    if (parseFloat(fromAmount) <= 0) return false;
    if (!fromToken) return false;
    if (!toToken) return false;
    if (isFetching) return false;
    return true;
  };

  const fetchQuoteFrom = async (silently: boolean = false) => {
    if (!canRunFromQuote()) return;

    // setIsFetching within this if statement
    // to allow the user to edit the form
    // even if a new quote is fetch silently
    if (!silently) {
      setLoading(true);
      setIsFetching(true);
    }

    await processFetchQuoteFrom(silently);

    if (!silently) {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const canRunToQuote = (): boolean => {
    if (Number.isNaN(parseFloat(toAmount))) return false;
    if (parseFloat(toAmount) <= 0) return false;
    if (!fromToken) return false;
    if (!toToken) return false;
    if (isFetching) return false;
    return true;
  };

  const fetchQuoteTo = async (silently: boolean = false) => {
    if (!canRunToQuote()) return;

    // setIsFetching within this if statement
    // to allow the user to edit the form
    // even if a new quote is fetch silently
    if (!silently) {
      setLoading(true);
      setIsFetching(true);
    }

    await processFetchQuoteTo(silently);

    if (!silently) {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const fetchQuote = async (silently: boolean = false) => {
    if (direction === SwapDirection.FROM) await fetchQuoteFrom(silently);
    else await fetchQuoteTo(silently);
  };

  // Silently refresh the quote
  useInterval(() => fetchQuote(true), DEFAULT_QUOTE_REFRESH_INTERVAL);

  useEffect(() => {
    if (direction === SwapDirection.FROM) {
      if (editing) return;
      (async () => await fetchQuote())();
    }
  }, [fromAmount, fromToken, toToken, editing]);

  useEffect(() => {
    if (direction === SwapDirection.TO) {
      if (editing) return;
      (async () => await fetchQuote())();
    }
  }, [toAmount, toToken, fromToken, editing]);

  // during swaps, having enough IMX to cover the gas fee means
  // 1. swapping from any token to any token costs IMX - so do a check
  // 2. If the swap from token is also IMX, include the additional amount into the calc
  //    as user will need enough imx for the swap amount and the gas
  const insufficientFundsForGas = useMemo(() => {
    const imxBalance = tokenBalances.find((b) => b.token.address?.toLowerCase() === NATIVE);
    if (!imxBalance) return true;

    const fromTokenIsImx = fromToken?.address?.toLowerCase() === NATIVE;
    const gasAmount = utils.parseEther(gasFeeValue.length !== 0 ? gasFeeValue : '0');
    const additionalAmount = fromTokenIsImx && !Number.isNaN(parseFloat(fromAmount))
      ? utils.parseUnits(fromAmount, fromToken?.decimals || 18)
      : BigNumber.from('0');

    return gasAmount.add(additionalAmount).gt(imxBalance.balance);
  }, [gasFeeValue, tokenBalances, fromToken, fromAmount]);

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
  }, [fromAmount, fromToken]);

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
    setEditing(true);
    setDirection(SwapDirection.FROM);
  };

  const onFromTextInputChange = (value) => {
    setFromAmount(value);
    setFromAmountError('');
  };

  const onFromTextInputBlur = (value) => {
    setEditing(false);
    setFromAmount(value);
  };

  const textInputMaxButtonClick = () => {
    if (!fromBalance) return;
    const fromBalanceTruncated = fromBalance.slice(0, fromBalance.indexOf('.') + DEFAULT_TOKEN_VALIDATION_DECIMALS + 1);
    setFromAmount(fromBalanceTruncated);
    setDirection(SwapDirection.FROM);
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
    setEditing(true);
    setDirection(SwapDirection.TO);
  };

  const onToTextInputChange = (value) => {
    setToAmount(value);
    setToAmountError('');
  };

  const onToTextInputBlur = (value) => {
    setEditing(false);
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

    if (validateFromTokenError) setFromTokenError(validateFromTokenError);
    if (validateFromAmountError) setFromAmountError(validateFromAmountError);
    if (validateToTokenError) setToTokenError(validateToTokenError);
    if (validateToAmountError) setToAmountError(validateToAmountError);

    let isSwapFormValid = true;
    if (
      validateFromTokenError
      || validateFromAmountError
      || validateToTokenError
      || validateToAmountError) isSwapFormValid = false;

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
      },
    });

    return isSwapFormValid;
  };

  useEffect(() => {
    if (!quote || !conversion) return;
    setSwapFromToConversionText(swapValuesToText({
      swapFromToken: fromToken,
      swapFromAmount: fromAmount,
      swapToToken: toToken,
      swapToAmount: toAmount,
      conversion,
    }).fromToConversion);
  }, [quote, conversion]);

  return (
    <>
      <Box sx={{
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
              onTextInputBlur={(v) => onFromTextInputBlur(v)}
              onTextInputFocus={onFromTextInputFocus}
              textInputMaxButtonClick={textInputMaxButtonClick}
              onSelectChange={onFromSelectChange}
              textInputErrorMessage={t(fromAmountError)}
              selectErrorMessage={t(fromTokenError)}
              selectInputDisabled={isFetching}
              textInputDisabled={isFetching}
              selectedOption={fromToken
                ? formatTokenOptionsId(fromToken.symbol, fromToken.address)
                : undefined}
              coinSelectorHeading={t('views.SWAP.swapForm.from.selectorTitle')}
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
              <Body
                sx={{
                  color: 'base.color.brand.4',
                }}
                size="small"
              >
                {swapFromToConversionText}
              </Body>
            </Box>
            <SelectInput
              testId="toTokenInputs"
              options={tokensOptionsTo}
              selectTextAlign="left"
              textInputValue={toAmount}
              textInputPlaceholder={t('views.SWAP.swapForm.to.inputPlaceholder')}
              textInputTextAlign="right"
              textInputValidator={textInputValidator}
              onTextInputChange={(v) => onToTextInputChange(v)}
              onTextInputBlur={(v) => onToTextInputBlur(v)}
              onTextInputFocus={onToTextInputFocus}
              onSelectChange={onToSelectChange}
              textInputErrorMessage={t(toAmountError)}
              selectErrorMessage={t(toTokenError)}
              selectInputDisabled={isFetching}
              textInputDisabled={isFetching}
              selectedOption={toToken
                ? formatTokenOptionsId(toToken.symbol, toToken.address)
                : undefined}
              coinSelectorHeading={t('views.SWAP.swapForm.to.selectorTitle')}
            />
          </Box>
        </Box>
        <Fees
          gasFeeFiatValue={gasFeeFiatValue}
          gasFeeToken={gasFeeToken}
          gasFeeValue={gasFeeValue}
          fees={[
            {
              label: t('drawers.feesBreakdown.fees.gasFeeSwap.label'),
              fiatAmount: `~ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${gasFeeFiatValue}`,
              amount: tokenValueFormat(gasFeeValue),
            },
          ]}
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
        />
      </Box>
      <SwapButton
        validator={SwapFormValidator}
        updateLoading={(value: boolean) => {
          setLoading(value);
        }}
        loading={loading}
        transaction={quote}
        data={{
          fromAmount,
          toAmount,
          fromTokenSymbol: fromToken?.symbol,
          fromTokenAddress: fromToken?.address,
          toTokenSymbol: toToken?.symbol,
          toTokenAddress: toToken?.address,
        }}
        insufficientFundsForGas={insufficientFundsForGas}
        openNotEnoughImxDrawer={openNotEnoughImxDrawer}
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
    </>
  );
}
