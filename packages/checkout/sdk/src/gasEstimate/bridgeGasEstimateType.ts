import { TokenAmountEstimate } from '../types';

export type BridgeFeeEstimateResult = {
  bridgeFee: TokenAmountEstimate;
  bridgeable: boolean;
};
