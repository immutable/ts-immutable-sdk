/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Box, Button } from '@biom3/react';
import { FundingRouteStep } from '../../views/smartCheckoutTypes';

type FundingRouteExecuteSwapProps = {
  fundingRouteStep: FundingRouteStep;
  onFundingRouteExecuted: () => void;
};
type Stages = 'SWAP WIDGET' | 'CONFIRMING' | 'PROCESSING' | 'DONE';
export function FundingRouteExecuteSwap(
  { fundingRouteStep, onFundingRouteExecuted }: FundingRouteExecuteSwapProps,
) {
  return (
    <Box testId="funding-route-execute-swap">
      <p>
        hello world from FundingRouteExecuteSwap
      </p>
    </Box>
  );
}
