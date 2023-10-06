/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Box, Button } from '@biom3/react';
import { useContext, useEffect, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { FundingStep } from '@imtbl/checkout-sdk';
import { ConnectLoaderContext } from '../../../../context/connect-loader-context/ConnectLoaderContext';

type FundingRouteExecuteSwapProps = {
  fundingRouteStep: FundingStep;
  onFundingRouteExecuted: () => void;
};
type Stages = 'LOADING' | 'SWAP WIDGET' | 'CONFIRMING' | 'PROCESSING' | 'DONE';
export function FundingRouteExecuteSwap(
  { fundingRouteStep, onFundingRouteExecuted }: FundingRouteExecuteSwapProps,
) {
  const [stage, setStage] = useState<Stages>('LOADING');
  const { connectLoaderState: { provider } } = useContext(ConnectLoaderContext);

  const requestPassportSwap = () => {
    console.log('requestPassportSwap');
    setStage('CONFIRMING');
  };

  useEffect(() => {
    if (!provider) {
      console.error('missing provider, please connect frist');
      return;
    }
    if ((provider.provider as any)?.isPassport) {
      requestPassportSwap();
    } else {
      // Show SWAP WIDGET
      setStage('SWAP WIDGET');
    }
  }, [fundingRouteStep]);

  const onSwapRequested = () => {
    setStage('CONFIRMING');
  };

  return (
    <Box testId="funding-route-execute-swap">
      <p>
        hello world from FundingRouteExecuteSwap
      </p>
      {stage === 'LOADING' && (
        <p>LOADING</p>
      )}
      {stage === 'SWAP WIDGET' && (
      <Button sx={{ mt: 'auto' }} variant="primary" onClick={onSwapRequested}>
        SWAP WIDGET
      </Button>
      )}
      {stage === 'CONFIRMING' && (
      <p>CONFIRMING</p>
      )}
      {stage === 'PROCESSING' && (
      <p>PROCESSING</p>
      )}
      {stage === 'DONE' && (
      <p>DONE</p>
      )}
    </Box>
  );
}
