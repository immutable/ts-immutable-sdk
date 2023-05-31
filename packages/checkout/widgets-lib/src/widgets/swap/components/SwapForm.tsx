import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import {
  Body, Box, Heading, OptionKey,
} from '@biom3/react';
import { utils } from 'ethers';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { TransactionResponse } from '@imtbl/dex-sdk';
import { text } from '../../../resources/text/textConfig';
import { amountInputValidation as textInputValidator } from '../../../lib/validations/amountInputValidations';
import { SwapContext } from '../context/SwapContext';
import { CryptoFiatActions, CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { calculateCryptoToFiat, formatZeroAmount, tokenValueFormat } from '../../../lib/utils';
import { DEFAULT_IMX_DECIMALS } from '../../../lib';
import { quotesProcessor } from '../functions/FetchQuote';
import { SelectInput } from '../../../components/FormComponents/SelectInput/SelectInput';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import {
  validateFromAmount,
  validateFromToken,
  validateToAmount,
  validateToToken,
} from '../functions/SwapValidator';
import { Fees } from './Fees';
import { SwapButton } from './SwapButton';
import { SwapFormData } from './swapFormTypes';
import { CoinSelectorOptionProps } from '../../../components/CoinSelector/CoinSelectorOption';
import { useInterval } from '../../../lib/hooks/useInterval';

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

  // TODO: native token handling for no-address tokens
  const initialToken = (address) => allowedTokens.find((t) => t.address === address);
  const initialBalance = (address) => tokenBalances.find((t) => t.token.address === address)?.formattedBalance;

  const formatTokenOptionsId = (symbol: string, address?: string) => {
    if (!address) return symbol.toLowerCase();
    return `${symbol.toLowerCase()}-${address.toLowerCase()}`;
  };

  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);

  const [editing, setEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [direction, setDirection] = useState<SwapDirection>(SwapDirection.FROM);
  const [loading, setLoading] = useState(false);
  const [swapFromToConversionText, setSwapFromToConversionText] = useState('');

  // Form State
  const [fromAmount, setFromAmount] = useState<string>(data?.fromAmount || '');
  const [fromAmountError, setFromAmountError] = useState<string>('');
  const [fromToken, setFromToken] = useState<TokenInfo | undefined>(initialToken(data?.fromContractAddress));
  const [fromBalance, setFromBalance] = useState<string>(initialBalance(data?.fromContractAddress) || '');
  const [fromTokenError, setFromTokenError] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>(data?.toAmount || '');
  const [toAmountError, setToAmountError] = useState<string>('');
  const [toToken, setToToken] = useState<TokenInfo | undefined>(initialToken(data?.toContractAddress));
  const [toTokenError, setToTokenError] = useState<string>('');
  const [fromFiatValue, setFromFiatValue] = useState('');

  // Quote
  const [quote, setQuote] = useState<TransactionResponse | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [quoteError, setQuoteError] = useState<string>('');
  const [gasFeeValue, setGasFeeValue] = useState<string>('');
  const [gasFeeToken, setGasFeeToken] = useState< TokenInfo | null>(null);
  const [gasFeeFiatValue, setGasFeeFiatValue] = useState<string>('');
  const tokensOptionsFrom = useMemo(
    () => tokenBalances
      .filter((b) => b.balance.gt(0))
      .map(
        (t) => ({
          id: formatTokenOptionsId(t.token.symbol, t.token.address),
          name: t.token.name,
          symbol: t.token.symbol,
          icon: t.token.icon,
          balance: {
            formattedAmount: t.formattedBalance,
            formattedFiatAmount: calculateCryptoToFiat(
              t.formattedBalance,
              t.token.symbol || '',
              cryptoFiatState.conversions,
            ),
          },
        } as CoinSelectorOptionProps),
      ),
    [tokenBalances],
  );
  const tokensOptionsTo = useMemo(
    () => allowedTokens
      .filter((t) => t.address !== fromToken?.address)
      .map(
        (t) => ({
          id: formatTokenOptionsId(t.symbol, t.address),
          name: t.name,
          symbol: t.symbol,
          icon: undefined, // todo: add correct image once available on token info
        } as CoinSelectorOptionProps),
      ),
    [allowedTokens, fromToken],
  );

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

      // Prevent to use the silently fetch quote
      // if the user has updated the values and
      // it is fetching a new quote.
      if (silently && loading) return;

      const estimate = result.info.gasFeeEstimate;
      const gasFee = utils.formatUnits(
        estimate?.amount || 0,
        DEFAULT_IMX_DECIMALS,
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
            result.info.quote.amount,
            result.info.quote.token.decimals,
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

      // Prevent to use the silently fetch quote
      // if the user has updated the values and
      // it is fetching a new quote.
      if (silently && loading) return;

      const estimate = result.info.gasFeeEstimate;
      const gasFee = utils.formatUnits(
        estimate?.amount || 0,
        DEFAULT_IMX_DECIMALS,
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
            result.info.quote.amount,
            result.info.quote.token.decimals,
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
  useInterval(() => fetchQuote(true), 3000);

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

  const onFromSelectChange = (value: OptionKey) => {
    const selected = tokenBalances
      .find((t) => value === formatTokenOptionsId(t.token.symbol, t.token.address));
    if (!selected) return;

    setFromToken(selected.token);
    setFromBalance(selected.formattedBalance);
    setFromTokenError('');
  };

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
  const onToSelectChange = (value: OptionKey) => {
    const selected = allowedTokens.find((t) => value === formatTokenOptionsId(t.symbol, t.address));
    if (!selected) return;
    setToToken(selected);
    setToTokenError('');
  };

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

  const { content, swapForm } = text.views[SwapWidgetViews.SWAP];
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
      />
    </>
  );
}
