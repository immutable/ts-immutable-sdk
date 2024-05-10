import { TokenInfo } from '@imtbl/checkout-sdk';
import { TransactionResponse } from '@imtbl/dex-sdk';

/**
 * Ensures that the fees token has the correct symbol. At the moment the dex quote doesn't return it.
 * Assumes the fee token is the from token. If it's not, it will be incorrect.
 * TODO: Fix this when the canonical tokens list comes into play so we can look up the symbol based on address
 * @param fromToken Assumption is fees are delineated in this from token
 * @param currentQuote
 */
export const processSecondaryFees = (fromToken: TokenInfo, currentQuote: TransactionResponse) => {
  if (!currentQuote.quote.fees) return currentQuote;

  const adjustedFees = currentQuote.quote.fees.map((fee) => {
    if (fee.amount.token.symbol) return fee;

    return {
      ...fee,
      amount: {
        ...fee.amount,
        token: {
          ...fee.amount.token,
          symbol: (fromToken.address === fee.amount.token.address) ? fromToken.symbol : fee.amount.token.symbol,
        },
      },
    };
  });
  return { ...currentQuote, quote: { ...currentQuote.quote, fees: adjustedFees } };
};
