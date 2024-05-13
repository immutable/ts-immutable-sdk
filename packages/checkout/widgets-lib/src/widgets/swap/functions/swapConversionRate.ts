import { TransactionResponse } from '@imtbl/dex-sdk';
import { BigNumber, utils } from 'ethers';
import { TFunction } from 'i18next';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { formatZeroAmount, tokenValueFormat } from '../../../lib/utils';

export const formatQuoteConversionRate = (
  amount: string,
  token: TokenInfo,
  quote: TransactionResponse,
  labelKey: string,
  t: TFunction,
) => {
  // Grab the token from the quote secondary fees
  // NOTE: This has a dependency on the secondary fee and needs to change if we change that fee
  const secondaryFee = quote.quote.fees[0];
  const fromToken = token;
  const toToken = quote.quote.amount.token;

  // Parse the fromAmount input, multiply by 10^decimals to convert to integer units
  const parsedFromAmount = parseFloat(amount);
  const expandedFromAmount = parsedFromAmount * (10 ** fromToken.decimals);
  const relativeFromAmount = BigNumber.from(expandedFromAmount.toFixed(0));
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
  const formattedConversion = formatZeroAmount(tokenValueFormat(
    utils.formatUnits(accurateRate, maxDecimals),
  ), true);

  return t(labelKey, {
    fromSymbol: fromToken.symbol,
    toSymbol: toToken.symbol,
    rate: formattedConversion,
    fee: secondaryFee.basisPoints / 100,
  });
};
