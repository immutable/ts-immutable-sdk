import { BrowserProvider, parseUnits } from 'ethers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { WrappedBrowserProvider, TokenInfo } from '../types';
import { createExchangeInstance } from '../instance';
import { CheckoutConfiguration, getL2ChainId } from '../config';
import { SwapQuoteResult, SwapResult } from '../types/swap';
import { sendTransaction } from '../transaction/transaction';

const swapQuote = async (
  config: CheckoutConfiguration,
  provider: BrowserProvider,
  fromToken: TokenInfo,
  toToken: TokenInfo,
  fromAmount?: string,
  toAmount?: string,
  slippagePercent?: number,
  maxHops?: number,
  deadline?: number,
): Promise<SwapQuoteResult> => {
  if (!fromToken.address || fromToken.decimals === 0) {
    throw new CheckoutError(
      'fromToken address or decimals is missing.',
      CheckoutErrorType.MISSING_PARAMS,
    );
  }
  if (!toToken.address || toToken.decimals === 0) {
    throw new CheckoutError(
      'toToken address or decimals is missing.',
      CheckoutErrorType.MISSING_PARAMS,
    );
  }
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

  const address = await (await provider.getSigner()).getAddress();

  if (fromAmount) {
    return exchange.getUnsignedSwapTxFromAmountIn(
      address,
      fromToken.address as string,
      toToken.address as string,
      BigInt(parseUnits(fromAmount, fromToken.decimals)),
      slippagePercent,
      maxHops,
      deadline,
    );
  }
  return exchange.getUnsignedSwapTxFromAmountOut(
    address,
    fromToken.address as string,
    toToken.address as string,
    BigInt(parseUnits(toAmount!, toToken.decimals)),
    slippagePercent,
    maxHops,
    deadline,
  );
};

const swap = async (
  config: CheckoutConfiguration,
  provider: WrappedBrowserProvider,
  fromToken: TokenInfo,
  toToken: TokenInfo,
  fromAmount?: string,
  toAmount?: string,
  slippagePercent?: number,
  maxHops?: number,
  deadline?: number,
): Promise<SwapResult> => {
  const quoteResult = await swapQuote(
    config,
    provider,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    slippagePercent,
    maxHops,
    deadline,
  );
  if (quoteResult.approval) {
    const approvalTx = await sendTransaction(provider, quoteResult.approval.transaction);
    const receipt = await approvalTx.transactionResponse.wait();
    if (receipt?.status === 0) {
      throw new CheckoutError(
        'Approval transaction failed and was reverted',
        CheckoutErrorType.APPROVAL_TRANSACTION_FAILED,
      );
    }
  }
  const swapTx = await sendTransaction(provider, quoteResult.swap.transaction);
  const receipt = await swapTx.transactionResponse.wait();
  if (receipt?.status === 0) {
    throw new CheckoutError(
      'Swap transaction failed and was reverted',
      CheckoutErrorType.TRANSACTION_FAILED,
    );
  }
  return {
    swapReceipt: receipt,
    quote: quoteResult.quote,
    swap: quoteResult.swap,
  };
};

export { swapQuote, swap };
