import { Pool } from '@uniswap/v3-sdk';
import * as Uniswap from '@uniswap/sdk-core';
import { ethers, getAddress, id, JsonRpcProvider, ZeroAddress } from 'ethers';
import { ProviderCallError } from '../errors';
import { Amount, Coin, CoinAmount, ERC20, Native, Token } from '../types';
import { DEFAULT_DEADLINE_SECONDS } from '../constants/router';

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
    poolA === poolB ||
    (poolA.token0.equals(poolB.token0) && poolA.token1.equals(poolB.token1) && poolA.fee === poolB.fee)
  );
}

export const decimalsFunctionSig = id('decimals()').substring(0, 10);

export async function getTokenDecimals(
  tokenAddress: string,
  provider: JsonRpcProvider,
  nativeToken: Coin,
): Promise<number> {
  if (tokenAddress === 'native') {
    return nativeToken.decimals;
  }

  try {
    const decimalsResult = await provider.call({
      to: tokenAddress,
      data: decimalsFunctionSig,
    });

    return parseInt(decimalsResult, 16);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown Error';
    throw new ProviderCallError(`failed to get ERC20 decimals: ${message}`);
  }
}

/**
 * Based on https://github.com/ethers-io/ethers.js/blob/main/src.ts/address/checks.ts#L51
 */
export function isValidNonZeroAddress(address: string): boolean {
  if (address === ZeroAddress) {
    return false;
  }

  try {
    getAddress(address);
    return true;
  } catch (error) {
    return false;
  }
}

export const isValidTokenLiteral = (address: string): boolean =>
  address === 'native' ? true : isValidNonZeroAddress(address);

export const erc20ToUniswapToken = (token: ERC20): Uniswap.Token =>
  // eslint-disable-next-line implicit-arrow-linebreak
  new Uniswap.Token(token.chainId, token.address, token.decimals, token.symbol, token.name);

export const uniswapTokenToERC20 = (token: Uniswap.Token): ERC20 => ({
  chainId: token.chainId,
  address: token.address,
  decimals: token.decimals,
  symbol: token.symbol,
  name: token.name,
  type: 'erc20',
});

export const toBigNumber = (amount: Uniswap.CurrencyAmount<Uniswap.Token>): bigint =>
  BigInt(amount.multiply(amount.decimalScale).toExact());

export const toAmount = (amount: Uniswap.CurrencyAmount<Uniswap.Token>): CoinAmount<ERC20> => ({
  token: uniswapTokenToERC20(amount.currency),
  value: toBigNumber(amount),
});

export const toCurrencyAmount = (amount: CoinAmount<ERC20>): Uniswap.CurrencyAmount<Uniswap.Token> => {
  const token = erc20ToUniswapToken(amount.token);
  return Uniswap.CurrencyAmount.fromRawAmount(token, amount.value.toString());
};

export const newAmount = <T extends Coin>(amount: bigint, token: T): CoinAmount<T> => ({
  value: amount,
  token,
});

export const isERC20Amount = (amount: CoinAmount<Coin>): amount is CoinAmount<ERC20> => amount.token.type === 'erc20';

export const isNativeAmount = (amount: CoinAmount<Coin>): amount is CoinAmount<Native> =>
  amount.token.type === 'native';

export const isNative = (token: Coin): token is Native => token.type === 'native';

export const addERC20Amount = (a: CoinAmount<ERC20>, b: CoinAmount<ERC20>) => {
  // Make sure the ERC20s have the same address
  if (a.token.address !== b.token.address) throw new Error('Token mismatch: token addresses must be the same');
  return { value: a.value + b.value, token: a.token };
};

const addNativeAmount = (a: CoinAmount<Native>, b: CoinAmount<Native>) => ({
  value: a.value + b.value,
  token: a.token,
});

export const addAmount = <T extends Coin>(a: CoinAmount<T>, b: CoinAmount<T>) => {
  if (isERC20Amount(a) && isERC20Amount(b)) {
    return addERC20Amount(a, b);
  }

  if (isNativeAmount(a) && isNativeAmount(b)) {
    return addNativeAmount(a, b);
  }

  throw new Error('Token mismatch: token types must be the same');
};

export const subtractERC20Amount = (a: CoinAmount<ERC20>, b: CoinAmount<ERC20>) => {
  // Make sure the ERC20s have the same address
  if (a.token.address !== b.token.address) throw new Error('Token mismatch: token addresses must be the same');
  return { value: a.value - b.value, token: a.token };
};

const subtractNativeAmount = (a: CoinAmount<Native>, b: CoinAmount<Native>) => ({
  value: a.value - b.value,
  token: a.token,
});

export const subtractAmount = <T extends Coin>(a: CoinAmount<T>, b: CoinAmount<T>) => {
  if (isERC20Amount(a) && isERC20Amount(b)) {
    return subtractERC20Amount(a, b);
  }

  if (isNativeAmount(a) && isNativeAmount(b)) {
    return subtractNativeAmount(a, b);
  }

  throw new Error('Token mismatch: token types must be the same');
};

/**
 * Converts our internal token type which could be ERC20 or Native
 * into a format consumable by Checkout. They require an address to be
 * present. We populate the address with the string 'native' if it's Native.
 * If it's ERC20, we don't need to change it.
 */
export const toPublicTokenType = (token: Coin): Token => {
  if (token.type === 'native') {
    return {
      address: 'native',
      chainId: token.chainId,
      decimals: token.decimals,
      symbol: token.symbol,
      name: token.name,
    };
  }

  return token;
};

export const toPublicAmount = (amount: CoinAmount<Coin>): Amount => ({
  token: toPublicTokenType(amount.token),
  value: amount.value,
});

export const getDefaultDeadlineSeconds = (): number => Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_SECONDS;
