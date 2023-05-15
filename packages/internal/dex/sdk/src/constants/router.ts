export const DEFAULT_SLIPPAGE = 0.1; // 0.1 %
// 15 minutes from the current Unix time
export const DEFAULT_DEADLINE: number = Math.floor(Date.now() / 1000) + 60 * 15;
export const DEFAULT_MAX_HOPS: number = 2;
export const MAX_MAX_HOPS: number = 10;
