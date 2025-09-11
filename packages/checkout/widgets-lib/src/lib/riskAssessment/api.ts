/* eslint-disable @typescript-eslint/naming-convention */
import { RiskAssessmentLevel } from './common';

export type RiskAssessmentResponse = {
  address: string;
  risk: RiskAssessmentLevel;
  risk_reason: string;
};

export type SanctionsCheckV2RequestItem = {
  address: string;
  amount: string;
  token_addr: string;
};
