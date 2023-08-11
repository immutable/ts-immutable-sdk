import { Pool } from '@uniswap/v3-sdk';
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { ProviderCallError } from 'errors';
import { Amount, TokenInfo } from '../types';

export const quoteReturnMapping: { [signature: string]: string[] } = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '0xcdca1753': ['uint256', 'uint160[]', 'uint32[]', 'uint256'],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '0xc6a5026a': ['uint256', 'uint160', 'uint32', 'uint256'],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '0x2f80bb1d': ['uint256', 'uint160[]', 'uint32[]', 'uint256'],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '0xbd21704a': ['uint256', 'uint160', 'uint32', 'uint256'],
};

/**
 * Returns true if poolA is equivalent to poolB
 * @param poolA one of the two pools
 * @param poolB the other pool
 */
export function poolEquals(poolA: Pool, poolB: Pool): boolean {
  return (
    poolA === poolB
    || (poolA.token0.equals(poolB.token0)
      && poolA.token1.equals(poolB.token1)
      && poolA.fee === poolB.fee)
  );
}

export async function getERC20Decimals(
  tokenAddress: string,
  provider: ethers.providers.JsonRpcProvider,
): Promise<number> {
  const decimalsFunctionSig = ethers.utils.id('decimals()').substring(0, 10);

  try {
    const decimalsResult = await provider.call({
      to: tokenAddress,
      data: decimalsFunctionSig,
    });

    return parseInt(
      decimalsResult,
      16,
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown Error';
    throw new ProviderCallError(`failed to get ERC20 decimals: ${message}`);
  }
}

/**
 * Based on https://github.com/ethers-io/ethers.js/blob/main/src.ts/address/checks.ts#L51
 */
export function isValidNonZeroAddress(address: string): boolean {
  if (address === ethers.constants.AddressZero) {
    return false;
  }

  try {
    ethers.utils.getAddress(address);
    return true;
  } catch (error) {
    return false;
  }
}

export const tokenInfoToUniswapToken = (tokenInfo: TokenInfo): Token => new Token(
  tokenInfo.chainId,
  tokenInfo.address,
  tokenInfo.decimals,
  tokenInfo.symbol,
  tokenInfo.name,
);

export const uniswapTokenToTokenInfo = (token: Token): TokenInfo => ({
  chainId: token.chainId,
  address: token.address,
  decimals: token.decimals,
  symbol: token.symbol,
  name: token.name,
});

export const toBigNumber = (amount: CurrencyAmount<Currency>): ethers.BigNumber => (
  ethers.BigNumber.from(amount.multiply(amount.decimalScale).toExact())
);

export const newAmount = (amount: ethers.BigNumber, token: TokenInfo): Amount => ({
  value: amount,
  token,
});
