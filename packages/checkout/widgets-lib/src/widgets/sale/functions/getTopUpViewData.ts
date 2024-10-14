import { ItemType, TransactionRequirement } from '@imtbl/checkout-sdk';
import { getTokenInfo } from './getTokenInfo';

export type TopUpViewData = {
  heading: string[];
  subheading: string[];
  amount: string;
  tokenAddress: string;
};

export const getTopUpViewData = (
  transactionRequirements: TransactionRequirement[],
): TopUpViewData => {
  const native = transactionRequirements.find(
    ({ type }) => type === ItemType.NATIVE,
  );
  const erc20 = transactionRequirements.find(
    ({ type }) => type === ItemType.ERC20,
  );

  const balances = {
    erc20: {
      value: erc20?.delta.formattedBalance,
      symbol: getTokenInfo(erc20)?.symbol,
    },
    native: {
      value: native?.delta.formattedBalance,
      symbol: getTokenInfo(native)?.symbol,
    },
  };
  const heading = ['views.PAYMENT_METHODS.topUp.heading'];

  // default to insufficient ERC20
  let subheading = ['views.PAYMENT_METHODS.topUp.subheading.erc20', balances];
  let amount = erc20?.delta.formattedBalance || '0';
  let tokenAddress = getTokenInfo(erc20)?.address;

  // if both NATIVE & ERC20 are insufficient
  if (native && erc20 && !native.sufficient && !erc20.sufficient) {
    subheading = ['views.PAYMENT_METHODS.topUp.subheading.both', balances];
  }

  // if only NATIVE is insufficient
  if (native && erc20 && !native.sufficient && erc20.sufficient) {
    amount = native?.delta.formattedBalance || '0';
    tokenAddress = getTokenInfo(native)?.address;
    subheading = ['views.PAYMENT_METHODS.topUp.subheading.native', balances];
  }

  return {
    heading,
    subheading,
    amount,
    tokenAddress,
  };
};
