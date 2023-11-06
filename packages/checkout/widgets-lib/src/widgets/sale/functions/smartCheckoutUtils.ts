import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout, ERC20ItemRequirement, GasAmount, GasTokenType, ItemType, TransactionOrGasType,
} from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { getL2ChainId, IMX_ADDRESS_ZKEVM } from '../../../lib';

export const MAX_GAS_LIMIT = '30000000';

export const getItemRequirements = (amount: string, spenderAddress: string, contractAddress: string)
: ERC20ItemRequirement[] => [
  {
    type: ItemType.ERC20,
    contractAddress,
    spenderAddress,
    amount,
  },
];

export const getGasEstimate = (): GasAmount => ({
  type: TransactionOrGasType.GAS,
  gasToken: {
    type: GasTokenType.NATIVE,
    limit: BigNumber.from(MAX_GAS_LIMIT),
  },
});

export const isUserFractionalBalanceBlocked = async (
  walletAddress: string,
  contractAddress: string,
  amount: string,
  checkout?: Checkout,
  provider?: Web3Provider,
) => {
  const chainId = getL2ChainId(checkout!.config);
  const balanceResponse = await checkout!.getAllBalances({ provider: provider!, walletAddress, chainId });
  const zero = BigNumber.from('0');

  const purchaseBalance = balanceResponse.balances.find((balance) => balance.token.address === contractAddress);
  if (!purchaseBalance) {
    return false;
  }
  const formattedAmount = parseUnits(amount, purchaseBalance.token.decimals);

  if (purchaseBalance.balance.gt(zero) && purchaseBalance.balance.lt(formattedAmount)) {
    return true;
  }

  const isPassport = !!(provider?.provider as any)?.isPassport;
  if (isPassport) {
    return false;
  }
  const imxBalance = balanceResponse.balances.find((balance) => balance.token.address === IMX_ADDRESS_ZKEVM);
  const imxBalanceAmount = imxBalance ? imxBalance.balance : BigNumber.from('0');
  if (imxBalanceAmount.gte(zero) && imxBalanceAmount.lt(BigNumber.from(MAX_GAS_LIMIT))) {
    return true;
  }
  return false;
};
