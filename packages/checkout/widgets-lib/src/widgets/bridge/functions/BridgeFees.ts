import { BigNumber, utils } from 'ethers';
import { GasEstimateBridgeToL2Result } from '@imtbl/checkout-sdk';
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

  let serviceFee = BigNumber.from(0);
  if (estimates.fees.bridgeFee) serviceFee = serviceFee.add(estimates.fees.bridgeFee);
  if (estimates.fees.imtblFee) serviceFee = serviceFee.add(estimates.fees.imtblFee);
  if (serviceFee.gt(0)) {
    fees.push({
      label: isDeposit
        ? t('drawers.feesBreakdown.fees.serviceFee.depositLabel')
        : t('drawers.feesBreakdown.fees.serviceFee.withdrawLabel'),
      fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${calculateCryptoToFiat(
        utils.formatUnits(serviceFee, estimates.token.decimals),
        estimates.token.symbol,
        cryptoFiatState.conversions,
      )}`,
      amount: tokenValueFormat(utils.formatUnits(serviceFee, estimates.token.decimals)),
      token: estimates.token,
    } as FormattedFee);
  }
  if (estimates.fees.sourceChainGas?.gt(0)) {
    const formattedGas = utils.formatUnits(estimates.fees.sourceChainGas, estimates.token.decimals);
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
  if (estimates.fees.approvalFee?.gt(0)) {
    const formattedApprovalGas = utils.formatUnits(estimates.fees.approvalFee, estimates.token.decimals);
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
