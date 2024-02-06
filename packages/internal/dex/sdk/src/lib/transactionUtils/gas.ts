import { AVERAGE_SECONDARY_FEE_EXTRA_GAS } from 'constants';
import { BigNumber, providers } from 'ethers';
import { newAmount } from 'lib';
import { CoinAmount, Native } from 'types';

type FeeData = {
  maxFeePerGas: BigNumber;
  maxPriorityFeePerGas: BigNumber;
  lastBaseFeePerGas: BigNumber;
};

interface Provider {
  getBlock(blockHashOrBlockTag: string): Promise<providers.Block>
  send(method: string, params: Array<any>): Promise<any>
}

const getFeeData = async (provider: Provider): Promise<FeeData> => {
  const [block, maxPriorityFeePerGas] = await Promise.all([
    provider.getBlock('latest'),
    provider.send('eth_maxPriorityFeePerGas', []) as Promise<BigNumber>,
  ]);

  if (!block.baseFeePerGas) throw new Error('Base fee per gas not found in block');

  return {
    // https://www.blocknative.com/blog/eip-1559-fees
    maxFeePerGas: block.baseFeePerGas.mul(2).add(maxPriorityFeePerGas),
    maxPriorityFeePerGas,
    lastBaseFeePerGas: block.baseFeePerGas,
  };
};

/**
 * Fetch the current gas price estimate. Supports both EIP-1559 and non-EIP1559 chains
 * @param {Provider} provider - The JSON RPC provider used to fetch fee data
 * @param {Native} nativeToken - The native token of the chain. Gas prices will be denominated in this token
 * @returns {CoinAmount<Native> | null} - The gas price in the smallest denomination of the chain's currency,
 *  or null if no gas price is available
 */
// eslint-disable-next-line max-len
export const fetchGasPrice = async (provider: Provider, nativeToken: Native): Promise<CoinAmount<Native> | null> => {
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
  gasEstimate: BigNumber,
): CoinAmount<Native> => {
  const baseGasFee = newAmount(gasEstimate.mul(gasPrice.value), gasPrice.token);
  if (!hasSecondaryFees) return baseGasFee;
  return newAmount(baseGasFee.value.add(gasEstimate.mul(AVERAGE_SECONDARY_FEE_EXTRA_GAS)), gasPrice.token);
  // eslint-disable-next-line implicit-arrow-linebreak
};
