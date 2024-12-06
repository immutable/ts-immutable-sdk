import { TransactionResponse } from '@imtbl/dex-sdk';
import { TFunction } from 'i18next';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { formatUnits, parseUnits } from 'ethers';
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
  const relativeFromAmount = parseUnits(parsedFromAmount.toString(), fromToken.decimals);
  const relativeToAmount = BigInt(quote.quote.amount.value);

  // Determine the maximum decimal places to equalize to
  const fromDecimals = fromToken.decimals;
  const toDecimals = quote.quote.amount.token.decimals;
  const maxDecimals = Math.max(fromDecimals, toDecimals);

  // Calculate scale factors based on maximum decimals
  const fromScaleFactor = BigInt('10') ** BigInt(maxDecimals - fromDecimals);
  const toScaleFactor = BigInt('10') ** BigInt(maxDecimals - toDecimals);

  // Adjust amounts to the same decimal scale
  const adjustedFromAmount = relativeFromAmount * fromScaleFactor;
  const adjustedToAmount = relativeToAmount * toScaleFactor;

  // Calculate conversion rate
  const initialRate = adjustedToAmount / adjustedFromAmount;

  // Calculate the remainder and adjust it correctly
  const conversionRemainder = adjustedToAmount % adjustedFromAmount;
  const remainderAdjustmentFactor = BigInt('10') ** BigInt(maxDecimals);
  const adjustedRemainder = (conversionRemainder * remainderAdjustmentFactor) / adjustedFromAmount;

  // Compose the total conversion rate by adding the adjusted remainder
  const accurateRate = initialRate * remainderAdjustmentFactor + adjustedRemainder;
  const formattedConversion = formatZeroAmount(tokenValueFormat(
    formatUnits(accurateRate, maxDecimals),
  ), true);

  return t(labelKey, {
    fromSymbol: fromToken.symbol,
    toSymbol: toToken.symbol,
    rate: formattedConversion,
    fee: (secondaryFee?.basisPoints ?? 0) / 100,
  });
};
