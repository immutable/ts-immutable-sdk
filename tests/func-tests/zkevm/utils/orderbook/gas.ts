import { BigNumber } from 'ethers';

export const GAS_OVERRIDES = {
  maxFeePerGas: BigNumber.from(15e9),
  maxPriorityFeePerGas: BigNumber.from(10e9),
};
