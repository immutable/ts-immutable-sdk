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

// New type for v2 request items
type SanctionsCheckV2RequestItem = {
  address: string;
  amount: string;
  token_addr: string;
};

// Simplified assessment data - no redundant address info
type AssessmentData = {
  address: string;
  tokenAddr: string;
  amount: string;
};

export const fetchRiskAssessment = async (
  config: CheckoutConfiguration,
  assessmentData: AssessmentData[],
): Promise<AssessmentResult> => {
  const result = Object.fromEntries(
    assessmentData.map((data) => [data.address.toLowerCase(), { sanctioned: false }]),
  );

  const riskConfig = (await config.remote.getConfig('riskAssessment')) as
    | RiskAssessmentConfig
    | undefined;

  if (!riskConfig?.enabled) {
    return result;
  }

  try {
    const riskLevels = riskConfig?.levels.map((l) => l.toLowerCase()) ?? [];

    // Prepare v2 request payload - always include token data
    const requestPayload: SanctionsCheckV2RequestItem[] = assessmentData.map((data) => {
      return {
        address: data.address,
        token_addr: data.tokenAddr,
        amount: data.amount,
      };
    });

    const response = await axios.post<RiskAssessment[]>(
      `${IMMUTABLE_API_BASE_URL[config.environment]}/v2/sanctions/check`,
      requestPayload,
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
  address?: string,
): boolean => {
  if (address) {
    return riskAssessment[address.toLowerCase()].sanctioned;
  }

  return Object.values(riskAssessment).some((assessment) => assessment.sanctioned);
};
