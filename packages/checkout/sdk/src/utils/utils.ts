import { DEFAULT_TOKEN_FORMATTING_DECIMALS } from '../env/constants';
import { ChainId } from '../types';

export const isMatchingAddress = (addressA: string = '', addressB: string = '') => (
  addressA.toLowerCase() === addressB.toLowerCase()
);

export const isZkEvmChainId = (chainId: ChainId) => chainId === ChainId.IMTBL_ZKEVM_DEVNET
  || chainId === ChainId.IMTBL_ZKEVM_TESTNET
  || chainId === ChainId.IMTBL_ZKEVM_MAINNET;

const trimRoundUpDecimals = (s: string, maxDecimals: number): string => {
  const pointIndex = s.indexOf('.');
  const extraDecimals = s.substring(pointIndex + maxDecimals + 1);
  if (extraDecimals && parseFloat(extraDecimals) >= 1) {
    const trimmedDecimals = s.substring(0, pointIndex + maxDecimals + 1);
    const increment = 1 / (10 ** maxDecimals);
    return (parseFloat(trimmedDecimals) + increment).toString();
  }
  return parseFloat(s.substring(0, pointIndex + maxDecimals + 1)).toString();
};

/**
 * Rounds up a token amount to a set number of decimals, so it can be handled by Swap, Bridge, OnRamp Widgets.
 * Widgets can only handle formatted values of 6 (DEFAULT_TOKEN_FORMATTING_DECIMALS) decimals.
 * @param amount
 * @param maxDecimals
 * @returns
 */
export const formatSmartCheckoutAmount = (
  amount: string,
  maxDecimals: number = DEFAULT_TOKEN_FORMATTING_DECIMALS,
) => {
  // Only float numbers will be handled by this function
  const pointIndex = amount.indexOf('.');
  if (pointIndex === -1) return amount;

  const formattedAmount = trimRoundUpDecimals(amount, maxDecimals);

  return formattedAmount;
};
