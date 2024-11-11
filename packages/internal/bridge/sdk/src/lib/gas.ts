import { FeeData } from 'ethers';

const doesChainSupportEIP1559 = (feeData: FeeData) => !!feeData.maxFeePerGas && !!feeData.maxPriorityFeePerGas;

export const getGasPriceInWei = (feeData: FeeData): bigint | null => {
  if (doesChainSupportEIP1559(feeData)) {
    // EIP1559 we need to add a tip for the miner to the base fee
    const { maxFeePerGas, maxPriorityFeePerGas } = feeData;
    if (maxFeePerGas === null || maxPriorityFeePerGas === null) return null;
    const lastBaseFeePerGas = (maxFeePerGas - maxPriorityFeePerGas) / BigInt(2);
    return maxPriorityFeePerGas + lastBaseFeePerGas;
  }
  if (feeData.gasPrice) return feeData.gasPrice;
  return null;
};

export function calculateGasFee(
  feeData: FeeData,
  gasLimit: number,
): bigint {
  const gasPriceInWei = getGasPriceInWei(feeData);
  if (!gasPriceInWei) return BigInt(0);
  return gasPriceInWei * BigInt(gasLimit);
}
