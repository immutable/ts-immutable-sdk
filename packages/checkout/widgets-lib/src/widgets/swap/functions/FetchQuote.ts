import {
  Exchange, TransactionResponse,
} from '@imtbl/dex-sdk';
import { BigNumber, utils } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { TokenInfo } from '@imtbl/checkout-sdk';

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
    fromToken.address || '',
    toToken.address || '',
    BigNumber.from(utils.parseUnits(fromAmount, fromToken.decimals)),
  );
};

export const quotesProcessor = {
  fromAmountIn,
};
