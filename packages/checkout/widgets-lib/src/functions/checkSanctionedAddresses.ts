import {
  CheckoutConfiguration,
  fetchRiskAssessment,
  isAddressSanctioned,
} from '@imtbl/checkout-sdk';

export const checkSanctionedAddresses = async (
  config: CheckoutConfiguration,
  assessmentData: Array<{ address: string; tokenAddr: string; amount: string }>,
): Promise<boolean> => {
  const result = await fetchRiskAssessment(config, assessmentData);
  return isAddressSanctioned(result, undefined);
};
