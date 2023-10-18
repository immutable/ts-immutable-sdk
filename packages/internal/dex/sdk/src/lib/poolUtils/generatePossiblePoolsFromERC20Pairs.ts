import { FeeAmount } from '@uniswap/v3-sdk';
import { ERC20 } from 'types';
import { computePoolAddress } from './computePoolAddress';
import {
  generateERC20Pairs,
  ERC20Pair,
} from './generateERC20Pairs';

type PoolIDs = PoolID[];
type PoolID = {
  erc20Pair: ERC20Pair;
  fee: FeeAmount;
  poolAddress: string;
};

const poolFees = [
  FeeAmount.LOWEST,
  FeeAmount.LOW,
  FeeAmount.MEDIUM,
  FeeAmount.HIGH,
];

// generatePossiblePoolsFromERC20Pair will compute all possible pool combinations
// from the erc20Pair, commonRoutingERC20s and PoolFees
export const generatePossiblePoolsFromERC20Pair = (
  erc20Pair: ERC20Pair,
  commonRoutingERC20s: ERC20[],
  factoryAddress: string,
): PoolIDs => {
  const erc20Pairs = generateERC20Pairs(erc20Pair, commonRoutingERC20s);
  const poolIDs: PoolIDs = [];
  for (let i = 0; i < erc20Pairs.length; i++) {
    for (let j = 0; j < poolFees.length; j++) {
      // Compute the address of the pool using its unique identifier (tokenA, tokenB, fee)
      // Computing an address does not mean the pool is guaranteed to exist
      const poolAddress = computePoolAddress({
        factoryAddress,
        erc20Pair: erc20Pairs[i],
        fee: poolFees[j],
      });

      poolIDs.push({
        erc20Pair: erc20Pairs[i],
        fee: poolFees[j],
        poolAddress,
      });
    }
  }

  return poolIDs;
};
