import axios from 'axios';
import { IMMUTABLE_API_BASE_URL } from '../env';
import { RiskAssessmentConfig } from '../types';
import { CheckoutConfiguration } from '../config';

type RiskAssessment = {
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

export const fetchRiskAssessment = async (
  addresses: string[],
  config: CheckoutConfiguration,
): Promise<AssessmentResult> => {
  const result = Object.fromEntries(
    addresses.map((address) => [address.toLowerCase(), { sanctioned: false }]),
  );

  const riskConfig = (await config.remote.getConfig('riskAssessment')) as
    | RiskAssessmentConfig
    | undefined;

  if (!riskConfig?.enabled) {
    return result;
  }

  try {
    const riskLevels = riskConfig?.levels.map((l) => l.toLowerCase()) ?? [];

    const response = await axios.post<RiskAssessment[]>(
      `${IMMUTABLE_API_BASE_URL[config.environment]}/v1/sanctions/check`,
      {
        addresses,
      },
    );

    for (const assessment of response.data) {
      result[assessment.address.toLowerCase()].sanctioned = riskLevels.includes(
        assessment.risk.toLowerCase(),
      );
    }

    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching risk assessment', error);
    return result;
  }
};

export const isAddressSanctioned = (
  riskAssessment: AssessmentResult,
  address: string,
): boolean => riskAssessment[address.toLowerCase()].sanctioned;
