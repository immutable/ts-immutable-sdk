export type RiskAssessmentResponse = {
  address: string;
  risk: RiskAssessmentLevel;
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

export const isAddressSanctioned = (
  riskAssessment: AssessmentResult,
  address?: string,
): boolean => {
  if (address) {
    return riskAssessment[address.toLowerCase()].sanctioned;
  }

  return Object.values(riskAssessment).some((assessment) => assessment.sanctioned);
};
