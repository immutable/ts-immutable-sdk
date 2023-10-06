import { Box, Button } from '@biom3/react';
import { FundingStep } from '@imtbl/checkout-sdk';

type FundingRouteExecuteProps = {
  fundingRouteStep?: FundingStep;
  onFundingRouteExecuted: () => void;
};
export function FundingRouteExecute({ fundingRouteStep, onFundingRouteExecuted }: FundingRouteExecuteProps) {
  return (
    <Box testId="funding-route-execute">
      <p>
        hello world from FundingRouteExecute
      </p>
      { fundingRouteStep?.type }
      {' '}
      -
      {' '}
      { fundingRouteStep?.fundingItem.token.symbol }

      <Button sx={{ mt: 'auto' }} variant="primary" onClick={onFundingRouteExecuted}>
        next
      </Button>
    </Box>
  );
}
