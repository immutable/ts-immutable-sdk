import { CheckoutConfiguration, getL2ChainId } from '../../../config';
import {
  AvailableRoutingOptions,
  FundingStepType,
  ItemType, OnRampFundingStep,
} from '../../../types';
import { BalanceERC20Requirement, BalanceNativeRequirement, BalanceRequirement } from '../../balanceCheck/types';
import { allowListCheckForOnRamp } from '../../allowList';
import { isNativeToken } from '../../../tokens';
import { isMatchingAddress } from '../../../utils/utils';

export const onRampRoute = async (
  config: CheckoutConfiguration,
  availableRoutingOptions: AvailableRoutingOptions,
  balanceRequirement: BalanceRequirement,
): Promise<OnRampFundingStep | undefined> => {
  // Only check for ERC20 and NATIVE
  if (![ItemType.ERC20, ItemType.NATIVE].includes(balanceRequirement.type)) return undefined;

  const { required, current, delta } = balanceRequirement as BalanceNativeRequirement | BalanceERC20Requirement;

  let hasAllowList = false;
  const onRampAllowList = await allowListCheckForOnRamp(config, availableRoutingOptions);

  onRampAllowList.forEach((token) => {
    if (!token.address) return;
    if (!required.token) return;
    if (
      isNativeToken(required.token.address)
      || isMatchingAddress(token.address, required.token.address)
    ) {
      hasAllowList = true;
    }
  });

  if (!hasAllowList) return undefined;

  return {
    type: FundingStepType.ONRAMP,
    chainId: getL2ChainId(config),
    fundingItem: {
      type: isNativeToken(required.token.address) ? ItemType.NATIVE : ItemType.ERC20,
      fundsRequired: {
        amount: delta.balance,
        formattedAmount: delta.formattedBalance,
      },
      userBalance: {
        balance: current.balance,
        formattedBalance: current.formattedBalance,
      },
      token: required.token,
    },
  };
};
