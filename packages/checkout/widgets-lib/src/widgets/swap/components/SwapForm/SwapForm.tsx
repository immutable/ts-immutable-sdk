import {
  useCallback, useContext, useEffect, useMemo,
} from 'react';
import {
  Body, Box, Heading, OptionKey,
} from '@biom3/react';
import { SelectInput } from '../../../../components/FormComponents/SelectInput/SelectInput';
import { amountInputValidation } from '../../../../lib/validations/amountInputValidations';
import {
  SwapFormActions,
  SwapFormContext,
} from '../../context/swap-form-context/SwapFormContext';
import {
  swapFormContainerStyle,
  toHeadingBodyStyle,
  headingStyle,
} from './SwapFormStyles';
import { text } from '../../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../../context/view-context/SwapViewContextTypes';
import { SwapContext } from '../../context/swap-context/SwapContext';
import { SelectOption } from '../../../../components/FormComponents/SelectForm/SelectForm';
import { CryptoFiatActions, CryptoFiatContext } from '../../../../context/crypto-fiat-context/CryptoFiatContext';
import { calculateCryptoToFiat } from '../../../../lib/utils';

export function SwapForm() {
  const { swapState } = useContext(SwapContext);
  const { swapFormState, swapFormDispatch } = useContext(SwapFormContext);
  const { content, swapForm } = text.views[SwapWidgetViews.SWAP];
  const {
    swapFromAmount, swapFromToken, swapToAmount, swapToToken,
  } = swapFormState;
  const { tokenBalances, allowedTokens } = swapState;
  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);

  const fromTokensOptions = useMemo(
    () => tokenBalances.filter((balance) => balance.balance.gt(0)).map(
      (tokenBalance) => ({
        id: `${tokenBalance.token.symbol}-${tokenBalance.token.name}`,
        label: tokenBalance.token.symbol,
        icon: tokenBalance.token.icon, // todo: add correct image once available on token info
      } as SelectOption),
    ),
    [tokenBalances],
  );

  const toTokenOptions = useMemo(
    () => allowedTokens.map(
      (token) => ({
        id: `${token.symbol}-${token.name}`,
        label: token.symbol,
        icon: undefined, // todo: add correct image once available on token info
      } as SelectOption),
    ),
    [allowedTokens, swapFromToken],
  );

  useEffect(() => {
    const tokenSymbols: string[] = [];
    allowedTokens.forEach((token) => {
      tokenSymbols.push(token.symbol);
    });

    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols,
      },
    });
  }, [cryptoFiatDispatch, fromTokensOptions]);

  useEffect(() => {
    if (!swapFormState.swapFromAmount) {
      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_FROM_FIAT_VALUE,
          swapFromFiatValue: '0.00',
        },
      });
    }

    if (swapFormState.swapFromAmount && swapFormState.swapFromToken) {
      swapFormDispatch({
        payload: {
          type: SwapFormActions.SET_SWAP_FROM_FIAT_VALUE,
          swapFromFiatValue: calculateCryptoToFiat(
            swapFormState.swapFromAmount,
            swapFormState.swapFromToken.symbol,
            cryptoFiatState.conversions,
          ),
        },
      });
    }
    // {'imx' => 0.751084, 'fun' => 0.00492518, 'usdc' => 1, 'weth' => 1819.43}
    console.log('Conversions: ', cryptoFiatState.conversions);
  }, [cryptoFiatState.conversions, swapFormState.swapFromAmount, swapFormState.swapFromToken]);

  // extract these to context or calculate on render
  const fromToConversionText = '1 WETH ≈ 12.6 GOG'; // TODO: to calculate when dex integrated
  const fromFiatPriceText = `${content.fiatPricePrefix} $${swapFormState.swapFromFiatValue}`;
  const availableFromBalanceSubtext = `${content.availableBalancePrefix} 0.123`; // todo: update with actual values

  const handleFromTokenChange = useCallback(
    (value: OptionKey) => {
      const selectedTokenOption = tokenBalances.find(
        (tokenBalance) => value === `${tokenBalance.token.symbol}-${tokenBalance.token.name}`,
      );

      if (selectedTokenOption && selectedTokenOption.token) {
        swapFormDispatch({
          payload: {
            type: SwapFormActions.SET_SWAP_FROM_TOKEN,
            swapFromToken: selectedTokenOption.token,
          },
        });
      }
    },
    [tokenBalances, swapFormDispatch, swapToToken],
  );

  const handleToTokenChange = useCallback(
    (value: OptionKey) => {
      const selectedTokenOption = allowedTokens.find(
        (token) => value === `${token.symbol}-${token.name}`,
      );

      if (selectedTokenOption) {
        swapFormDispatch({
          payload: {
            type: SwapFormActions.SET_SWAP_TO_TOKEN,
            swapToToken: selectedTokenOption,
          },
        });
      }
    },
    [allowedTokens, swapFormDispatch],
  );

  return (
    <Box sx={swapFormContainerStyle}>
      <Box>
        <Heading size="xSmall" sx={headingStyle}>
          {swapForm.from.label}
        </Heading>
        <SelectInput
          testId="fromTokenInputs"
          options={fromTokensOptions}
          selectSubtext={availableFromBalanceSubtext}
          selectTextAlign="left"
          textInputValue={swapFromAmount}
          textInputPlaceholder={swapForm.from.inputPlaceholder}
          textInputSubtext={fromFiatPriceText}
          textInputTextAlign="right"
          textInputValidator={amountInputValidation}
          // eslint-disable-next-line no-console
          onTextInputFocus={() => console.log('Swap From Text Input Focused')}
          onTextInputChange={(value) => {
            // eslint-disable-next-line no-console
            console.log(`Swap From Amount onChange ${value}`);
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_SWAP_FROM_AMOUNT,
                swapFromAmount: value,
              },
            });
          }}
          onTextInputBlur={(value: string) => {
            // eslint-disable-next-line no-console
            console.log(`Swap From Amount onBlur ${value}`);
          }}
          textInputMaxButtonClick={() => {
            // eslint-disable-next-line no-console
            console.log('todo: implement max button function');
          }}
          onSelectChange={handleFromTokenChange}
        />
      </Box>
      <Box>
        <Box sx={headingStyle}>
          <Heading size="xSmall">{swapForm.to.label}</Heading>
          <Body sx={toHeadingBodyStyle} size="small">
            {fromToConversionText}
          </Body>
        </Box>
        <SelectInput
          testId="toTokenInputs"
          options={toTokenOptions}
          textInputValue={swapToAmount}
          textInputPlaceholder={swapForm.to.inputPlaceholder}
          textInputTextAlign="right"
          textInputValidator={amountInputValidation}
          // eslint-disable-next-line no-console
          onTextInputFocus={() => console.log('Swap To Text Input Focused')}
          onTextInputChange={(value) => {
            swapFormDispatch({
              payload: {
                type: SwapFormActions.SET_SWAP_TO_AMOUNT,
                swapToAmount: value,
              },
            });
          }}
          onTextInputBlur={(value: string) => {
            // eslint-disable-next-line no-console
            console.log(`Swap To Amount onBlur ${value}`);
          }}
          textInputMaxButtonClick={() => {
            // eslint-disable-next-line no-console
            console.log('todo: implement max button function');
          }}
          onSelectChange={handleToTokenChange}
        />
      </Box>
    </Box>
  );
}
