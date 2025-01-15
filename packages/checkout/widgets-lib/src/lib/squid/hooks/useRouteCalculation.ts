import { useMemo } from 'react';
import { utils } from 'ethers';
import { useSlippage } from './useSlippage';
import { Token } from '../types';

/**
 * Hook to handle route amount calculations.
 */
export const useRouteCalculation = () => {
  const { calculateAdjustedAmount } = useSlippage();

  /**
     * Calculate the fromAmount based on USD prices and slippage.
     */
  const calculateFromAmount = (
    fromToken: Token,
    toToken: Token,
    toAmount: string,
    additionalBuffer: number = 0,
  ) => {
    const toAmountNumber = parseFloat(toAmount);
    // Calculate the USD value of the toAmount
    const toAmountInUsd = toAmountNumber * toToken.usdPrice;
    // Calculate the amount of fromToken needed to match this USD value
    const baseFromAmount = toAmountInUsd / fromToken.usdPrice;
    // Add a buffer for price fluctuations and fees
    const fromAmountWithBuffer = calculateAdjustedAmount(baseFromAmount, toAmountInUsd, additionalBuffer);

    return fromAmountWithBuffer.toString();
  };

  /**
     * Calculate the fromAmount using exchange rate returned from the route.
     */
  const calculateFromAmountFromRoute = (
    exchangeRate: string,
    toAmount: string,
    toAmountUSD?: string,
  ) => {
    const toAmountUSDNumber = toAmountUSD ? parseFloat(toAmountUSD) : 0;
    const fromAmount = parseFloat(toAmount) / parseFloat(exchangeRate);
    const fromAmountWithBuffer = calculateAdjustedAmount(fromAmount, toAmountUSDNumber);
    return fromAmountWithBuffer.toString();
  };

  /**
     * Convert a string amount to a formatted amount with the specified number of decimals.
     */
  const convertToFormattedFromAmount = (amount: string, decimals: number) => {
    const parsedFromAmount = parseFloat(amount).toFixed(decimals);
    const formattedFromAmount = utils.parseUnits(parsedFromAmount, decimals);
    return formattedFromAmount.toString();
  };

  return useMemo(() => ({
    calculateFromAmount,
    calculateFromAmountFromRoute,
    convertToFormattedFromAmount,
  }), []);
};
