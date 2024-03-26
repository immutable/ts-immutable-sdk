import { BigNumber } from 'ethers';

export const GAS_OVERRIDES = {
  maxFeePerGas: BigNumber.from(102e8),
  maxPriorityFeePerGas: BigNumber.from(101e8),
};
