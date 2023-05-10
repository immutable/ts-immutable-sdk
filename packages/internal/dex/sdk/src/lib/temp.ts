import { Pool } from '@uniswap/v3-sdk';
import { ethers } from 'ethers';
import { getTokenAmounts } from './estimation';

export function getXAndY(pool: Pool): [ethers.BigNumber, ethers.BigNumber] {
  let sqrtRatioX96 = pool.sqrtRatioX96;
  let liquidity = pool.liquidity;

  const MIN_TICK = -887272;
  const MAX_TICK = 887272;
  const [amount0, amount1, ,] = getTokenAmounts(
    liquidity,
    sqrtRatioX96,
    MIN_TICK,
    MAX_TICK,
    pool.token0.decimals,
    pool.token1.decimals
  );
  const x: ethers.BigNumber = amount0;
  const y: ethers.BigNumber = amount1;
  return [x, y];
}
