import { SalePaymentToken } from '@imtbl/checkout-sdk';
import { calculateCryptoToFiat } from '../../../lib/utils';
import { FundingBalance } from '../types';

export const getPaymentTokenDetails = (
  fundingBalance: FundingBalance,
  conversions: Map<string, number>,
): SalePaymentToken => {
  const { fundingItem } = fundingBalance;
  return ({
    settlementType: `${fundingBalance.type}`,
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
};
