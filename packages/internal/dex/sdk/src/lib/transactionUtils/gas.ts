import { BigNumber, utils } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';

const imxDecimals = 18; // TODO: Use an Amount so that we have the decimals available for calcs

/**
 * Fetch the current gas price estimate. Supports both EIP-1559 and non-EIP1559 chains
 * @param {JsonRpcProvider} provider - The JSON RPC provider used to fetch fee data
 * @returns {BigNumber | null} - The gas price in the smallest denomination of the chain's currency,
 * or null if no gas price is available
 */
export const fetchGasPrice = async (provider: JsonRpcProvider): Promise<BigNumber | null> => {
  try {
    const feeData = await provider.getFeeData();
    if (!feeData) {
      return null;
    }

    // use maxFeePerGas + maxPriorityFeePerGas if the chain supports EIP-1559, otherwise use gasPrice instead
    return feeData.maxFeePerGas && feeData.maxPriorityFeePerGas
      ? feeData.maxFeePerGas?.add(feeData.maxPriorityFeePerGas)
      : feeData.gasPrice;
  } catch (e) {
    // unable to retrieve gas fee data
    return null;
  }
};

/**
 * Calculate the gas fee from the gas price and gas units used for the transaction
 *
 * @param {BigNumber} gasPriceInWei - The price of gas in wei
 * @param {BigNumber} gasUsed - The total gas units that will be used for the transaction
 * @returns - The face value of the token as a string. e.g. wei / 10^18
 */
export const calculateGasFee = (gasPriceInWei: BigNumber, gasUsed: BigNumber): string => {
  const totalGasFee = gasUsed.mul(gasPriceInWei);
  return utils.formatUnits(totalGasFee, imxDecimals);
};
