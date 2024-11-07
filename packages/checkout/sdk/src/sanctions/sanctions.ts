import axios from 'axios';
import { Environment } from '@imtbl/config';
import { IMMUTABLE_API_BASE_URL } from '../env';
import { RiskAssessmentConfig } from '../types';
import { CheckoutConfiguration } from '../config';
import { isMatchingAddress } from '../utils/utils';

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

export const fetchRiskAssessment = async (
  addresses: string[],
  environment: Environment,
): Promise<RiskAssessment[]> => {
  const response = await axios.post<RiskAssessment[]>(
    `${IMMUTABLE_API_BASE_URL[environment]}/v1/sanctions/check`,
    {
      addresses,
    },
  );

  return response.data;
};

export const isAddressSanctioned = async (
  address: string,
  config: CheckoutConfiguration,
): Promise<boolean> => {
  try {
    const riskConfig = (await config.remote.getConfig(
      'riskAssessment',
    )) as RiskAssessmentConfig | undefined;

    if (!riskConfig?.enabled) {
      return false;
    }

    const assessment = (await fetchRiskAssessment([address], config.environment))
      .find((a) => isMatchingAddress(a.address, address));

    if (!assessment) {
      return false;
    }

    return riskConfig?.levels.includes(assessment.risk.toLowerCase());
  } catch (error) {
    return false;
  }
};
