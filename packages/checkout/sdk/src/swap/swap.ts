import { BigNumber, utils } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { TokenInfo } from '../types';
import { createExchangeInstance } from '../instance';
import { CheckoutConfiguration, getL2ChainId } from '../config';
import { SwapResult } from '../types/swap';

const swap = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  fromToken: TokenInfo,
  toToken: TokenInfo,
  fromAmount?: string,
  toAmount?: string,
): Promise<SwapResult> => {
  if (fromAmount && toAmount) {
    throw new CheckoutError(
      'Only one of fromAmount or toAmount can be provided.',
      CheckoutErrorType.MISSING_PARAMS,
    );
  }
  if (!fromAmount && !toAmount) {
    throw new CheckoutError(
      'fromAmount or toAmount must be provided.',
      CheckoutErrorType.MISSING_PARAMS,
    );
  }
  const chainId = getL2ChainId(config);
  const exchange = await createExchangeInstance(chainId, config);

  const address = await provider.getSigner().getAddress();

  if (fromAmount) {
    return exchange.getUnsignedSwapTxFromAmountIn(
      address,
      fromToken.address as string,
      toToken.address as string,
      BigNumber.from(utils.parseUnits(fromAmount, fromToken.decimals)),
    );
  }
  return exchange.getUnsignedSwapTxFromAmountOut(
    address,
    fromToken.address as string,
    toToken.address as string,
    BigNumber.from(utils.parseUnits(toAmount!, toToken.decimals)),
  );
};

export { swap };
