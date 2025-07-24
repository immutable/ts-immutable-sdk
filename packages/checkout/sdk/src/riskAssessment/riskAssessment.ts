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

export const fetchRiskAssessment = async (
  addresses: string[],
  config: CheckoutConfiguration,
  tokenData: Array<{ address: string; tokenAddr: string; amount: string }>,
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

    // Prepare v2 request payload
    const requestPayload: SanctionsCheckV2RequestItem[] = addresses.map((address) => {
      const item: SanctionsCheckV2RequestItem = { 
        address,
        token_addr: '',
        amount: '0'
      };

      // Add token and amount data
      const tokenInfo = tokenData.find((t) => t.address.toLowerCase() === address.toLowerCase());
      if (tokenInfo) {
        item.token_addr = tokenInfo.tokenAddr;
        item.amount = tokenInfo.amount;
      }

      return item;
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
