import { Pool } from '@uniswap/v3-sdk';
import * as Uniswap from '@uniswap/sdk-core';
import { ethers } from 'ethers';
import { ProviderCallError } from 'errors';
import { Amount, Coin, ERC20, Native } from 'types/private';
import { Amount as PublicAmount, Token } from 'types';

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

export const toBigNumber = (amount: Uniswap.CurrencyAmount<Uniswap.Token>): ethers.BigNumber => (
  ethers.BigNumber.from(amount.multiply(amount.decimalScale).toExact())
);

export const toAmount = (amount: Uniswap.CurrencyAmount<Uniswap.Token>): Amount<ERC20> => ({
  token: uniswapTokenToERC20(amount.currency),
  value: toBigNumber(amount),
});

export const toCurrencyAmount = (amount: Amount<ERC20>): Uniswap.CurrencyAmount<Uniswap.Token> => {
  const token = erc20ToUniswapToken(amount.token);
  return Uniswap.CurrencyAmount.fromRawAmount(token, amount.value.toString());
};

export const newAmount = <T extends Coin>(amount: ethers.BigNumber, token: T): Amount<T> => ({
  value: amount,
  token,
});

export const isERC20Amount = (amount: Amount<Coin>): amount is Amount<ERC20> => amount.token.type === 'erc20';
export const isNativeAmount = (amount: Amount<Coin>): amount is Amount<Native> => amount.token.type === 'native';

export const addERC20Amount = (a: Amount<ERC20>, b: Amount<ERC20>) => {
  // Make sure the ERC20s have the same address
  if (a.token.address !== b.token.address) throw new Error('Token mismatch: token addresses must be the same');
  return { value: a.value.add(b.value), token: a.token };
};

const addNativeAmount = (a: Amount<Native>, b: Amount<Native>) => ({
  value: a.value.add(b.value),
  token: a.token,
});

export const addAmount = <T extends Coin>(a: Amount<T>, b: Amount<T>) => {
  if (isERC20Amount(a) && isERC20Amount(b)) {
    return addERC20Amount(a, b);
  }

  if (isNativeAmount(a) && isNativeAmount(b)) {
    return addNativeAmount(a, b);
  }

  throw new Error('Token mismatch: token types must be the same');
};

export const subtractERC20Amount = (a: Amount<ERC20>, b: Amount<ERC20>) => {
  // Make sure the ERC20s have the same address
  if (a.token.address !== b.token.address) throw new Error('Token mismatch: token addresses must be the same');
  return { value: a.value.sub(b.value), token: a.token };
};

const subtractNativeAmount = (a: Amount<Native>, b: Amount<Native>) => ({
  value: a.value.sub(b.value),
  token: a.token,
});

export const subtractAmount = <T extends Coin>(a: Amount<T>, b: Amount<T>) => {
  if (isERC20Amount(a) && isERC20Amount(b)) {
    return subtractERC20Amount(a, b);
  }

  if (isNativeAmount(a) && isNativeAmount(b)) {
    return subtractNativeAmount(a, b);
  }

  throw new Error('Token mismatch: token types must be the same');
};

export const toNative = (token: Token): Native => {
  if (token.address) {
    throw new Error('native tokens must not have an address');
  }

  return {
    type: 'native',
    chainId: token.chainId,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  };
};

export const toERC20 = (token: Token): ERC20 => {
  if (!token.address) {
    throw new Error('ERC20 tokens must have an address');
  }
  return {
    type: 'erc20',
    address: token.address,
    chainId: token.chainId,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  };
};

/**
 * Converts our internal token type which could be ERC20 or Native
 * into a format consumable by Checkout. They require an address to be
 * present. We populate the address with empty string if it's Native.
 * If it's ERC20, we don't need to change it.
 */
export const toPublicTokenType = (token: Coin): Token => {
  if (token.type === 'native') {
    return {
      address: '',
      chainId: token.chainId,
      decimals: token.decimals,
      symbol: token.symbol,
      name: token.name,
    };
  }

  return token;
};

export const toPublicAmount = (amount: Amount<Coin>): PublicAmount => ({
  token: toPublicTokenType(amount.token),
  value: amount.value,
});
