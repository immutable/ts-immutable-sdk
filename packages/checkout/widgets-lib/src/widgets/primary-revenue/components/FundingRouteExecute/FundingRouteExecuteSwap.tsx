/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Box, Button } from '@biom3/react';
import { useContext, useEffect, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { FundingStep } from '@imtbl/checkout-sdk';
import { ConnectLoaderContext } from '../../../../context/connect-loader-context/ConnectLoaderContext';
import { SwapWidget, SwapWidgetParams } from '../../../swap/SwapWidget';
import { withDefaultWidgetConfigs } from '../../../../lib/withDefaultWidgetConfig';

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

  const swapParams: SwapWidgetParams = {
    amount: '1000',
    fromContractAddress: '0x123',
    toContractAddress: '0x123abc',
  };

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
      <SwapWidget
        params={swapParams}
        config={withDefaultWidgetConfigs()}
      />

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
