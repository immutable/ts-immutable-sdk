import axios from 'axios';
import { CheckoutConfiguration, IMMUTABLE_API_BASE_URL, RemoteConfiguration } from '@imtbl/checkout-sdk';
import { AssessmentResult } from './common';
import { RiskAssessmentResponse, SanctionsCheckV2RequestItem } from './api';

// Simplified assessment data - no redundant address info
type AssessmentData = {
  address: string;
  tokenAddr: string;
  amount: bigint;
};

type RiskAssessmentConfig = RemoteConfiguration['riskAssessment'];

export const fetchRiskAssessment = async (
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
      // eslint-disable-next-line @typescript-eslint/naming-convention
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
