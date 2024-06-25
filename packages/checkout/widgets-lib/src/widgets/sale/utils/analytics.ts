import { FundingItem, SalePaymentToken } from '@imtbl/checkout-sdk';
import { calculateCryptoToFiat } from '../../../lib/utils';

export const getPaymentTokenDetails = (
  fundingItem: FundingItem,
  conversions: Map<string, number>,
): SalePaymentToken => ({
  type: fundingItem.type,
  token: fundingItem.token,
  amount: fundingItem.fundsRequired.formattedAmount,
  balance: fundingItem.userBalance.formattedBalance,
  fiat: {
    symbol: 'USD',
    balance: calculateCryptoToFiat(
      fundingItem.userBalance.formattedBalance,
      fundingItem.token.symbol,
      conversions,
    ),
    amount: calculateCryptoToFiat(
      fundingItem.fundsRequired.formattedAmount,
      fundingItem.token.symbol,
      conversions,
    ),
  },
});
