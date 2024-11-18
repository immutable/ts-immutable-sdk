import {
  Exchange, TransactionResponse,
} from '@imtbl/dex-sdk';
import { parseUnits } from 'ethers';
import { NamedBrowserProvider, TokenInfo } from '@imtbl/checkout-sdk';

const fromAmountIn = async (
  exchange: Exchange,
  provider: NamedBrowserProvider,
  fromToken: TokenInfo,
  fromAmount: string,
  toToken: TokenInfo,
): Promise<TransactionResponse> => {
  const address = await (await provider.getSigner()).getAddress();
  return exchange.getUnsignedSwapTxFromAmountIn(
    address,
    fromToken.address as string,
    toToken.address as string,
    BigInt(parseUnits(fromAmount, fromToken.decimals)),
  );
};

const fromAmountOut = async (
  exchange: Exchange,
  provider: NamedBrowserProvider,
  toToken: TokenInfo,
  toAmount: string,
  fromToken: TokenInfo,
): Promise<TransactionResponse> => {
  const address = await (await provider.getSigner()).getAddress();
  return exchange.getUnsignedSwapTxFromAmountOut(
    address,
    fromToken.address as string,
    toToken.address as string,
    BigInt(parseUnits(toAmount, toToken.decimals)),
  );
};

export const quotesProcessor = {
  fromAmountIn,
  fromAmountOut,
};
