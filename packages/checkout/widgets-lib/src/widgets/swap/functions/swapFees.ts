import { Amount, Token, TransactionResponse } from '@imtbl/dex-sdk';
import { TFunction } from 'i18next';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { CryptoFiatState } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { calculateCryptoToFiat, tokenValueFormat } from '../../../lib/utils';
import { formatUnits } from 'ethers';

export type FormattedFee = {
  label: string;
  fiatAmount: string;
  amount: string;
  prefix?: string;
  token: Token | TokenInfo;
};

/**
 * Formats a quote into a list of fees for the fee drawer
 * @param swapQuote
 * @param cryptoFiatState
 * @param t
 */
export const formatSwapFees = (
  swapQuote: TransactionResponse,
  cryptoFiatState: CryptoFiatState,
  t: TFunction,
): FormattedFee[] => {
  const fees: FormattedFee[] = [];
  if (!swapQuote.swap) return fees;

  const addFee = (estimate: Amount | undefined, label: string, prefix: string = '≈ ') => {
    const value = BigInt(estimate?.value ?? 0);
    if (estimate && value > 0) {
      const formattedFee = formatUnits(value, estimate.token.decimals);
      fees.push({
        label,
        fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${calculateCryptoToFiat(
          formattedFee,
          estimate.token.symbol || '',
          cryptoFiatState.conversions,
        )}`,
        amount: `${tokenValueFormat(formattedFee)}`,
        prefix,
        token: estimate.token,
      });
    }
  };

  // Format gas fee
  if (swapQuote.swap && swapQuote.swap.gasFeeEstimate) {
    addFee(swapQuote.swap.gasFeeEstimate, t('drawers.feesBreakdown.fees.swapGasFee.label'));
  }

  // Format gas fee approval
  if (swapQuote.approval && swapQuote.approval.gasFeeEstimate) {
    addFee(swapQuote.approval.gasFeeEstimate, t('drawers.feesBreakdown.fees.approvalFee.label'));
  }

  // Format the secondary fees
  swapQuote.quote?.fees?.forEach((fee) => {
    addFee(
      fee.amount,
      t('drawers.feesBreakdown.fees.swapSecondaryFee.label', { amount: `${(fee.basisPoints / 100)}%` }),
      '',
    );
  });

  return fees;
};
