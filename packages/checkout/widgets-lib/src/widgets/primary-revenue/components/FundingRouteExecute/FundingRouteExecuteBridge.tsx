/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Box, Button } from '@biom3/react';
import { FundingStep } from '@imtbl/checkout-sdk';

type FundingRouteExecuteBridgeProps = {
  fundingRouteStep: FundingStep;
  onFundingRouteExecuted: () => void;
};
type Stages = 'BRIDGE WIDGET' | 'CONFIRMING' | 'PROCESSING' | 'DONE';
export function FundingRouteExecuteBridge(
  { fundingRouteStep, onFundingRouteExecuted }: FundingRouteExecuteBridgeProps,
) {
  return (
    <Box testId="funding-route-execute-bridge">
      <p>
        hello world from FundingRouteExecuteBridge
      </p>
    </Box>
  );
}
