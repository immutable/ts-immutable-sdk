import { BigNumber } from 'ethers';

export const GAS_OVERRIDES = {
  maxFeePerGas: BigNumber.from(15e8),
  maxPriorityFeePerGas: BigNumber.from(12e8),
};
