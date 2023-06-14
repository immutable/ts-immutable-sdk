import { GasEstimateBridgeToL2Result, GasEstimateSwapResult, TokenInfo } from '@imtbl/checkout-sdk';
import { BigNumber, ethers } from 'ethers';

const convertFeeToFiat = (
  fee: BigNumber | undefined,
  token: TokenInfo | undefined,
  conversions: Map<string, number>,
): number => {
  let feeAmountInFiat = 0;

  if (fee && token) {
    const formattedAmount = ethers.utils.formatUnits(fee, token.decimals);
    const gasFeeTokenConversion = conversions.get(token.symbol.toLocaleLowerCase());
    if (gasFeeTokenConversion) {
      const parsedAmount = parseFloat(formattedAmount);
      if (Number.isNaN(parsedAmount)) return feeAmountInFiat;
      feeAmountInFiat = parseFloat(formattedAmount) * gasFeeTokenConversion;
    }
  }

  return feeAmountInFiat;
};

export const getSwapFeeEstimation = (
  swapFees: GasEstimateSwapResult,
  conversions: Map<string, number>,
): string => {
  const { gasFee } = swapFees;

  const gasFeeAmount = gasFee.estimatedAmount;
  const gasFeeToken = gasFee.token;

  const gasFeeInFiat = convertFeeToFiat(gasFeeAmount, gasFeeToken, conversions);

  if (gasFeeInFiat === 0) return '-.--';
  return gasFeeInFiat.toFixed(6); // todo: this fee amount is so low that toFixed(2) returns 0.00, should we make this dynamic so that it shows at least the first non-zero digit of the decimal places?
};

export const getBridgeFeeEstimation = (
  bridgeFees: GasEstimateBridgeToL2Result,
  conversions: Map<string, number>,
): string => {
  const { gasFee, bridgeFee } = bridgeFees;

  const gasFeeAmount = gasFee.estimatedAmount;
  const gasFeeToken = gasFee.token;

  const gasFeeInFiat = convertFeeToFiat(gasFeeAmount, gasFeeToken, conversions);
  const bridgeFeeInFiat = convertFeeToFiat(bridgeFee.estimatedAmount, bridgeFee.token, conversions);

  if (gasFeeInFiat === 0) return '-.--';
  if (bridgeFeeInFiat === 0) return gasFeeInFiat.toFixed(2);
  return (gasFeeInFiat + bridgeFeeInFiat).toFixed(2);
};
