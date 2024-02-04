import { BigNumber, utils } from 'ethers';
import { GasEstimateBridgeToL2Result } from '@imtbl/checkout-sdk';
import { calculateCryptoToFiat, tokenValueFormat } from '../../../lib/utils';

export const formatBridgeFees = (estimates: GasEstimateBridgeToL2Result | undefined, cryptoFiatState, t): any[] => {
  const fees: any[] = [];
  if (!estimates?.fees || !estimates.token) return fees;

  let serviceFee = BigNumber.from(0);
  if (estimates.fees.bridgeFee) serviceFee = serviceFee.add(estimates.fees.bridgeFee);
  if (estimates.fees.imtblFee) serviceFee = serviceFee.add(estimates.fees.imtblFee);
  if (serviceFee.gt(0)) {
    fees.push({
      label: t('drawers.feesBreakdown.fees.serviceFee.label'),
      fiatAmount: `~ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${calculateCryptoToFiat(
        utils.formatUnits(serviceFee, estimates.token.decimals),
        estimates.token.symbol,
        cryptoFiatState.conversions,
      )}`,
      amount: tokenValueFormat(utils.formatUnits(serviceFee, estimates.token.decimals)),
    });
  }
  if (estimates.fees.sourceChainGas?.gt(0)) {
    const formattedGas = utils.formatUnits(estimates.fees.sourceChainGas, estimates.token.decimals);
    fees.push({
      label: t('drawers.feesBreakdown.fees.gasFeeMove.label'),
      fiatAmount: `~ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${calculateCryptoToFiat(
        formattedGas,
        estimates.token.symbol,
        cryptoFiatState.conversions,
      )}`,
      amount: `${tokenValueFormat(formattedGas)}`,
    });
  }
  if (estimates.fees.approvalFee?.gt(0)) {
    const formattedApprovalGas = utils.formatUnits(estimates.fees.approvalFee, estimates.token.decimals);
    fees.push({
      label: t('drawers.feesBreakdown.fees.gasFeeApproval.label'),
      fiatAmount: `~ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${calculateCryptoToFiat(
        formattedApprovalGas,
        estimates.token.symbol,
        cryptoFiatState.conversions,
      )}`,
      amount: `${tokenValueFormat(formattedApprovalGas)}`,
    });
  }

  return fees;
};
