import { Pool } from '@uniswap/v3-sdk';
import * as Uniswap from '@uniswap/sdk-core';
import { BigNumber, ethers } from 'ethers';
import { ProviderCallError } from 'errors';
import { CurrencyAmount, Token } from 'types/amount';

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

export const tokenInfoToUniswapToken = (tokenInfo: Token): Uniswap.Token => new Uniswap.Token(
  tokenInfo.chainId,
  tokenInfo.address,
  tokenInfo.decimals,
  tokenInfo.symbol,
  tokenInfo.name,
);

export const toAmount = (amount: Uniswap.CurrencyAmount<Uniswap.Token>): CurrencyAmount<Token> => {
  const token = new Token(
    amount.currency.chainId,
    amount.currency.address,
    amount.currency.decimals,
    amount.currency.symbol,
    amount.currency.name,
  );
  return new CurrencyAmount(token, BigNumber.from(amount.toExact()));
};

export const toCurrencyAmount = (amount: CurrencyAmount<Token>): Uniswap.CurrencyAmount<Uniswap.Token> => {
  const token = tokenInfoToUniswapToken(amount.currency);
  return Uniswap.CurrencyAmount.fromRawAmount(token, amount.value.toString());
};
