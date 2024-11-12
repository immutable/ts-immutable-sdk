import { JsonRpcProvider } from 'ethers';
import { newAmount } from '../utils';
import { CoinAmount, Native } from '../../types';
import { AVERAGE_SECONDARY_FEE_EXTRA_GAS } from '../../constants';

type FeeData = {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  lastBaseFeePerGas: bigint;
};

const getFeeData = async (provider: JsonRpcProvider): Promise<FeeData> => {
  const [block, maxPriorityFeePerGas] = await Promise.all([
    provider.getBlock('latest'),
    provider.send('eth_maxPriorityFeePerGas', []) as Promise<bigint>,
  ]);

  if (!block?.baseFeePerGas) throw new Error('Base fee per gas not found in block');

  return {
    // https://www.blocknative.com/blog/eip-1559-fees
    maxFeePerGas: block.baseFeePerGas * BigInt(2) + maxPriorityFeePerGas,
    maxPriorityFeePerGas,
    lastBaseFeePerGas: block.baseFeePerGas,
  };
};

/**
 * Fetch the current gas price estimate. Supports both EIP-1559 and non-EIP1559 chains
 * @param {JsonRpcProvider} provider - The JSON RPC provider used to fetch fee data
 * @param {Native} nativeToken - The native token of the chain. Gas prices will be denominated in this token
 * @returns {CoinAmount<Native> | null} - The gas price in the smallest denomination of the chain's currency,
 *  or null if no gas price is available
 */
// eslint-disable-next-line max-len
export const fetchGasPrice = async (provider: JsonRpcProvider, nativeToken: Native): Promise<CoinAmount<Native> | null> => {
  const feeData = await getFeeData(provider).catch(() => null);
  if (!feeData) return null;

  return newAmount(feeData.maxFeePerGas, nativeToken);
};

/**
 * Calculate the gas fee from the gas price and gas units used for the transaction
 *
 * @param {CoinAmount<Native>} gasPrice - The price of gas
 * @param {BigNumber} gasEstimate - The total gas units that will be used for the transaction
 * @returns - The cost of the transaction in the gas token's smallest denomination (e.g. WEI)
 */
export const calculateGasFee = (
  hasSecondaryFees: boolean,
  gasPrice: CoinAmount<Native>,
  gasEstimate: bigint,
): CoinAmount<Native> => {
  const baseGasFee = newAmount(gasEstimate * gasPrice.value, gasPrice.token);
  if (!hasSecondaryFees) return baseGasFee;
  return newAmount(baseGasFee.value + (gasPrice.value * BigInt(AVERAGE_SECONDARY_FEE_EXTRA_GAS)), gasPrice.token);
  // eslint-disable-next-line implicit-arrow-linebreak
};
