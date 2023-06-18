import { Box, Button } from '@biom3/react';
import { useContext, useState } from 'react';
import { TransactionResponse } from '@imtbl/dex-sdk';
import { CheckoutErrorType } from '@imtbl/checkout-sdk';
import { text } from '../../../resources/text/textConfig';
import { PrefilledSwapForm, SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import {
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../../context/view-context/ViewContext';
import { SwapContext } from '../context/SwapContext';
import {
  swapButtonBoxStyle,
  swapButtonIconLoadingStyle,
} from './SwapButtonStyles';
import { SwapFormData } from './swapFormTypes';
import { TransactionRejected } from '../../../components/TransactionRejected/TransactionRejected';

export interface SwapButtonProps {
  loading: boolean
  updateLoading: (value: boolean) => void
  validator: () => boolean
  transaction: TransactionResponse | null;
  data?: SwapFormData;
}

export function SwapButton({
  loading, updateLoading, validator, transaction, data,
}: SwapButtonProps) {
  const [showTxnRejectedState, setShowTxnRejectedState] = useState(false);
  const { viewDispatch } = useContext(ViewContext);
  const { swapState } = useContext(SwapContext);
  const { checkout, provider } = swapState;
  const { buttonText } = text.views[SwapWidgetViews.SWAP].swapForm;

  const sendTransaction = async () => {
    if (!validator()) return;
    if (!checkout || !provider || !transaction) return;
    try {
      updateLoading(true);

      if (transaction.approveTransaction) {
        // If we need to approve a spending limit first
        // send user to Approve ERC20 Onbaording flow
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SwapWidgetViews.APPROVE_ERC20,
              data: {
                approveTransaction: transaction.approveTransaction,
                transaction: transaction.transaction,
                info: transaction.info,
                swapFormInfo: data as PrefilledSwapForm,
              },
            },
          },
        });
        return;
      }
      const txn = await checkout.sendTransaction({
        provider,
        transaction: transaction.transaction,
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SwapWidgetViews.IN_PROGRESS,
            data: {
              transactionResponse: txn.transactionResponse,
              swapForm: data as PrefilledSwapForm,
            },
          },
        },
      });
    } catch (err: any) {
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
        ) : buttonText}
      </Button>
      <TransactionRejected
        visible={showTxnRejectedState}
        showHeaderBar={false}
        onCloseBottomSheet={() => setShowTxnRejectedState(false)}
        onRetry={() => {
          sendTransaction();
          setShowTxnRejectedState(false);
        }}
      />
    </Box>
  );
}
