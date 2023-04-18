import { Percent } from '@uniswap/sdk-core';

export const DEFAULT_SLIPPAGE: Percent = new Percent(1, 1000); // 1/1000 = 0.001 = 0.1%
export const DEFAULT_DEADLINE: number = Math.floor(Date.now() / 1000) + 60 * 15; // 15 minutes from the current Unix time
export const DEFAULT_MAX_HOPS: number = 2;
export const MAX_MAX_HOPS: number = 10;
