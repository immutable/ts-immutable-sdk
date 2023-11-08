import {
  Exchange, TransactionResponse,
} from '@imtbl/dex-sdk';
import { BigNumber, utils } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { isNativeToken } from '../../../lib/utils';
import { NATIVE } from '../../../lib';

const fromAmountIn = async (
  exchange: Exchange,
  provider: Web3Provider,
  fromToken: TokenInfo,
  fromAmount: string,
  toToken: TokenInfo,
): Promise<TransactionResponse> => {
  const address = await provider.getSigner().getAddress();
  return exchange.getUnsignedSwapTxFromAmountIn(
    address,
    isNativeToken(fromToken.address) ? NATIVE : fromToken.address as string,
    isNativeToken(toToken.address) ? NATIVE : toToken.address as string,
    BigNumber.from(utils.parseUnits(fromAmount, fromToken.decimals)),
  );
};

const fromAmountOut = async (
  exchange: Exchange,
  provider: Web3Provider,
  toToken: TokenInfo,
  toAmount: string,
  fromToken: TokenInfo,
): Promise<TransactionResponse> => {
  const address = await provider.getSigner().getAddress();
  return exchange.getUnsignedSwapTxFromAmountOut(
    address,
    isNativeToken(fromToken.address) ? NATIVE : fromToken.address as string,
    isNativeToken(toToken.address) ? NATIVE : toToken.address as string,
    BigNumber.from(utils.parseUnits(toAmount, toToken.decimals)),
  );
};

export const quotesProcessor = {
  fromAmountIn,
  fromAmountOut,
};
