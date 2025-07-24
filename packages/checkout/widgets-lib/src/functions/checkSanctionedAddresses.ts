import {
  CheckoutConfiguration,
  fetchRiskAssessment,
  isAddressSanctioned,
} from '@imtbl/checkout-sdk';

export const checkSanctionedAddresses = async (
  addresses: string[],
  config: CheckoutConfiguration,
  tokenData: Array<{ address: string; tokenAddr: string; amount: string }>,
): Promise<boolean> => {
  const result = await fetchRiskAssessment(addresses, config, tokenData);
  return isAddressSanctioned(result, undefined);
};
