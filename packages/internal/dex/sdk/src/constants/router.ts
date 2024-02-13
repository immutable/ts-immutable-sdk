// 0.1% default slippage
export const DEFAULT_SLIPPAGE = 0.1;

// 15 minutes from the time the transaction was prepared
export const DEFAULT_DEADLINE_SECONDS: number = 60 * 15;

// most swaps will be able to resolve with 2 hops
export const DEFAULT_MAX_HOPS: number = 2;

// after 10 hops, it is very unlikely a route will be available
export const MAX_MAX_HOPS: number = 10;

// a max hop of 1 will require a direct swap with no intermediary pools
export const MIN_MAX_HOPS: number = 1;

// precision used to calculate percentage from basis points
export const BASIS_POINT_PRECISION = 10_000;

// 10% maximum secondary fee
export const MAX_SECONDARY_FEE_BASIS_POINTS = 1000;

// How much more gas does a swap with secondary fees cost?
// This number is the average difference of a number of different swaps with different hop amounts, etc.
export const AVERAGE_SECONDARY_FEE_EXTRA_GAS = 50876;
