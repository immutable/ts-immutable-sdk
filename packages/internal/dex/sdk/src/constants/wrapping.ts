// 45038 is the upper bound of the gas estimate for the deposit function.
// This upper bound is reached when a user is wrapping for the first time (cold + unused storage slot)
// The lower bound is 27,938, so the difference is 17,100 gas. If transactions are 10 gwei IMX,
// this is about 0.000171 IMX difference. In order to avoid an extra remote call, we just use the upper bound instead.
export const IMX_WRAP_GAS_COST = 45038;
// 35216 is the upper bound of the gas estimate for the withdraw function.
// The differenfce between upper and normal is less than 0.0001 IMX, so we just use the upper bound
// to avoid an extra remote call.
export const IMX_UNWRAP_GAS_COST = 35216;
