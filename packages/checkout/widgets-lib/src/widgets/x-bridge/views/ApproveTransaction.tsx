import { Box } from '@biom3/react';
import {
  useCallback,
  useContext,
  useState,
} from 'react';
import { CheckoutErrorType } from '@imtbl/checkout-sdk';
import { ApproveBridgeResponse, BridgeTxResponse } from '@imtbl/bridge-sdk';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { text } from '../../../resources/text/textConfig';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { LoadingView } from '../../../views/loading/LoadingView';
import { XBridgeContext } from '../context/XBridgeContext';
import { WalletApproveHero } from '../../../components/Hero/WalletApproveHero';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { XBridgeWidgetViews } from '../../../context/view-context/XBridgeViewContextTypes';
import { FooterLogo } from '../../../components/Footer/FooterLogo';

export interface ApproveTransactionProps {
  approveTransaction: ApproveBridgeResponse;
  transaction: BridgeTxResponse;
}

export function ApproveTransaction({ approveTransaction, transaction }: ApproveTransactionProps) {
  const { bridgeState } = useContext(XBridgeContext);
  const {
    checkout,
    from,
  } = bridgeState;
  const { viewDispatch } = useContext(ViewContext);
  const { loadingView, content, footer } = text.views[XBridgeWidgetViews.APPROVE_TRANSACTION];
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  // Local state
  const [actionDisabled, setActionDisabled] = useState(false);
  const [txProcessing, setTxProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rejectedBridge, setRejectedBridge] = useState(false);

  // Common error view function
  const showErrorView = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SharedViews.ERROR_VIEW,
          error: new Error('No checkout object or no provider object found'),
        },
      },
    });
  }, [viewDispatch]);

  const goBack = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.GO_BACK,
      },
    });
  }, [viewDispatch]);

  const handleExceptions = (err) => {
    if (err.type === CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: XBridgeWidgetViews.BRIDGE_FAILURE,
            reason: 'Unpredictable gas limit',
          },
        },
      });
      return;
    }
    if (err.type === CheckoutErrorType.TRANSACTION_FAILED
      || err.type === CheckoutErrorType.INSUFFICIENT_FUNDS
      || (err.receipt && err.receipt.status === 0)) {
      let reason = 'Transaction failed';
      if (err.type === CheckoutErrorType.INSUFFICIENT_FUNDS) reason = 'Insufficient funds';
      if (err.receipt && err.receipt.status === 0) reason = 'Transaction failed to settle on chain';
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: XBridgeWidgetViews.BRIDGE_FAILURE,
            reason,
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
  };

  const handleApproveBridgeClick = useCallback(async () => {
    let bridgeRejected = false;
    if (!checkout || !from?.web3Provider || !transaction) {
      showErrorView();
      return;
    }
    if (actionDisabled) return;
    setActionDisabled(true);

    // Approvals as required
    if (approveTransaction.unsignedTx) {
      try {
        setTxProcessing(true);
        const approveSpendingResult = await checkout.sendTransaction({
          provider: from.web3Provider,
          transaction: approveTransaction.unsignedTx,
        });
        const approvalReceipt = await approveSpendingResult.transactionResponse.wait();
        if (approvalReceipt.status !== 1) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: XBridgeWidgetViews.BRIDGE_FAILURE,
                reason: 'Transaction failed to settle on chain',
              },
            },
          });
          return;
        }
      } catch (error: any) {
        setTxProcessing(false);
        if (error.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
          setRejectedBridge(true);
          bridgeRejected = true;
        } else {
          handleExceptions(error);
        }
      } finally {
        setActionDisabled(false);
      }
    }

    try {
      if (bridgeRejected) return;
      setTxProcessing(true);
      const sendResult = await checkout.sendTransaction({
        provider: from.web3Provider,
        transaction: transaction.unsignedTx,
      });

      setLoading(true);
      const receipt = await sendResult.transactionResponse.wait();

      if (receipt.status === 0) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: XBridgeWidgetViews.BRIDGE_FAILURE,
              reason: 'Approval transaction failed to settle on chain',
            },
          },
        });
        return;
      }

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: XBridgeWidgetViews.IN_PROGRESS,
            transactionHash: receipt.transactionHash,
          },
        },
      });
    } catch (error: any) {
      if (error.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
        setRejectedBridge(true);
      } else {
        handleExceptions(error);
      }
    } finally {
      setLoading(false);
      setTxProcessing(false);
      setActionDisabled(false);
    }
  }, [
    checkout,
    from,
    showErrorView,
    viewDispatch,
    transaction,
    approveTransaction,
    actionDisabled,
  ]);

  return (
    <>
      {loading && (<LoadingView loadingText={loadingView.text} showFooterLogo />)}
      {!loading && (
        <SimpleLayout
          header={(
            <HeaderNavigation
              transparent
              showBack
              onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
              onBackButtonClick={goBack}
            />
          )}
          floatHeader
          heroContent={<WalletApproveHero />}
          footer={(
            <Box sx={{ width: '100%', flexDirection: 'column' }}>
              <FooterButton
                loading={txProcessing}
                actionText={rejectedBridge
                  ? footer.retryText
                  : footer.buttonText}
                onActionClick={handleApproveBridgeClick}
              />
              <FooterLogo />
            </Box>
          )}
        >
          <SimpleTextBody heading={content.heading}>
            <Box>{content.body}</Box>
          </SimpleTextBody>
        </SimpleLayout>
      )}
    </>
  );
}
