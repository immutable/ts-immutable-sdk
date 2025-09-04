import axios from 'axios';
import { IMMUTABLE_API_BASE_URL } from '../env';
import { RiskAssessmentConfig } from '../types';
import { CheckoutConfiguration } from '../config';
import { AssessmentResult, RiskAssessmentResponse } from './common';

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
  amount: bigint;
};

export const fetchRiskAssessmentV2 = async (
  assessmentData: AssessmentData[],
  config: CheckoutConfiguration,
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
    const requestPayload: SanctionsCheckV2RequestItem[] = assessmentData.map((data) => ({
      address: data.address,
      token_addr: data.tokenAddr,
      amount: data.amount.toString(),
    }));

    const response = await axios.post<RiskAssessmentResponse[]>(
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
