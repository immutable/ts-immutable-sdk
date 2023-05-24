import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import {
  Body, Box, Heading, OptionKey,
} from '@biom3/react';
import { utils } from 'ethers';
import { GetBalanceResult, TokenInfo } from '@imtbl/checkout-sdk';
import { TransactionResponse } from '@imtbl/dex-sdk';
import { text } from '../../../resources/text/textConfig';
import { amountInputValidation as textInputValidator } from '../../../lib/validations/amountInputValidations';
import { SwapContext } from '../context/SwapContext';
import { CryptoFiatActions, CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { calculateCryptoToFiat, formatZeroAmount, tokenValueFormat } from '../../../lib/utils';
import { DEFAULT_IMX_DECIMALS } from '../../../lib/constants';
import { quotesProcessor } from '../functions/FetchQuote';
import { SelectInput } from '../../../components/FormComponents/SelectInput/SelectInput';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { SelectOption } from '../../../components/FormComponents/SelectForm/SelectForm';
import {
  ValidateFromAmount, ValidateFromToken, ValidateToAmount, ValidateToToken,
} from '../functions/SwapValidator';
import { Fees } from './Fees';
import { SwapButton } from './SwapButton';

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
  swapFromToken: GetBalanceResult | null;
  swapFromAmount: string;
  swapToToken: TokenInfo | null;
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
    resp.fromToConversion = `1 ${swapFromToken.token.symbol} ≈ ${
      formatZeroAmount(conversionRatio, true)
    } ${swapToToken.symbol}`;
  }

  return resp;
};

export function SwapForm() {
  const {
    swapState: {
      allowedTokens,
      provider,
      exchange,
      tokenBalances,
    },
  } = useContext(SwapContext);

  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);

  const [editing, setEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [direction, setDirection] = useState<SwapDirection>(SwapDirection.FROM);
  const [loading, setLoading] = useState(false);
  const [swapFromToConversionText, setSwapFromToConversionText] = useState('');

  // Form State
  const [fromAmount, setFromAmount] = useState<string>('');
  const [fromAmountError, setFromAmountError] = useState<string>('');
  const [fromToken, setFromToken] = useState<GetBalanceResult | null>(null);
  const [fromTokenError, setFromTokenError] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [toAmountError, setToAmountError] = useState<string>('');
  const [toToken, setToToken] = useState<TokenInfo | null>(null);
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
          id: `${t.token.symbol}-${t.token.name}`,
          label: t.token.symbol,
          icon: t.token.icon,
        } as SelectOption),
      ),
    [tokenBalances],
  );

  const tokensOptionsTo = useMemo(
    () => allowedTokens
      .filter((t) => t.address !== fromToken?.token.address)
      .map(
        (t) => ({
          id: `${t.symbol}-${t.name}`,
          label: t.symbol,
          icon: undefined, // todo: add correct image once available on token info
        } as SelectOption),
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
  const processFetchQuoteFrom = async () => {
    if (!provider) return;
    if (!exchange) return;
    if (!fromToken) return;
    if (!toToken) return;

    try {
      const result = await quotesProcessor.fromAmountIn(
        exchange,
        provider,
        fromToken.token,
        fromAmount,
        toToken,
      );

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
      // eslint-disable-next-line no-console
      console.log('Quote error: ', error.message);
      // todo: handle the display on form when exchange errors
      setQuoteError(error.message);
    }
    setIsFetching(false);
  };

  const processFetchQuoteTo = async () => {
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
        fromToken.token,
      );

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

  const fetchQuoteFrom = async () => {
    if (!canRunFromQuote()) return;

    setLoading(true);
    setIsFetching(true);

    await processFetchQuoteFrom();

    setLoading(false);
    setIsFetching(false);
  };

  const canRunToQuote = (): boolean => {
    if (Number.isNaN(parseFloat(toAmount))) return false;
    if (parseFloat(toAmount) <= 0) return false;
    if (!fromToken) return false;
    if (!toToken) return false;
    if (isFetching) return false;
    return true;
  };

  const fetchQuoteTo = async () => {
    if (!canRunToQuote()) return;

    setLoading(true);
    setIsFetching(true);

    await processFetchQuoteTo();

    setLoading(false);
    setIsFetching(false);
  };

  const fetchQuote = async () => {
    if (direction === SwapDirection.FROM) await fetchQuoteFrom();
    else await fetchQuoteTo();
  };

  useEffect(() => {
    if (direction === SwapDirection.TO) return;
    if (editing) return;
    (async () => await fetchQuote())();
  }, [fromAmount, fromToken, toToken, editing]);

  useEffect(() => {
    if (direction === SwapDirection.FROM) return;
    if (editing) return;
    (async () => await fetchQuote())();
  }, [toAmount, toToken, fromToken, editing]);

  // -------------//
  //     FROM     //
  // -------------//
  const validateFromAmount = (value: string): string | null => {
    if (!fromToken) return null;
    const err = ValidateFromAmount(value, fromToken.formattedBalance);
    setFromAmountError(err);
    return err;
  };

  const validateFromToken = (value: GetBalanceResult): string | null => {
    const err = ValidateFromToken(value);
    setFromTokenError(err);
    return err;
  };

  useEffect(() => {
    if (!fromAmount) return;
    let err = validateFromAmount(fromAmount);
    if (err) return;

    if (!fromToken) return;
    err = validateFromToken(fromToken);
    if (err) return;

    setFromFiatValue(calculateCryptoToFiat(
      fromAmount,
      fromToken.token.symbol,
      cryptoFiatState.conversions,
    ));
  }, [fromAmount, fromAmount]);

  const onFromSelectChange = (value: OptionKey) => {
    const selected = tokenBalances.find((t) => value === `${t.token.symbol}-${t.token.name}`);
    if (!selected) return;

    setFromToken(selected);
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
    if (!fromToken) return;

    const value = fromToken.formattedBalance;
    setFromAmount(value);
    setDirection(SwapDirection.FROM);
  };

  // ------------//
  //      TO     //
  // ------------//
  const validateAmount = (value: string) => {
    if (!toToken) return;
    const err = ValidateToAmount(value);
    setToAmountError(err);
  };

  const validateToken = (value: TokenInfo) => {
    const err = ValidateToToken(value);
    setToTokenError(err);
  };

  useEffect(() => {
    if (!toAmount) return;
    validateAmount(toAmount);
    if (!toToken) return;
    validateToken(toToken);
  }, [toAmount, toToken]);

  const onToSelectChange = (value: OptionKey) => {
    const selected = allowedTokens.find((t) => value === `${t.symbol}-${t.name}`);
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
    const validateFromTokenError = ValidateFromToken(fromToken);
    const validateFromAmountError = ValidateFromAmount(fromAmount, fromToken?.formattedBalance);
    const validateToTokenError = ValidateToToken(toToken);
    const validateToAmountError = ValidateToAmount(toAmount);

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

  // useEffect(() => {
  //   const id = setInterval(() => fetchQuote(), 2000);
  //   return () => {
  //     clearInterval(id);
  //   };
  // }, []);

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
        <Box sx={{
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
              ? `${content.availableBalancePrefix} ${fromToken?.formattedBalance}`
              : ''
          }
              selectTextAlign="left"
              textInputValue={fromAmount}
              textInputPlaceholder={swapForm.from.inputPlaceholder}
              textInputSubtext={`${content.fiatPricePrefix} $${formatZeroAmount(fromFiatValue, true)}`}
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
            />
          </Box>

          {/* TO */}
          <Box>
            <Box sx={{
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
                {!loading && swapFromToConversionText}
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
            />
          </Box>
        </Box>
        <Fees gasFeeFiatValue={gasFeeFiatValue} gasFeeToken={gasFeeToken} gasFeeValue={gasFeeValue} />
      </Box>
      <SwapButton
        validator={SwapFormValidator}
        loading={loading}
      />
    </>
  );
}
