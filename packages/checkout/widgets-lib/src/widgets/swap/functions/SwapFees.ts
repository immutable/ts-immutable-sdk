import { TransactionResponse } from '@imtbl/dex-sdk';
import { BigNumber, utils } from 'ethers';
import { calculateCryptoToFiat, tokenValueFormat } from '../../../lib/utils';
import { CryptoFiatState } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { DEFAULT_TOKEN_DECIMALS } from '../../../lib';

export const formatSwapFees = (
  quoteResult: TransactionResponse | undefined,
  cryptoFiatState: CryptoFiatState,
  t,
): any[] => {
  const fees: any[] = [];
  if (!quoteResult) return fees;

  if (quoteResult.quote?.fees?.length > 0) {
    const additionalFeeAmount = quoteResult.quote.fees.reduce((previous, currentFee) => {
      const previousFeeAmount = BigNumber.from(previous);
      const currentFeeAmount = BigNumber.from(currentFee.amount.value);
      return previousFeeAmount.add(currentFeeAmount);
    }, BigNumber.from(0));

    const feeToken = quoteResult.quote?.fees[0].amount.token;
    const additionalFeeValue = utils.formatUnits(
      additionalFeeAmount,
      feeToken?.decimals ?? DEFAULT_TOKEN_DECIMALS,
    );

    const additionalFeeFiatValue = calculateCryptoToFiat(
      additionalFeeValue,
      feeToken?.symbol || '',
      cryptoFiatState.conversions,
    );
    fees.push({
      label: t('drawers.feesBreakdown.fees.secondarySwapFee.label'),
      fiatAmount: `~ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${additionalFeeFiatValue}`,
      amount: tokenValueFormat(additionalFeeValue),
    });
  }

  const gasFeeEstimate = BigNumber.from(quoteResult.swap?.gasFeeEstimate?.value || 0);
  if (gasFeeEstimate.gt(0)) {
    const gasToken = quoteResult.swap.gasFeeEstimate?.token;
    const gasFeeValue = utils.formatUnits(
      gasFeeEstimate,
      gasToken?.decimals ?? DEFAULT_TOKEN_DECIMALS,
    );

    const gasFeeFiatValue = calculateCryptoToFiat(
      gasFeeValue,
      gasToken?.symbol || '',
      cryptoFiatState.conversions,
    );
    fees.push({
      label: t('drawers.feesBreakdown.fees.gasFeeSwap.label'),
      fiatAmount: `~ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${gasFeeFiatValue}`,
      amount: tokenValueFormat(gasFeeValue),
      prefix: '~',
    });
  }
  const gasFeeApprovalEstimate = BigNumber.from(quoteResult.approval?.gasFeeEstimate?.value || 0);
  if (gasFeeApprovalEstimate.gt(0)) {
    const gasToken = quoteResult.approval?.gasFeeEstimate?.token;
    const gasFeeApprovalValue = utils.formatUnits(
      gasFeeApprovalEstimate,
      gasToken?.decimals ?? DEFAULT_TOKEN_DECIMALS,
    );

    const gasFeeApprovalFiatValue = calculateCryptoToFiat(
      gasFeeApprovalValue,
      gasToken?.symbol || '',
      cryptoFiatState.conversions,
    );
    fees.push({
      label: t('drawers.feesBreakdown.fees.gasFeeApproval.label'),
      fiatAmount: `~ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${gasFeeApprovalFiatValue}`,
      amount: tokenValueFormat(gasFeeApprovalValue),
      prefix: '~',
    });
  }

  return fees;
};
