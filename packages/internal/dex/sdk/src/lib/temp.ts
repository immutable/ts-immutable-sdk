import { Pool } from '@uniswap/v3-sdk';
import { ethers } from 'ethers';
import { getTokenAmounts } from './estimation';
import { convertTokenDecimalsToWei } from './utils';

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
  const x: ethers.BigNumber = convertTokenDecimalsToWei(
    amount0,
    pool.token0.decimals
  );
  const y: ethers.BigNumber = convertTokenDecimalsToWei(
    amount1,
    pool.token1.decimals
  );
  return [x, y];
}
