/* eslint-disable @typescript-eslint/no-unused-vars */
import { CheckoutConfiguration } from '../config';
import { AssessmentResult } from './common';

/**
 * @deprecated This function is deprecated and will be removed.
 * @param addresses
 * @param config
 * @returns
 */
export const fetchRiskAssessment = async (
  addresses: string[],
  config: CheckoutConfiguration,
): Promise<AssessmentResult> => Object.fromEntries(
  addresses.map((address) => [address.toLowerCase(), { sanctioned: false }]),
);
