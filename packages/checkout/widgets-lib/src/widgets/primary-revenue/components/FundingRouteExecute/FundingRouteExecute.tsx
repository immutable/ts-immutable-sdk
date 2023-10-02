import { Box, Button } from '@biom3/react';
import { FundingRouteStep } from '../../views/smartCheckoutTypes';

type FundingRouteExecuteProps = {
  fundingRouteStep?: FundingRouteStep;
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
      { fundingRouteStep?.asset.token.symbol }

      <Button sx={{ mt: 'auto' }} variant="primary" onClick={onFundingRouteExecuted}>
        next
      </Button>
    </Box>
  );
}
