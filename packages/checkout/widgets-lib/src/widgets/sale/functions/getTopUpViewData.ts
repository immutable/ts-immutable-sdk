import { ItemType, TransactionRequirement } from '@imtbl/checkout-sdk';
import { BigNumber, utils } from 'ethers';
import { getAmountWith1PercentSlippage } from './utils';

const tokenInfo = (req?: TransactionRequirement) => {
  if (req && req.current.type !== ItemType.ERC721) {
    return req.current.token;
  }
  return undefined;
};

export const getTopUpViewData = (
  transactionRequirements: TransactionRequirement[],
) => {
  const native = transactionRequirements.find(
    ({ type }) => type === ItemType.NATIVE,
  );
  const erc20 = transactionRequirements.find(
    ({ type }) => type === ItemType.ERC20,
  );
  const erc20WithSlippage = getAmountWith1PercentSlippage(BigNumber.from(erc20?.delta?.balance || BigNumber.from(0)));
  const formattedErc20Amount = utils.formatUnits(erc20WithSlippage, tokenInfo(erc20)?.decimals);
  const nativeWithSlippage = getAmountWith1PercentSlippage(BigNumber.from(native?.delta?.balance || BigNumber.from(0)));
  const formattedNativeAmount = utils.formatUnits(nativeWithSlippage, tokenInfo(native)?.decimals);

  const balances = {
    erc20: {
      value: formattedErc20Amount,
      symbol: tokenInfo(erc20)?.symbol,
    },
    native: {
      value: formattedNativeAmount,
      symbol: tokenInfo(native)?.symbol,
    },
  };
  const heading = ['views.PAYMENT_METHODS.topUp.heading'];

  // default to insufficient ERC20
  let subheading = ['views.PAYMENT_METHODS.topUp.subheading.erc20', balances];
  let amount = formattedErc20Amount;
  let tokenAddress = tokenInfo(erc20)?.address;

  // if both NATIVE & ERC20 are insufficient
  if (native && erc20 && !native.sufficient && !erc20.sufficient) {
    subheading = ['views.PAYMENT_METHODS.topUp.subheading.both', balances];
  }

  // if only NATIVE is insufficient
  if (native && erc20 && !native.sufficient && erc20.sufficient) {
    amount = formattedNativeAmount;
    tokenAddress = tokenInfo(native)?.address;
    subheading = ['views.PAYMENT_METHODS.topUp.subheading.native', balances];
  }

  return {
    heading,
    subheading,
    amount,
    tokenAddress,
  };
};
