import { FeeData } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

const doesChainSupportEIP1559 = (feeData: FeeData) => !!feeData.maxFeePerGas && !!feeData.maxPriorityFeePerGas;

export const getGasPriceInWei = (feeData: FeeData): BigNumber | null => {
  if (doesChainSupportEIP1559(feeData)) {
    // EIP1559 we need to add a tip for the miner to the base fee
    return BigNumber.from(feeData.lastBaseFeePerGas).add(
      BigNumber.from(feeData.maxPriorityFeePerGas),
    );
  }
  if (feeData.gasPrice) return BigNumber.from(feeData.gasPrice);
  return null;
};
