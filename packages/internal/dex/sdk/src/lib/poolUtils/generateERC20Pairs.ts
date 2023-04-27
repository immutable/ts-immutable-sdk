import { Token } from '@uniswap/sdk-core';

export type Provider = {
  chainId: number;
};

export type ERC20Pairs = ERC20Pair[];
export type ERC20Pair = [Token, Token];

// GenerateERC20Pairs will generate all possible ERC20 pair combinations, excluding duplicates
export const generateERC20Pairs = (
  erc20Pair: ERC20Pair,
  commonRoutingERC20s: Token[]
): ERC20Pairs => {
  // Make an array of all the erc20 addresses, removing any duplicates
  const uniqueERC20Addresses = new Set([...erc20Pair, ...commonRoutingERC20s]);
  const erc20Addresses = [...uniqueERC20Addresses];
  const erc20Pairs: ERC20Pairs = [];

  for (let i = 0; i < erc20Addresses.length; i++) {
    for (let j = i + 1; j < erc20Addresses.length; j++) {
      erc20Pairs.push([erc20Addresses[i], erc20Addresses[j]]);
    }
  }

  return erc20Pairs;
};
