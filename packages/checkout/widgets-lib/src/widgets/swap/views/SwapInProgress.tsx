import { TransactionResponse } from '@ethersproject/providers';
import { useContext, useEffect } from 'react';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import {
  PrefilledSwapForm,
  SwapWidgetViews,
} from '../../../context/view-context/SwapViewContextTypes';
import { LoadingView } from '../../../views/loading/LoadingView';
import { text } from '../../../resources/text/textConfig';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';

interface SwapInProgressProps {
  transactionResponse: TransactionResponse;
  swapForm: PrefilledSwapForm;
}

export function SwapInProgress({ transactionResponse, swapForm }: SwapInProgressProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { provider } = connectLoaderState;
  const { IN_PROGRESS: { loading } } = text.views[SwapWidgetViews.SWAP];

  useEffect(() => {
    (async () => {
      try {
        if (!provider) return;
        console.log('swap in progress', transactionResponse);
        const receipt = await transactionResponse.wait();
        // const receipt = await provider?.waitForTransaction(transactionResponse.hash as any as string);

        if (receipt.status === 1) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: SwapWidgetViews.SUCCESS,
                data: {
                  transactionHash: '',
                },
              },
            },
          });
          return;
        }

        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SwapWidgetViews.FAIL,
              data: swapForm,
              reason: 'Transaction failed',
            },
          },
        });
      } catch {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SwapWidgetViews.FAIL,
              data: swapForm,
              reason: 'Transaction failed',
            },
          },
        });
      }
    })();
  }, [transactionResponse, provider]);

  return (
    <LoadingView loadingText={loading.text} showFooterLogo />
  );
}
