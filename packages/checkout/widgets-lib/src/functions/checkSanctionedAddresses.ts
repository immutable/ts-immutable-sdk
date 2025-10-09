import {
  CheckoutConfiguration,
} from '@imtbl/checkout-sdk';
import { fetchRiskAssessmentV2, resultHasSanctionedWallets } from '../lib/riskAssessment';

type TokenAmount = {
  address: string;
  amount: bigint;
};

export const checkSanctionedAddresses = async (
  addresses: string[],
  amount: TokenAmount,
  config: CheckoutConfiguration,
): Promise<boolean> => {
  const assessmentData = addresses.map((address) => ({
    address,
    amount: amount.amount,
    tokenAddr: amount.address,
  }));
  const result = await fetchRiskAssessmentV2(assessmentData, config);
  return resultHasSanctionedWallets(result);
};
