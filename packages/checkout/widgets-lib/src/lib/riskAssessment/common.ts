export type RiskAssessmentResponse = {
  address: string;
  risk: RiskAssessmentLevel;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  risk_reason: string;
};

export enum RiskAssessmentLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  SEVERE = 'Severe',
}

export type AssessmentResult = {
  [address: string]: {
    sanctioned: boolean;
  };
};

// deprecated  - please use isSingleAddressSanctioned or resultHasSanctionedWallets
export const isAddressSanctioned = (
  riskAssessment: AssessmentResult,
  address?: string,
): boolean => {
  if (address) {
    return riskAssessment[address.toLowerCase()].sanctioned;
  }

  return Object.values(riskAssessment).some((assessment) => assessment.sanctioned);
};

export const isSingleAddressSanctioned = (
  riskAssessment: AssessmentResult,
  address: string,
): boolean => riskAssessment[address.toLowerCase()].sanctioned;

export const resultHasSanctionedWallets = (
  riskAssessment: AssessmentResult,
): boolean => Object.values(riskAssessment).some((assessment) => assessment.sanctioned);
