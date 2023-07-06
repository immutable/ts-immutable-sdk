import { TokenInfo } from 'types';

export type Provider = {
  chainId: number;
};

export type ERC20Pairs = ERC20Pair[];
export type ERC20Pair = [TokenInfo, TokenInfo];

// GenerateERC20Pairs will generate all possible ERC20 pair combinations, excluding duplicates
export const generateERC20Pairs = (
  erc20Pair: ERC20Pair,
  commonRoutingERC20s: TokenInfo[],
): ERC20Pairs => {
  const contractAddressMap = new Map<string, TokenInfo>();
  const contractAddresses: string[] = [];
  [...erc20Pair, ...commonRoutingERC20s].forEach((erc20) => {
    contractAddressMap.set(erc20.address, erc20);
    contractAddresses.push(erc20.address);
  });

  const uniqueERC20Addresses = new Set([...contractAddresses]);
  const erc20Addresses = [...uniqueERC20Addresses];
  const erc20Pairs: ERC20Pairs = [];

  for (let i = 0; i < erc20Addresses.length; i++) {
    for (let j = i + 1; j < erc20Addresses.length; j++) {
      const firstToken = contractAddressMap.get(erc20Addresses[i]);
      const secondToken = contractAddressMap.get(erc20Addresses[j]);
      if (firstToken && secondToken) {
        erc20Pairs.push([firstToken, secondToken]);
      }
    }
  }

  return erc20Pairs;
};
