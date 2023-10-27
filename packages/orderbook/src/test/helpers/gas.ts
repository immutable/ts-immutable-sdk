import { BigNumber } from 'ethers';

export const GAS_OVERRIDES = {
  maxFeePerGas: BigNumber.from(102e9),
  maxPriorityFeePerGas: BigNumber.from(101e9),
};
