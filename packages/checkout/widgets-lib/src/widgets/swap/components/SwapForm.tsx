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
import { parseEther, parseUnits } from 'ethers/lib/utils';
import { text } from '../../../resources/text/textConfig';
import { amountInputValidation as textInputValidator } from '../../../lib/validations/amountInputValidations';
import { SwapContext } from '../context/SwapContext';
import { CryptoFiatActions, CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import {
  calculateCryptoToFiat, formatZeroAmount, isNativeToken, tokenValueFormat,
} from '../../../lib/utils';
import { DEFAULT_TOKEN_DECIMALS, DEFAULT_QUOTE_REFRESH_INTERVAL, NATIVE } from '../../../lib';
import { quotesProcessor } from '../functions/FetchQuote';
import { SelectInput } from '../../../components/FormComponents/SelectInput/SelectInput';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
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

enum SwapDirection {
  FROM = 'FROM',
  TO = 'TO',
}

const swapValuesToText = ({
  swapFromToken,
  swapToToken,
  swapFromAmount,
  swapToAmount,
}: {
  swapFromToken?: TokenInfo;
  swapFromAmount: string;
  swapToToken?: TokenInfo;
  swapToAmount: string;
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
    const conversionRatio = tokenValueFormat(Number(swapToAmount) / Number(swapFromAmount));
    resp.fromToConversion = `1 ${swapFromToken.symbol} ≈ ${
      formatZeroAmount(conversionRatio, true)
    } ${swapToToken.symbol}`;
  }

  return resp;
};

export interface SwapFromProps {
  data?: SwapFormData;
}

export function SwapForm({ data }: SwapFromProps) {
  const {
    swapState: {
      allowedTokens,
      provider,
      exchange,
      tokenBalances,
    },
  } = useContext(SwapContext);

  const formatTokenOptionsId = useCallback((symbol: string, address?: string) => {
    if (!address) return symbol.toLowerCase();
    return `${symbol.toLowerCase()}-${address.toLowerCase()}`;
  }, []);

  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { viewDispatch } = useContext(ViewContext);

  const [editing, setEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [direction, setDirection] = useState<SwapDirection>(SwapDirection.FROM);
  const [loading, setLoading] = useState(false);
  const [swapFromToConversionText, setSwapFromToConversionText] = useState('');
  const hasSetDefaultState = useRef(false);

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [quoteError, setQuoteError] = useState<string>('');
  const [gasFeeValue, setGasFeeValue] = useState<string>('');
  const [gasFeeToken, setGasFeeToken] = useState< TokenInfo | undefined>(undefined);
  const [gasFeeFiatValue, setGasFeeFiatValue] = useState<string>('');
  const [tokensOptionsFrom, setTokensOptionsForm] = useState<CoinSelectorOptionProps[]>([]);
  const [showNotEnoughImxDrawer, setShowNotEnoughImxDrawer] = useState(false);

  useEffect(() => {
    if (tokenBalances.length === 0) return;
    const fromOptions = tokenBalances
      .filter((b) => b.balance.gt(0))
      .map(
        (t) => ({
          id: formatTokenOptionsId(t.token.symbol, t.token.address),
          name: t.token.name,
          symbol: t.token.symbol,
          icon: t.token.icon,
          balance: {
            formattedAmount: tokenValueFormat(t.formattedBalance),
            formattedFiatAmount: cryptoFiatState.conversions.size === 0 ? formatZeroAmount('') : calculateCryptoToFiat(
              t.formattedBalance,
              t.token.symbol || '',
              cryptoFiatState.conversions,
            ),
          },
        } as CoinSelectorOptionProps),
      );

    setTokensOptionsForm(fromOptions);

    // Set initial token options if provided
    if (!hasSetDefaultState.current) {
      hasSetDefaultState.current = true;

      if (data?.fromContractAddress) {
        setFromToken(
          allowedTokens.find((t) => (
            isNativeToken(t.address) && data?.fromContractAddress?.toLocaleUpperCase() === NATIVE
          )
          || (t.address?.toLowerCase() === data?.fromContractAddress?.toLowerCase())),
        );
        setFromBalance(
          tokenBalances.find(
            (t) => (
              isNativeToken(t.token.address) && data?.fromContractAddress?.toLocaleUpperCase() === NATIVE)
              || (t.token.address?.toLowerCase() === data?.fromContractAddress?.toLowerCase()),
          )?.formattedBalance ?? '',
        );
      }

      if (data?.toContractAddress) {
        setToToken(allowedTokens.find((t) => (
          isNativeToken(t.address) && data?.toContractAddress?.toLocaleUpperCase() === NATIVE
        ) || (t.address?.toLowerCase() === data?.toContractAddress?.toLowerCase())));
      }
    }
  }, [
    tokenBalances,
    allowedTokens,
    cryptoFiatState.conversions,
    data?.fromContractAddress,
    data?.toContractAddress,
    hasSetDefaultState.current,
    setFromToken,
    setFromBalance,
    setToToken,
    setTokensOptionsForm,
    formatTokenOptionsId,
    formatZeroAmount,
  ]);

  const tokensOptionsTo = useMemo(() => allowedTokens
    .map(
      (t) => ({
        id: formatTokenOptionsId(t.symbol, t.address),
        name: t.name,
        symbol: t.symbol,
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
      const result = await quotesProcessor.fromAmountIn(
        exchange,
        provider,
        fromToken,
        fromAmount,
        toToken,
      );

      // Prevent to silently fetch and set a new quote
      // if the user has updated and the widget is already
      // fetching or the user is updating the inputs.
      if (silently && (loading || editing)) return;

      const estimate = result.swap.gasFeeEstimate;
      const gasFee = utils.formatUnits(
        estimate?.value || 0,
        DEFAULT_TOKEN_DECIMALS,
      );
      const estimateToken = estimate?.token;

      const gasToken = allowedTokens.find((token) => token.symbol === estimateToken?.symbol);
      setQuote(result);
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
          tokenValueFormat(utils.formatUnits(
            result.quote.amount.value,
            result.quote.amount.token.decimals,
          )),
        ),
      );

      setFromAmountError('');
      setFromTokenError('');
      setToAmountError('');
      setToTokenError('');
    } catch (error: any) {
      setQuote(null);
      // eslint-disable-next-line no-console
      console.log('Quote error: ', error.message);
      // todo: handle the display on form when exchange errors
      setQuoteError(error.message);
    }
    setIsFetching(false);
  };

  const processFetchQuoteTo = async (silently: boolean = false) => {
    if (!provider) return;
    if (!exchange) return;
    if (!fromToken) return;
    if (!toToken) return;

    try {
      const result = await quotesProcessor.fromAmountOut(
        exchange,
        provider,
        toToken,
        toAmount,
        fromToken,
      );

      // Prevent to silently fetch and set a new quote
      // if the user has updated and the widget is already
      // fetching or the user is updating the inputs.
      if (silently && (loading || editing)) return;

      const estimate = result.swap.gasFeeEstimate;
      const gasFee = utils.formatUnits(
        estimate?.value || 0,
        DEFAULT_TOKEN_DECIMALS,
      );
      const estimateToken = estimate?.token;

      const gasToken = allowedTokens.find((token) => token.symbol === estimateToken?.symbol);
      setQuote(result);
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
            result.quote.amount.value,
            result.quote.amount.token.decimals,
          )),
        ),
      );

      setFromAmountError('');
      setFromTokenError('');
      setToAmountError('');
      setToTokenError('');
    } catch (error: any) {
      setQuote(null);
      // eslint-disable-next-line no-console
      console.log('Quote error: ', error.message);
      // todo: handle the display on form when exchange errors
      setQuoteError(error.message);
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
    const imxBalance = tokenBalances
      .find((balance) => !balance.token.address || balance.token.address === 'NATIVE');
    if (!imxBalance) {
      return true;
    }

    // need to double check if the is going to be how to identify IMX on zkEVM
    const fromTokenIsImx = !fromToken?.address || fromToken.address === 'NATIVE';
    const gasAmount = parseEther(gasFeeValue.length !== 0 ? gasFeeValue : '0');
    const additionalAmount = fromTokenIsImx && !Number.isNaN(parseFloat(fromAmount))
      ? parseUnits(fromAmount, fromToken?.decimals || 18)
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
      .find((t) => value === formatTokenOptionsId(t.token.symbol, t.token.address));
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

    setFromAmount(fromBalance);
    setDirection(SwapDirection.FROM);
  };

  // ------------//
  //      TO     //
  // ------------//
  const onToSelectChange = useCallback((value: OptionKey) => {
    const selected = allowedTokens.find((t) => value === formatTokenOptionsId(t.symbol, t.address));
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

  const { content, swapForm, fees } = text.views[SwapWidgetViews.SWAP];
  const SwapFormValidator = (): boolean => {
    const validateFromTokenError = validateFromToken(fromToken);
    const validateFromAmountError = validateFromAmount(fromAmount, fromBalance);
    const validateToTokenError = validateToToken(toToken);
    const validateToAmountError = validateToAmount(toAmount);

    if (validateFromTokenError) setFromTokenError(validateFromTokenError);
    if (validateFromAmountError) setFromAmountError(validateFromAmountError);
    if (validateToTokenError) setToTokenError(validateToTokenError);
    if (validateToAmountError) setToAmountError(validateToAmountError);

    if (
      validateFromTokenError
      || validateFromAmountError
      || validateToTokenError
      || validateToAmountError) return false;
    return true;
  };

  useEffect(() => {
    setSwapFromToConversionText(swapValuesToText({
      swapFromToken: fromToken,
      swapFromAmount: fromAmount,
      swapToToken: toToken,
      swapToAmount: toAmount,
    }).fromToConversion);
  }, [quote]);

  return (
    <>
      <Box sx={{ paddingX: 'base.spacing.x4' }}>
        <Heading
          size="small"
          weight="regular"
          sx={{ paddingBottom: 'base.spacing.x4' }}
        >
          {content.title}
        </Heading>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: 'base.spacing.x6',
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
              {swapForm.from.label}
            </Heading>
            <SelectInput
              id="fromTokenInputs"
              options={tokensOptionsFrom}
              selectSubtext={
                fromToken
                  ? `${content.availableBalancePrefix} ${tokenValueFormat(
                    fromBalance,
                  )}`
                  : ''
              }
              selectTextAlign="left"
              textInputValue={fromAmount}
              textInputPlaceholder={swapForm.from.inputPlaceholder}
              textInputSubtext={`${content.fiatPricePrefix} 
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
              textInputErrorMessage={fromAmountError}
              selectErrorMessage={fromTokenError}
              selectInputDisabled={isFetching}
              textInputDisabled={isFetching}
              selectedOption={fromToken
                ? formatTokenOptionsId(fromToken.symbol, fromToken.address)
                : undefined}
              coinSelectorHeading={swapForm.from.selectorTitle}
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
              <Heading size="xSmall">{swapForm.to.label}</Heading>
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
              id="toTokenInputs"
              options={tokensOptionsTo}
              selectTextAlign="left"
              textInputValue={toAmount}
              textInputPlaceholder={swapForm.to.inputPlaceholder}
              textInputTextAlign="right"
              textInputValidator={textInputValidator}
              onTextInputChange={(v) => onToTextInputChange(v)}
              onTextInputBlur={(v) => onToTextInputBlur(v)}
              onTextInputFocus={onToTextInputFocus}
              onSelectChange={onToSelectChange}
              textInputErrorMessage={toAmountError}
              selectErrorMessage={toTokenError}
              selectInputDisabled={isFetching}
              textInputDisabled={isFetching}
              selectedOption={toToken
                ? formatTokenOptionsId(toToken.symbol, toToken.address)
                : undefined}
              coinSelectorHeading={swapForm.to.selectorTitle}
            />
          </Box>
        </Box>
        <Fees
          title={fees.title}
          fiatPricePrefix={content.fiatPricePrefix}
          gasFeeFiatValue={gasFeeFiatValue}
          gasFeeToken={gasFeeToken}
          gasFeeValue={gasFeeValue}
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
          fromContractAddress: fromToken?.address,
          toContractAddress: toToken?.address,
        }}
        insufficientFundsForGas={insufficientFundsForGas}
        setShowNotEnoughImxDrawer={setShowNotEnoughImxDrawer}
      />
      <NotEnoughImx
        visible={showNotEnoughImxDrawer}
        showAdjustAmount={!fromToken?.address || fromToken.address === 'NATIVE'}
        displayOnlyAddImxButton={false}
        onAddCoinsClick={() => {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: SharedViews.TOP_UP_VIEW,
              },
              currentViewData: {
                fromContractAddress: fromToken?.address ?? '',
                fromAmount,
                toContractAddress: toToken?.address ?? '',
              },
            },
          });
        }}
        onCloseBottomSheet={() => setShowNotEnoughImxDrawer(false)}
      />
    </>
  );
}
