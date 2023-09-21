import { CheckoutConfiguration, getL2ChainId } from '../../../config';
import { FundingRouteType, ItemType, RoutingOptionsAvailable } from '../../../types';
import { BalanceRequirement } from '../../balanceCheck/types';
import { FundingRouteStep } from '../types';
import { allowListCheckForOnRamp } from '../../allowList';

export const onRampRoute = async (
  config: CheckoutConfiguration,
  availableRoutingOptions: RoutingOptionsAvailable,
  balanceRequirement: BalanceRequirement,
): Promise<FundingRouteStep | undefined> => {
  if (balanceRequirement.type !== ItemType.ERC20 && balanceRequirement.type !== ItemType.NATIVE) return undefined;
  const requiredBalance = balanceRequirement.required;

  let hasAllowList = false;
  const onRampProvidersAllowList = await allowListCheckForOnRamp(config, availableRoutingOptions);
  Object.values(onRampProvidersAllowList).forEach((onRampAllowList) => {
    if (onRampAllowList.length > 0 && !hasAllowList) {
      hasAllowList = !!onRampAllowList.find((token) => token.address === requiredBalance.token?.address);
    }
  });
  if (!hasAllowList) return undefined;

  return {
    type: FundingRouteType.ONRAMP,
    chainId: getL2ChainId(config),
    asset: {
      balance: requiredBalance.balance,
      formattedBalance: requiredBalance.formattedBalance,
      token: {
        ...requiredBalance.token,
      },
    },
  };
};
