import { ChainId, type TokenInfo } from '@imtbl/checkout-sdk';
import { Token } from './types';
import { SQUID_NATIVE_TOKEN } from './config';

export function convertToUsd(
  tokens: Token[] | null,
  amount: string,
  token: TokenInfo | undefined,
): number {
  if (!tokens || !amount || !token?.address) {
    return 0;
  }

  const address = token.address === 'native' ? SQUID_NATIVE_TOKEN : token.address;

  const toToken = tokens.find(
    (value) => value.address.toLowerCase() === address.toLowerCase()
      && value.chainId === ChainId.IMTBL_ZKEVM_MAINNET.toString(),
  );

  if (!toToken) {
    return 0;
  }

  return Number(amount) * toToken.usdPrice;
}
