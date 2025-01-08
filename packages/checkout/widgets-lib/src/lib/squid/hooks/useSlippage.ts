import { useMemo } from 'react';

const BASE_SLIPPAGE_HIGH_TIER = 0.005;
const BASE_SLIPPAGE_MEDIUM_TIER = 0.01;
const BASE_SLIPPAGE_LOW_TIER = 0.015;

const SLIPPAGE_TIERS = {
  high: {
    threshold: 999,
    value: BASE_SLIPPAGE_HIGH_TIER,
  },
  medium: {
    threshold: 99,
    value: BASE_SLIPPAGE_MEDIUM_TIER,
  },
  low: {
    threshold: 0,
    value: BASE_SLIPPAGE_LOW_TIER,
  },
} as const;

/**
 * Hook to calculate slippage based on thresholds
 */
export const useSlippage = () => {
  const getSlippageTier = (usdAmount: number): number => {
    if (usdAmount >= SLIPPAGE_TIERS.high.threshold) return SLIPPAGE_TIERS.high.value;
    if (usdAmount >= SLIPPAGE_TIERS.medium.threshold) return SLIPPAGE_TIERS.medium.value;
    return SLIPPAGE_TIERS.low.value;
  };

  const calculateAdjustedAmount = (
    baseAmount: number,
    usdAmount: number,
    additionalBuffer: number = 0,
  ): number => {
    const slippage = getSlippageTier(usdAmount);
    return baseAmount * (1 + slippage + additionalBuffer);
  };

  return useMemo(() => ({
    getSlippageTier,
    calculateAdjustedAmount,
  }), []);
};
