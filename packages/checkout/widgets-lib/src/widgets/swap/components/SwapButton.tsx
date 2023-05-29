import { Box, Button } from '@biom3/react';
import { useContext } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TransactionResponse } from '@imtbl/dex-sdk';
import { CheckoutErrorType } from '@imtbl/checkout-sdk';
import { text } from '../../../resources/text/textConfig';
import { PrefilledSwapForm, SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import {
  ViewContext,
  ViewActions,
  BaseViews,
} from '../../../context/view-context/ViewContext';
import { SwapContext } from '../context/SwapContext';
import {
  swapButtonBoxStyle,
  swapButtonIconLoadingStyle,
} from './SwapButtonStyles';
import { SwapFormData } from './swapFormTypes';

export interface SwapButtonProps {
  loading: boolean
  validator: () => boolean
  transaction: TransactionResponse | null;
  data?: SwapFormData;
}

export function SwapButton({
  loading, validator, transaction, data,
}: SwapButtonProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { swapState } = useContext(SwapContext);
  const { checkout, provider } = swapState;
  const { buttonText } = text.views[SwapWidgetViews.SWAP].swapForm;

  const sendTransaction = async () => {
    if (!validator()) return;
    if (!checkout || !provider || !transaction) return;
    try {
      if (transaction.approveTransaction) {
        const txn = await checkout.sendTransaction({
          provider,
          transaction: transaction.approveTransaction,
        });
        await txn.transactionResponse.wait();
      }
      const txn = await checkout.sendTransaction({
        provider,
        transaction: transaction.transaction,
      });
      const receipt = await txn.transactionResponse.wait();
      console.log('receipt:', receipt, receipt.status);

      if (receipt.status === 0 || receipt.status === undefined) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SwapWidgetViews.FAIL,
              data: data as PrefilledSwapForm,
              reason: 'Transaction failed',
            },
          },
        });
      }
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: SwapWidgetViews.SUCCESS },
        },
      });
    } catch (err: any) {
      console.log('err:', err);
      if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
        console.log('user rejected request');
        return;
      }
      if (err.type === CheckoutErrorType.INSUFFICIENT_FUNDS) {
        console.log('Insufficient funds, data is: ', data as PrefilledSwapForm);
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
      if (err.type === CheckoutErrorType.TRANSACTION_FAILED) {
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
            type: BaseViews.ERROR,
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
    </Box>
  );
}
