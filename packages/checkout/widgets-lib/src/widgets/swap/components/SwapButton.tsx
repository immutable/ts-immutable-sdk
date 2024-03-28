import { Box, Button } from '@biom3/react';
import { useContext, useState } from 'react';
import { TransactionResponse } from '@imtbl/dex-sdk';
import { CheckoutErrorType } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { getL2ChainId } from 'lib';
import { PrefilledSwapForm, SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import {
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../../context/view-context/ViewContext';
import {
  swapButtonBoxStyle,
  swapButtonIconLoadingStyle,
} from './SwapButtonStyles';
import { SwapFormData } from './swapFormTypes';
import { TransactionRejected } from '../../../components/TransactionRejected/TransactionRejected';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';

export interface SwapButtonProps {
  loading: boolean
  updateLoading: (value: boolean) => void
  validator: () => boolean
  transaction: TransactionResponse | undefined;
  data?: SwapFormData;
  insufficientFundsForGas: boolean;
  openNotEnoughImxDrawer: () => void;
  openNetworkSwitchDrawer: () => void;
}

export function SwapButton({
  loading,
  updateLoading,
  validator,
  transaction,
  data,
  insufficientFundsForGas,
  openNotEnoughImxDrawer,
  openNetworkSwitchDrawer,
}: SwapButtonProps) {
  const { t } = useTranslation();
  const [showTxnRejectedState, setShowTxnRejectedState] = useState(false);
  const { viewDispatch } = useContext(ViewContext);
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const { track } = useAnalytics();
  const sendTransaction = async () => {
    const isValid = validator();
    // Tracking swap from data here and is valid or not to understand behaviour
    track({
      userJourney: UserJourney.SWAP,
      screen: 'SwapCoins',
      control: 'Swap',
      controlType: 'Button',
      extras: {
        swapFromAddress: data?.fromTokenAddress,
        swapFromAmount: data?.fromAmount,
        swapFromTokenSymbol: data?.fromTokenSymbol,
        swapToAddress: data?.toTokenAddress,
        swapToAmount: data?.toAmount,
        swapToTokenSymbol: data?.toTokenSymbol,
        isSwapFormValid: isValid,
        hasFundsForGas: !insufficientFundsForGas,
      },
    });
    if (!isValid) return;
    if (!checkout || !provider || !transaction) return;
    if (insufficientFundsForGas) {
      openNotEnoughImxDrawer();
      return;
    }

    try {
    // check for switch network here
      const currentChainId = await (provider.provider as any).request({ method: 'eth_chainId', params: [] });
      // eslint-disable-next-line radix
      const parsedChainId = parseInt(currentChainId.toString());
      if (parsedChainId !== getL2ChainId(checkout.config)) {
        openNetworkSwitchDrawer();
        return;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Current network check failed', err);
    }

    if (!transaction) return;
    try {
      updateLoading(true);
      const prefilledSwapData:PrefilledSwapForm = {
        fromAmount: data?.fromAmount || '',
        fromTokenAddress: data?.fromTokenAddress || '',
        toTokenAddress: data?.toTokenAddress || '',
        toAmount: data?.toAmount || '',
      };

      if (transaction.approval) {
        // If we need to approve a spending limit first
        // send user to Approve ERC20 Onbaording flow
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SwapWidgetViews.APPROVE_ERC20,
              data: {
                approveTransaction: transaction.approval.transaction,
                transaction: transaction.swap.transaction,
                info: transaction.quote,
                swapFormInfo: prefilledSwapData,
              },
            },
          },
        });
        return;
      }
      const txn = await checkout.sendTransaction({
        provider,
        transaction: transaction.swap.transaction,
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SwapWidgetViews.IN_PROGRESS,
            data: {
              transactionResponse: txn.transactionResponse,
              swapForm: prefilledSwapData as PrefilledSwapForm,
            },
          },
        },
      });
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);

      updateLoading(false);
      if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
        setShowTxnRejectedState(true);
        return;
      }
      if (err.type === CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SwapWidgetViews.PRICE_SURGE,
              data: data as PrefilledSwapForm,
            },
          },
        });
        return;
      }
      if (err.type === CheckoutErrorType.TRANSACTION_FAILED
        || err.type === CheckoutErrorType.INSUFFICIENT_FUNDS
      || (err.receipt && err.receipt.status === 0)) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SwapWidgetViews.FAIL,
              reason: 'Transaction failed',
              data: data as PrefilledSwapForm,
            },
          },
        });
        return;
      }

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.ERROR_VIEW,
            error: err,
          },
        },
      });
    }
  };

  return (
    <Box sx={swapButtonBoxStyle}>
      <Button
        testId="swap-button"
        disabled={loading}
        variant="primary"
        onClick={sendTransaction}
        size="large"
      >
        {loading ? (
          <Button.Icon icon="Loading" sx={swapButtonIconLoadingStyle} />
        ) : t('views.SWAP.swapForm.buttonText')}
      </Button>
      <TransactionRejected
        visible={showTxnRejectedState}
        showHeaderBar={false}
        onCloseDrawer={() => setShowTxnRejectedState(false)}
        onRetry={() => {
          sendTransaction();
          setShowTxnRejectedState(false);
        }}
      />
    </Box>
  );
}
