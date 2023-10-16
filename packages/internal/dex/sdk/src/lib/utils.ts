/* eslint-disable max-len */
import { Pool } from '@uniswap/v3-sdk';
import { CurrencyAmount, Token } from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { ProviderCallError } from 'errors';
import {
  ERC20, ERC20Amount, Native, TokenAmount, TokenLiteral,
} from '../types';

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

export async function getTokenDecimals(
  tokenAddress: TokenLiteral,
  nativeToken: Native,
  provider: ethers.providers.JsonRpcProvider,
): Promise<number> {
  if (tokenAddress === 'native') {
    return nativeToken.decimals;
  }

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

export const tokenInfoToUniswapToken = (tokenInfo: ERC20): Token => new Token(
  tokenInfo.chainId,
  tokenInfo.address,
  tokenInfo.decimals,
  tokenInfo.symbol,
  tokenInfo.name,
);

export const uniswapTokenToTokenInfo = (token: Token): ERC20 => ({
  chainId: token.chainId,
  address: token.address,
  decimals: token.decimals,
  symbol: token.symbol,
  name: token.name,
});

export const toBigNumber = (amount: CurrencyAmount<Token>): ethers.BigNumber => (
  ethers.BigNumber.from(amount.multiply(amount.decimalScale).toExact())
);

export const toAmount = (amount: CurrencyAmount<Token>): ERC20Amount => ({
  token: uniswapTokenToTokenInfo(amount.currency),
  value: toBigNumber(amount),
});

export const toCurrencyAmount = (amount: ERC20Amount): CurrencyAmount<Token> => {
  const token = tokenInfoToUniswapToken(amount.token);
  return CurrencyAmount.fromRawAmount(token, amount.value.toString());
};

export const newAmount = <T extends ERC20 | Native>(amount: ethers.BigNumber, token: T): TokenAmount<T> => ({
  value: amount,
  token,
});

const isERC20 = (token: ERC20 | Native): token is ERC20 => ('address' in token);

export const addAmount = <T extends ERC20 | Native>(a: TokenAmount<T>, b: TokenAmount<T>) => {
  if (isERC20(a.token) && isERC20(b.token)) {
    // Make sure the ERC20s have the same address
    if (a.token.address !== b.token.address) throw new Error('Token mismatch: token addresses must be the same');
    return { value: a.value.add(b.value), token: a.token };
  }

  // Native tokens have no address so there is nothing to validate
  return { value: a.value.add(b.value), token: a.token };
};

export const subtractAmount = <T extends ERC20 | Native>(a: TokenAmount<T>, b: TokenAmount<T>) => {
  if (isERC20(a.token) && isERC20(b.token)) {
    // Make sure the ERC20s have the same address
    if (a.token.address !== b.token.address) throw new Error('Token mismatch: token addresses must be the same');
    return { value: a.value.sub(b.value), token: a.token };
  }

  // Native tokens have no address so there is nothing to validate
  return { value: a.value.sub(b.value), token: a.token };
};
