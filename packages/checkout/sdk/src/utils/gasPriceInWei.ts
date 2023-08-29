import { FeeData } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

const doesChainSupportEIP1559 = (feeData: FeeData) => !!feeData.maxFeePerGas && !!feeData.maxPriorityFeePerGas;

export const getGasPriceInWei = (feeData: FeeData): BigNumber | null => {
  if (doesChainSupportEIP1559(feeData)) {
    return BigNumber.from(feeData.maxFeePerGas).add(
      BigNumber.from(feeData.maxPriorityFeePerGas),
    );
  }
  if (feeData.gasPrice) return BigNumber.from(feeData.gasPrice);
  return null;
};
