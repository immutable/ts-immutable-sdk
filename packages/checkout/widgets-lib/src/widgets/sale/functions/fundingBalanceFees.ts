import { utils } from 'ethers';
import { Fee, FundingStepType, TokenInfo } from '@imtbl/checkout-sdk';
import {
  calculateCryptoToFiat,
  abbreviateWalletAddress,
  tokenValueFormat,
} from 'lib/utils';
import { FormattedFee } from 'widgets/swap/functions/swapFees';
import { FundingBalance } from '../types';

const getTotalFeesBySymbol = (
  fees: Fee[],
  tokenInfo?: TokenInfo,
): FeesBySymbol => fees
  .filter((fee) => fee.amount.gt(0) && fee.token)
  .reduce((acc, fee) => {
    if (!fee.token) return acc;

    const token: TokenInfo = {
      ...fee.token,
      address: fee.token.address || '',
      symbol: fee.token.symbol || tokenInfo?.symbol || '',
    };

    const address = abbreviateWalletAddress(token.address!, '...').toLowerCase();
    const key = token.symbol || address;
    if (!key) return acc;

    if (acc[key]) {
      const newAmount = acc[key].amount.add(fee.amount);
      return {
        ...acc,
        [key]: {
          ...acc[key],
          amount: newAmount,
          formattedAmount: utils.formatUnits(newAmount, token.decimals),
        },
      };
    }

    if (key) {
      return {
        ...acc,
        [key]: {
          ...fee,
          token,
          formattedAmount: utils.formatUnits(fee.amount, token.decimals),
        },
      };
    }

    return acc;
  }, {} as FeesBySymbol);

export type FeesBySymbol = Record<string, Fee>;
export const getFundingBalanceTotalFees = (
  balance: FundingBalance,
): FeesBySymbol => {
  let fees: Fee[] = [];
  if (balance.type === FundingStepType.SWAP) {
    fees = [
      balance.fees.approvalGasFee,
      balance.fees.swapGasFee,
      ...balance.fees.swapFees,
    ];
  }

  const totalFees = getTotalFeesBySymbol(fees, balance.fundingItem.token);

  return totalFees;
};

export const getFundingBalanceFeeBreakDown = (
  balance: FundingBalance,
  conversions: Map<string, number>,
): FormattedFee[] => {
  const feesBreakdown: FormattedFee[] = [];

  if (balance.type !== FundingStepType.SWAP) {
    return [];
  }

  const { fees } = balance;

  if (fees.approvalGasFee.amount.gt(0)) {
    const formattedApprovalGas = utils.formatUnits(
      fees.approvalGasFee.amount,
      fees.approvalGasFee?.token?.decimals,
    );
    feesBreakdown.push({
      label: 'Approval Gas Fee',
      fiatAmount: `≈ USD $${calculateCryptoToFiat(
        formattedApprovalGas,
        fees.approvalGasFee.token?.symbol || '',
        conversions,
        '-.--',
        4,
      )}`,
      amount: `${tokenValueFormat(formattedApprovalGas)}`,
      prefix: '~ ',
      token: fees.approvalGasFee.token!,
    });
  }

  if (fees.swapGasFee.amount.gt(0)) {
    const formattedSwapGas = utils.formatUnits(
      fees.swapGasFee.amount,
      fees.swapGasFee?.token?.decimals,
    );
    feesBreakdown.push({
      label: 'Swap Gas Fee',
      fiatAmount: `≈ USD $${calculateCryptoToFiat(
        formattedSwapGas,
        fees.swapGasFee.token?.symbol || '',
        conversions,
        '-.--',
        4,
      )}`,
      amount: `${tokenValueFormat(formattedSwapGas)}`,
      prefix: '~ ',
      token: fees.swapGasFee.token!,
    });
  }

  const totalSwapFeesBySymbol = Object.entries(
    getTotalFeesBySymbol(fees.swapFees, balance.fundingItem.token),
  );
  if (totalSwapFeesBySymbol.length > 0) {
    totalSwapFeesBySymbol.forEach(([symbol, swapFee]) => {
      feesBreakdown.push({
        label: 'Swap Fees',
        fiatAmount: `≈ USD $${calculateCryptoToFiat(
          swapFee.formattedAmount,
          symbol,
          conversions,
          '-.--',
          4,
        )}`,
        amount: `${tokenValueFormat(swapFee.formattedAmount)}`,
        prefix: '~ ',
        token: swapFee.token!,
      });
    });
  }

  return feesBreakdown;
};
