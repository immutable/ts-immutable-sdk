import {
  GasEstimateBridgeToL2Result,
  GasEstimateSwapResult,
  OnRampProviderFees,
  TokenInfo,
} from '@imtbl/checkout-sdk';
import { formatUnits } from 'ethers';

const convertFeeToFiat = (
  fee: bigint | undefined,
  token: TokenInfo | undefined,
  conversions: Map<string, number>,
): number => {
  let feeAmountInFiat = -1;

  if (fee && token) {
    const formattedAmount = formatUnits(fee, token.decimals);
    const gasFeeTokenConversion = conversions.get(
      token.symbol.toLocaleLowerCase(),
    );
    if (gasFeeTokenConversion) {
      const parsedAmount = parseFloat(formattedAmount);
      if (Number.isNaN(parsedAmount)) return feeAmountInFiat;
      feeAmountInFiat = parsedAmount * gasFeeTokenConversion;
    }
  }

  return feeAmountInFiat;
};

// Formats a value to 2 decimal places unless the value is less than 0.01, in which case it will show the first non-zero digit of the decimal places
export function formatFiatDecimals(value: number): string {
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

export const getOnRampFeeEstimation = (
  onRampFees: OnRampProviderFees,
): string => {
  const { minPercentage, maxPercentage } = onRampFees;

  if (minPercentage === undefined || maxPercentage === undefined) return '-.--';

  return `${minPercentage}% to ${maxPercentage}`;
};

export const getSwapFeeEstimation = (
  swapFees: GasEstimateSwapResult,
  conversions: Map<string, number>,
): string => {
  const { fees } = swapFees;

  const feeAmount = fees.totalFees;
  if (feeAmount === undefined) return '-.--';
  const feeToken = fees.token;
  if (feeToken === undefined) return '-.--';

  const gasFeeInFiat = convertFeeToFiat(feeAmount, feeToken, conversions);
  if (gasFeeInFiat < 0) return '-.--';

  return formatFiatDecimals(gasFeeInFiat);
};

export const getBridgeFeeEstimation = (
  bridgeFees: GasEstimateBridgeToL2Result,
  conversions: Map<string, number>,
): string => {
  const { fees, token } = bridgeFees;

  const feeAmount = fees.totalFees;
  if (feeAmount === undefined) return '-.--';
  if (token === undefined) return '-.--';

  const feesInFiat = convertFeeToFiat(fees.totalFees, token, conversions);
  if (feesInFiat < 0) return '-.--';

  return formatFiatDecimals(feesInFiat);
};
