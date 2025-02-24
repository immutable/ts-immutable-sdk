import { Fee, FundingStepType, TokenInfo } from '@imtbl/checkout-sdk';
import { TFunction } from 'i18next';
import { formatUnits } from 'ethers';
import {
  calculateCryptoToFiat,
  abbreviateWalletAddress,
  tokenValueFormat,
} from '../../../lib/utils';
import { FormattedFee } from '../../swap/functions/swapFees';
import { FundingBalance } from '../types';

export type FeesBySymbol = Record<string, Fee>;

const getTotalFeesBySymbol = (
  fees: Fee[],
  tokenInfo?: TokenInfo,
): FeesBySymbol => fees
  .filter((fee) => fee.amount > 0 && fee.token)
  .reduce((acc, fee) => {
    if (!fee.token) return acc;

    const token: TokenInfo = {
      ...fee.token,
      address: fee.token.address || '',
      symbol: fee.token.symbol || tokenInfo?.symbol || '',
    };

    const address = abbreviateWalletAddress(
      token.address!,
      '...',
    ).toLowerCase();
    const key = token.symbol || address;
    if (!key) return acc;

    if (acc[key]) {
      const newAmount = acc[key].amount + fee.amount;
      return {
        ...acc,
        [key]: {
          ...acc[key],
          amount: newAmount,
          formattedAmount: formatUnits(newAmount, token.decimals),
        },
      };
    }

    if (key) {
      return {
        ...acc,
        [key]: {
          ...fee,
          token,
          formattedAmount: formatUnits(fee.amount, token.decimals),
        },
      };
    }

    return acc;
  }, {} as FeesBySymbol);

export const getFundingBalanceTotalFees = (
  balance: FundingBalance,
): FeesBySymbol => {
  if (balance.type !== FundingStepType.SWAP) {
    return {};
  }

  const fees = [
    balance.fees.approvalGasFee,
    balance.fees.swapGasFee,
    ...balance.fees.swapFees,
  ];
  const totalFees = getTotalFeesBySymbol(fees, balance.fundingItem.token);

  return totalFees;
};

export const getFundingBalanceFeeBreakDown = (
  balance: FundingBalance,
  conversions: Map<string, number>,
  t: TFunction,
): FormattedFee[] => {
  const feesBreakdown: FormattedFee[] = [];

  if (balance.type !== FundingStepType.SWAP) {
    return [];
  }

  const addFee = (fee: Fee, label: string, prefix: string = '~ ') => {
    if (fee.amount > 0) {
      const formattedFee = formatUnits(fee.amount, fee?.token?.decimals);

      feesBreakdown.push({
        label,
        fiatAmount: `≈ ${t(
          'drawers.feesBreakdown.fees.fiatPricePrefix',
        )}${calculateCryptoToFiat(
          formattedFee,
          fee.token?.symbol || '',
          conversions,
          '-.--',
          4,
        )}`,
        amount: `${tokenValueFormat(formattedFee)}`,
        prefix,
        token: fee?.token!,
      });
    }
  };

  // Format gas fee
  addFee(
    balance.fees.swapGasFee,
    t('drawers.feesBreakdown.fees.swapGasFee.label'),
  );

  // Format gas fee approval
  addFee(
    balance.fees.approvalGasFee,
    t('drawers.feesBreakdown.fees.approvalFee.label'),
  );

  // Format the secondary fees
  const totalSwapFeesBySymbol = Object.entries(
    getTotalFeesBySymbol(balance.fees.swapFees, balance.fundingItem.token),
  );

  totalSwapFeesBySymbol.forEach(([, swapFee]) => {
    const basisPoints: number = swapFee?.basisPoints ?? 0;
    addFee(
      swapFee,
      t('drawers.feesBreakdown.fees.swapSecondaryFee.label', {
        amount: basisPoints ? `${basisPoints / 100}%` : '',
      }),
      '',
    );
  });

  return feesBreakdown;
};
