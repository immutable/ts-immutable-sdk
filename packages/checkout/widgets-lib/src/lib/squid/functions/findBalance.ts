import { TokenBalance } from '@0xsquid/sdk/dist/types';

export const findBalance = (
  balances: TokenBalance[],
  address: string,
  chainId: string,
): TokenBalance | undefined => balances.find(
  (value) => value.address.toLowerCase() === address.toLowerCase()
        && value.chainId === chainId,
);
