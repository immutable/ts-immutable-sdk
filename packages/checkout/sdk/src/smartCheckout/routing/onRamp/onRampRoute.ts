import { CheckoutConfiguration, getL2ChainId } from '../../../config';
import {
  AvailableRoutingOptions,
  FundingStepType,
  ItemType, OnRampFundingStep,
} from '../../../types';
import { BalanceRequirement } from '../../balanceCheck/types';
import { allowListCheckForOnRamp } from '../../allowList';
import { IMX_ADDRESS_ZKEVM } from '../../../lib';

export const onRampRoute = async (
  config: CheckoutConfiguration,
  availableRoutingOptions: AvailableRoutingOptions,
  balanceRequirement: BalanceRequirement,
): Promise<OnRampFundingStep | undefined> => {
  if (balanceRequirement.type !== ItemType.ERC20 && balanceRequirement.type !== ItemType.NATIVE) return undefined;
  const { required, current, delta } = balanceRequirement;

  let hasAllowList = false;
  const onRampProvidersAllowList = await allowListCheckForOnRamp(config, availableRoutingOptions);
  Object.values(onRampProvidersAllowList).forEach((onRampAllowList) => {
    if (onRampAllowList.length > 0 && !hasAllowList) {
      hasAllowList = !!onRampAllowList.find((token) => token.address === required.token?.address);
    }
  });

  if (!hasAllowList) return undefined;

  return {
    type: FundingStepType.ONRAMP,
    chainId: getL2ChainId(config),
    fundingItem: {
      type: required.token.address === IMX_ADDRESS_ZKEVM ? ItemType.NATIVE : ItemType.ERC20,
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
