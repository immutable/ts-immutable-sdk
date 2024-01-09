import { BigNumber } from 'ethers';

export const GAS_OVERRIDES = {
  maxFeePerGas: BigNumber.from(12e9),
  maxPriorityFeePerGas: BigNumber.from(11e9),
};
