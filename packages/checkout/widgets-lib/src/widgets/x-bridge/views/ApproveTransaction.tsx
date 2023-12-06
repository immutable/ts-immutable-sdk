import { Box } from '@biom3/react';
import {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { CheckoutErrorType, TokenInfo } from '@imtbl/checkout-sdk';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { text } from '../../../resources/text/textConfig';
import {
  ApproveTransactionData,
} from '../../../context/view-context/BridgeViewContextTypes';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { LoadingView } from '../../../views/loading/LoadingView';
import { XBridgeContext } from '../context/XBridgeContext';
import { WalletApproveHero } from '../../../components/Hero/WalletApproveHero';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { isNativeToken } from '../../../lib/utils';
import { XBridgeWidgetViews } from '../../../context/view-context/XBridgeViewContextTypes';
import { FooterLogo } from '../../../components/Footer/FooterLogo';

export interface ApproveTransactionProps {
  data: ApproveTransactionData;
}

export function ApproveTransaction({ data }: ApproveTransactionProps) {
  const { bridgeState } = useContext(XBridgeContext);
  const {
    checkout,
    allowedTokens,
    token,
    from,
  } = bridgeState;
  const { viewDispatch } = useContext(ViewContext);
  const { loading, content, footer } = text.views[XBridgeWidgetViews.APPROVE_TRANSACTION];
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  // Local state
  const [actionDisabled, setActionDisabled] = useState(false);
  const [approvalTxnLoading, setApprovalTxnLoading] = useState(false);
  const [approvalSpendingTxnLoading, setApprovalSpendingTxnLoading] = useState(false);
  const [rejectedBridge, setRejectedBridge] = useState(false);

  // Get symbol from swap info for approve amount text
  const bridgeToken = useMemo(
    () => allowedTokens.find(
      (allowedToken: TokenInfo) => allowedToken.address === token?.address || isNativeToken(allowedToken.address),
    ),
    [allowedTokens, token],
  );

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
            data,
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
            type: XBridgeWidgetViews.BRIDGE_FAILURE,
            data: {
              reason: 'Transaction failed',
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
          type: SharedViews.ERROR_VIEW,
          error: err,
        },
      },
    });
  };

  const handleApproveBridgeClick = useCallback(async () => {
    if (!checkout || !from?.web3Provider || !data.transaction) {
      showErrorView();
      return;
    }
    if (actionDisabled) return;
    setActionDisabled(true);

    // Approvals as required
    if (data.approveTransaction.unsignedTx) {
      try {
        setApprovalSpendingTxnLoading(true);
        const approveSpendingResult = await checkout.sendTransaction({
          provider: from.web3Provider,
          transaction: data.approveTransaction.unsignedTx,
        });
        const approvalReceipt = await approveSpendingResult.transactionResponse.wait();
        if (approvalReceipt.status !== 1) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: XBridgeWidgetViews.BRIDGE_FAILURE,
                data,
              },
            },
          });
          return;
        }
      } catch (error: any) {
        setApprovalSpendingTxnLoading(false);
        if (error.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
          setRejectedBridge(true);
        } else {
          handleExceptions(error);
        }
      }
    }

    try {
      const sendResult = await checkout.sendTransaction({
        provider: from.web3Provider,
        transaction: data.transaction.unsignedTx,
      });

      setApprovalTxnLoading(true);
      await sendResult.transactionResponse.wait();

      setActionDisabled(false);
      setApprovalSpendingTxnLoading(false);
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: XBridgeWidgetViews.IN_PROGRESS,
            data: {
              token: bridgeToken!,
              transactionResponse: sendResult.transactionResponse,
            },
          },
        },
      });
    } catch (error: any) {
      if (error.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
        setRejectedBridge(true);
      } else {
        handleExceptions(error);
      }
    }
  }, [
    checkout,
    from,
    showErrorView,
    viewDispatch,
    data.transaction,
    data.approveTransaction,
    actionDisabled,
  ]);

  return (
    <>
      {approvalTxnLoading && (<LoadingView loadingText={loading.text} showFooterLogo />)}
      {!approvalTxnLoading && (
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
              {!approvalSpendingTxnLoading && (
                <FooterButton
                  loading={approvalSpendingTxnLoading}
                  actionText={rejectedBridge
                    ? footer.retryText
                    : footer.buttonText}
                  onActionClick={handleApproveBridgeClick}
                />
              )}
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
