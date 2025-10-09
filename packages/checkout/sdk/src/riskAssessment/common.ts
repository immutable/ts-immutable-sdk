/* eslint-disable @typescript-eslint/no-unused-vars */

export type AssessmentResult = {
  [address: string]: {
    sanctioned: boolean;
  };
};

/**
 * @deprecated This function is deprecated and will be removed.
 * @param riskAssessment
 * @param address
 * @returns
 */
export const isAddressSanctioned = (
  riskAssessment: AssessmentResult,
  address?: string,
): boolean => false;

/**
 * @deprecated This function is deprecated and will be removed.
 * @param riskAssessment
 * @param address
 * @returns
 */
export const isSingleAddressSanctioned = (
  riskAssessment: AssessmentResult,
  address: string,
): boolean => false;

/**
 * @deprecated This function is deprecated and will be removed.
 * @param riskAssessment
 * @returns
 */
export const resultHasSanctionedWallets = (
  riskAssessment: AssessmentResult,
): boolean => false;
