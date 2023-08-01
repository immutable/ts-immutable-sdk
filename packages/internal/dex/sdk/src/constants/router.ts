// 0.1% default slippage
export const DEFAULT_SLIPPAGE = 0.1;

// 15 minutes from the current Unix time
export const DEFAULT_DEADLINE: number = Math.floor(Date.now() / 1000) + 60 * 15;

// most swaps will be able to resolve with 2 hops
export const DEFAULT_MAX_HOPS: number = 2;

// after 10 hops, it is very unlikely a route will be available
export const MAX_MAX_HOPS: number = 10;

// a max hop of 1 will require a direct swap with no intermediary pools
export const MIN_MAX_HOPS: number = 1;

// 10% maximum secondary fee
export const MAX_SECONDARY_FEE_BASIS_POINTS = 10000;
