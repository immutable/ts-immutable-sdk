import { RouteResponse } from '@0xsquid/squid-types';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FeesBreakdown } from '../../../components/FeesBreakdown/FeesBreakdown';
import { FormattedFee } from '../../swap/functions/swapFees';
import {
  getFormattedNumber,
  getFormattedAmounts,
} from '../functions/getFormattedNumber';

export type RouteFeesProps = {
  visible: boolean;
  onClose: () => void;
  routeData: RouteResponse | undefined;
  totalAmount: number;
  totalFiatAmount: number;
};

export function RouteFees({
  visible,
  onClose,
  routeData,
  totalAmount,
  totalFiatAmount,
}: RouteFeesProps) {
  const { t } = useTranslation();

  const feeCosts = useMemo<FormattedFee[]>(
    () => routeData?.route.estimate.feeCosts.map((fee) => ({
      label: fee.name,
      amount: getFormattedNumber(fee.amount, fee.token.decimals),
      fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${getFormattedAmounts(fee.amountUsd)}`,
      token: {
        name: fee.token.name,
        symbol: fee.token.symbol,
        decimals: fee.token.decimals,
        address: fee.token.address,
        icon: fee.token.logoURI,
      },
      prefix: '',
    })) ?? [],
    [routeData],
  );

  const gasCosts = useMemo<FormattedFee[]>(
    () => routeData?.route.estimate.gasCosts.map((fee) => ({
      label: 'Gas (transaction)',
      amount: getFormattedNumber(fee.amount, fee.token.decimals),
      fiatAmount: `≈ ${t('drawers.feesBreakdown.fees.fiatPricePrefix')}${getFormattedAmounts(fee.amountUsd)}`,
      token: {
        name: fee.token.name,
        symbol: fee.token.symbol,
        decimals: fee.token.decimals,
        address: fee.token.address,
        icon: fee.token.logoURI,
      },
      prefix: '',
    })) ?? [],
    [routeData],
  );

  const feesToken = routeData?.route.estimate.feeCosts?.[0]?.token
    || routeData?.route.estimate.gasCosts?.[0]?.token;

  if (!feesToken) {
    return null;
  }

  const tokenSymbol = feesToken?.symbol || '';
  return (
    <FeesBreakdown
      visible={visible}
      loading={!routeData}
      fees={[...feeCosts, ...gasCosts]}
      tokenSymbol={tokenSymbol}
      totalAmount={getFormattedNumber(totalAmount, feesToken?.decimals)}
      totalFiatAmount={getFormattedAmounts(totalFiatAmount)}
      onCloseDrawer={onClose}
    />
  );
}
