import { BigNumber } from 'ethers';
import { JsonRpcProvider, FeeData } from '@ethersproject/providers';
import { Amount, newAmount, TokenInfo } from 'lib';

type EIP1559FeeData = {
  maxFeePerGas: BigNumber;
  maxPriorityFeePerGas: BigNumber;
  lastBaseFeePerGas: BigNumber;
  gasPrice: null
};

/**
 * Determines whether or not the chain supports EIP-1559 by checking for the existence
 * of {@link FeeData.maxFeePerGas} and {@link FeeData.maxPriorityFeePerGas}
 *
 * @param {FeeData} fee - The fee data for the chain
 */
export const doesChainSupportEIP1559 = (fee: FeeData): fee is EIP1559FeeData => {
  const supportsEIP1559 = !!fee.maxFeePerGas && !!fee.maxPriorityFeePerGas;
  return supportsEIP1559;
};

/**
 * Fetch the current gas price estimate. Supports both EIP-1559 and non-EIP1559 chains
 * @param {JsonRpcProvider} provider - The JSON RPC provider used to fetch fee data
 * @returns {BigNumber | null} - The gas price in the smallest denomination of the chain's currency,
 * or null if no gas price is available
 */
export const fetchGasPrice = async (provider: JsonRpcProvider, nativeToken: TokenInfo): Promise<Amount | null> => {
  const feeData = await provider.getFeeData().catch(() => null);
  if (!feeData) return null;

  if (doesChainSupportEIP1559(feeData)) {
    return newAmount(feeData.maxFeePerGas.add(feeData.maxPriorityFeePerGas), nativeToken);
  }

  if (feeData.gasPrice) return newAmount(feeData.gasPrice, nativeToken);

  return null;
};

/**
 * Calculate the gas fee from the gas price and gas units used for the transaction
 *
 * @param {BigNumber} gasPriceInWei - The price of gas in wei
 * @param {BigNumber} gasUsed - The total gas units that will be used for the transaction
 * @returns - The cost of the transaction in the gas token's smallest denomination (e.g. WEI)
 */
const calculateGasFee2 = (gasPriceInWei: BigNumber, gasUsed: BigNumber): BigNumber => gasUsed.mul(gasPriceInWei);

export const calculateGasFee = (gasPrice: Amount, gasEstimate: BigNumber): Amount =>
  // eslint-disable-next-line implicit-arrow-linebreak
  newAmount(calculateGasFee2(gasPrice.value, gasEstimate), gasPrice.token);
