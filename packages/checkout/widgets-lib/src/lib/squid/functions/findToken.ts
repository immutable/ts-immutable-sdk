import { Token } from '../types';

export const findToken = (
  tokens: Token[],
  address: string,
  chainId: string,
): Token | undefined => tokens.find(
  (value) => value.address.toLowerCase() === address.toLowerCase()
        && value.chainId === chainId,
);
