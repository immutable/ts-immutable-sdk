import { Pool } from '@uniswap/v3-sdk';
import { BigNumber } from 'ethers';
import { ProviderCallError } from 'errors';
import { erc20ToUniswapToken } from 'lib/utils';
import { ERC20 } from 'types';
import { MulticallResponse, multicallContracts } from '../multicall';
import { generatePossiblePoolsFromERC20Pair } from './generatePossiblePoolsFromERC20Pairs';
import { ERC20Pair } from './generateERC20Pairs';
import { Multicall, UniswapV3Pool__factory } from '../../contracts/types';
import { UniswapV3PoolInterface } from '../../contracts/types/UniswapV3Pool';

export type Slot0 = {
  sqrtPriceX96: BigNumber;
  tick: number;

  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
};

const poolInterface = UniswapV3Pool__factory.createInterface();
const slot0FuncString = 'slot0';
const liquidityFuncString = 'liquidity';
const slot0CallData = poolInterface.encodeFunctionData(slot0FuncString);
const liquidityCallData = poolInterface.encodeFunctionData(liquidityFuncString);

const noDataResult = '0x';

// TODO: Split into fetchPools and filterPools methods
// in order to allow for better error handling/separation of concerns
export const fetchValidPools = async (
  multicallContract: Multicall,
  erc20Pair: ERC20Pair,
  commonRoutingERC20s: ERC20[],
  factoryAddress: string,
): Promise<Pool[]> => {
  const poolIDs = generatePossiblePoolsFromERC20Pair(
    erc20Pair,
    commonRoutingERC20s,
    factoryAddress,
  );
  const poolAddresses = poolIDs.map((pool) => pool.poolAddress);

  // The multicall contract returns data in the same order as the given pool addresses
  // Indexes of pool addresses will map to the indexes of the results
  let slot0Results: MulticallResponse;
  let liquidityResults: MulticallResponse;
  try {
    [slot0Results, liquidityResults] = await Promise.all([
      multicallContracts(
        multicallContract,
        slot0CallData,
        poolAddresses,
      ),
      multicallContracts(
        multicallContract,
        liquidityCallData,
        poolAddresses,
      ),
    ]);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown Error';
    throw new ProviderCallError(`failed multicall: ${message}`);
  }

  const slot0s = slot0Results.returnData;
  const liquidities = liquidityResults.returnData;

  const uniswapV3Pool: UniswapV3PoolInterface = UniswapV3Pool__factory.createInterface();

  const validPools: Pool[] = [];
  poolIDs.forEach((poolID, index) => {
    const noPriceResult = slot0Results.returnData[index].returnData === noDataResult;
    const noLiquidityResult = liquidityResults.returnData[index].returnData === noDataResult;

    // This indicates that the pool doesn't exist
    if (noPriceResult || noLiquidityResult) {
      return;
    }

    const poolSlot0 = uniswapV3Pool.decodeFunctionResult(
      slot0FuncString,
      slot0s[index].returnData,
    ) as unknown as Slot0;

    const poolLiquidity = uniswapV3Pool.decodeFunctionResult(
      liquidityFuncString,
      liquidities[index].returnData,
    ) as [BigNumber];

    const zeroPrice = poolSlot0.sqrtPriceX96.isZero();
    const zeroLiquidity = poolLiquidity[0].isZero();

    // If there is no price or no liquidity in the pool then we do not want to consider
    // it for swapping
    if (zeroPrice || zeroLiquidity) {
      return;
    }

    const validPool = new Pool(
      erc20ToUniswapToken(poolID.erc20Pair[0]),
      erc20ToUniswapToken(poolID.erc20Pair[1]),
      poolID.fee,
      poolSlot0.sqrtPriceX96.toString(),
      poolLiquidity.toString(),
      poolSlot0.tick,
    );
    validPools.push(validPool);
  });

  return validPools;
};
