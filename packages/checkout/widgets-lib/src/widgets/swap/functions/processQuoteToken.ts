import { TokenInfo } from '@imtbl/checkout-sdk';
import { TransactionResponse } from '@imtbl/dex-sdk';

/**
 * Ensures that the quote token has the correct symbol. At the moment the dex quote doesn't return it.
 * @param toToken
 * @param currentQuote
 */
export const processQuoteToken = (toToken: TokenInfo, currentQuote: TransactionResponse) => {
  if (!currentQuote.quote.amount && !currentQuote.quote.amountWithMaxSlippage) return currentQuote;

  const adjustedAmount = {
    ...currentQuote.quote.amount,
    token: {
      ...currentQuote.quote.amount.token,
      symbol: (toToken.address === currentQuote.quote.amount.token.address)
        ? toToken.symbol : currentQuote.quote.amount.token.symbol,
    },
  };

  const adjustedAmountWithMaxSlippage = {
    ...currentQuote.quote.amountWithMaxSlippage,
    token: {
      ...currentQuote.quote.amountWithMaxSlippage.token,
      symbol: (toToken.address === currentQuote.quote.amountWithMaxSlippage.token.address)
        ? toToken.symbol : currentQuote.quote.amountWithMaxSlippage.token.symbol,
    },
  };
  return {
    ...currentQuote,
    quote: {
      ...currentQuote.quote,
      amount: adjustedAmount,
      amountWithMaxSlippage: adjustedAmountWithMaxSlippage,
    },
  };
};
