import {
  CheckoutConfiguration,
  fetchRiskAssessment,
  isAddressSanctioned,
} from '@imtbl/checkout-sdk';

export const checkSanctionedAddresses = async (
  addresses: string[],
  config: CheckoutConfiguration,
): Promise<boolean> => {
  const result = await fetchRiskAssessment(addresses, config);
  return isAddressSanctioned(result, undefined);
};
