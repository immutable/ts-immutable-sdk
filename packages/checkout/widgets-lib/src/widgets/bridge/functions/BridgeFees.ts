import { GasEstimateBridgeToL2Result } from '@imtbl/checkout-sdk';
import { formatUnits } from 'ethers';
import { calculateCryptoToFiat, tokenValueFormat } from '../../../lib/utils';
import { FormattedFee } from '../../swap/functions/swapFees';
import { CryptoFiatState } from '../../../context/crypto-fiat-context/CryptoFiatContext';

export const formatBridgeFees = (
  estimates: GasEstimateBridgeToL2Result | undefined,
  isDeposit: boolean,
  cryptoFiatState: CryptoFiatState,
  t,
): FormattedFee[] => {
  const fees: FormattedFee[] = [];
  if (!estimates?.fees || !estimates.token) return fees;

  let serviceFee = BigInt(0);
  if (estimates.fees.bridgeFee) serviceFee += estimates.fees.bridgeFee;
  if (estimates.fees.imtblFee) serviceFee += estimates.fees.imtblFee;
  if (serviceFee > 0) {
    fees.push({
      label: isDeposit
        ? t('drawers.feesBreakdown.fees.serviceFee.depositLabel')
        : t('drawers.feesBreakdown.fees.serviceFee.withdrawLabel'),
      fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${calculateCryptoToFiat(
        formatUnits(serviceFee, estimates.token.decimals),
        estimates.token.symbol,
        cryptoFiatState.conversions,
      )}`,
      amount: tokenValueFormat(formatUnits(serviceFee, estimates.token.decimals)),
      token: estimates.token,
    } as FormattedFee);
  }
  if (estimates.fees.sourceChainGas > 0) {
    const formattedGas = formatUnits(estimates.fees.sourceChainGas, estimates.token.decimals);
    fees.push({
      label: t('drawers.feesBreakdown.fees.gasFeeMove.label'),
      fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${calculateCryptoToFiat(
        formattedGas,
        estimates.token.symbol,
        cryptoFiatState.conversions,
      )}`,
      amount: `${tokenValueFormat(formattedGas)}`,
      prefix: '≈ ',
      token: estimates.token,
    } as FormattedFee);
  }
  if (estimates.fees.approvalFee > 0) {
    const formattedApprovalGas = formatUnits(estimates.fees.approvalFee, estimates.token.decimals);
    fees.push({
      label: t('drawers.feesBreakdown.fees.approvalFee.label'),
      fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${calculateCryptoToFiat(
        formattedApprovalGas,
        estimates.token.symbol,
        cryptoFiatState.conversions,
      )}`,
      amount: `${tokenValueFormat(formattedApprovalGas)}`,
      prefix: '≈ ',
      token: estimates.token,
    } as FormattedFee);
  }

  return fees;
};
