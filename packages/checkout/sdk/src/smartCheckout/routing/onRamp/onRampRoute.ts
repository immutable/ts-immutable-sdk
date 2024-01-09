import { CheckoutConfiguration, getL2ChainId } from '../../../config';
import {
  AvailableRoutingOptions,
  FundingStepType,
  ItemType, OnRampFundingStep,
} from '../../../types';
import { BalanceRequirement } from '../../balanceCheck/types';
import { allowListCheckForOnRamp } from '../../allowList';
import { isNativeToken } from '../../../tokens';

export const onRampRoute = async (
  config: CheckoutConfiguration,
  availableRoutingOptions: AvailableRoutingOptions,
  balanceRequirement: BalanceRequirement,
): Promise<OnRampFundingStep | undefined> => {
  if (balanceRequirement.type !== ItemType.ERC20 && balanceRequirement.type !== ItemType.NATIVE) return undefined;
  const { required, current, delta } = balanceRequirement;

  let hasAllowList = false;
  const onRampAllowList = await allowListCheckForOnRamp(config, availableRoutingOptions);

  onRampAllowList.forEach((token) => {
    if (token.address === required.token?.address) {
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
