import { Box } from '@biom3/react';
import {
  useCallback, useContext, useMemo, useState,
} from 'react';
import { CheckoutErrorType, TokenInfo } from '@imtbl/checkout-sdk';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { text } from '../../../resources/text/textConfig';
import {
  ApproveERC20BridgeData,
  BridgeWidgetViews,
  PrefilledBridgeForm,
} from '../../../context/view-context/BridgeViewContextTypes';
import { IMXCoinsHero } from '../../../components/Hero/IMXCoinsHero';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { ImmutableNetworkHero } from '../../../components/Hero/ImmutableNetworkHero';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { LoadingView } from '../../../views/loading/LoadingView';
import { BridgeContext } from '../context/BridgeContext';

export interface ApproveERC20BridgeProps {
  data: ApproveERC20BridgeData;
}
export function ApproveERC20BridgeOnboarding({ data }: ApproveERC20BridgeProps) {
  const { bridgeState: { checkout, provider, allowedTokens } } = useContext(BridgeContext);
  const { viewDispatch } = useContext(ViewContext);
  const { approveSpending, approveBridge } = text.views[BridgeWidgetViews.APPROVE_ERC20];

  // Local state
  const [actionDisabled, setActionDisabled] = useState(false);
  const [approvalTxnLoading, setApprovalTxnLoading] = useState(false);
  const [showBridgeTxnStep, setShowBridgeTxnStep] = useState(false);

  // reject transaction flags
  const [rejectedSpending, setRejectedSpending] = useState(false);
  const [rejectedBridge, setRejectedBridge] = useState(false);

  // Get symbol from swap info for approve amount text
  const bridgeToken = useMemo(
    () => allowedTokens.find(
      (token: TokenInfo) => token.address === data.bridgeFormInfo.tokenAddress || token.address === 'NATIVE',
    ),
    [allowedTokens, data.bridgeFormInfo.tokenAddress],
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

  const goBackWithSwapData = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.GO_BACK,
      },
    });
  }, [viewDispatch]);

  const handleExceptions = (err, bridgeFormData:PrefilledBridgeForm) => {
    if (err.type === CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: BridgeWidgetViews.FAIL,
            data: bridgeFormData,
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
            type: BridgeWidgetViews.FAIL,
            reason: 'Transaction failed',
            data: bridgeFormData,
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

  /* --------------------- */
  // Approve spending step //
  /* --------------------- */

  const handleApproveSpendingClick = useCallback(async () => {
    if (!checkout || !provider) {
      showErrorView();
      return;
    }
    if (actionDisabled) return;

    setActionDisabled(true);

    try {
      if (!data.approveTransaction.unsignedTx) return;

      const txnResult = await checkout.sendTransaction({
        provider,
        transaction: data.approveTransaction.unsignedTx,
      });

      setApprovalTxnLoading(true);
      const approvalReceipt = await txnResult.transactionResponse.wait();

      if (approvalReceipt.status !== 1) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: BridgeWidgetViews.FAIL,
              data: data.bridgeFormInfo as unknown as PrefilledBridgeForm,
            },
          },
        });
        return;
      }

      setApprovalTxnLoading(false);
      setActionDisabled(false);
      setShowBridgeTxnStep(true);
    } catch (err: any) {
      setApprovalTxnLoading(false);
      setActionDisabled(false);
      if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
        setRejectedSpending(true);
        return;
      }
      handleExceptions(err, data.bridgeFormInfo as PrefilledBridgeForm);
    }
  }, [
    checkout,
    provider,
    showErrorView,
    viewDispatch,
    setRejectedBridge,
    data.approveTransaction,
    data.bridgeFormInfo,
    actionDisabled,
    setActionDisabled,
    setApprovalTxnLoading,
  ]);

  const approveSpendingContent = useMemo(() => (
    <SimpleTextBody heading={approveSpending.content.heading}>
      {/* eslint-disable-next-line max-len */}
      <Box>{`${approveSpending.content.body[0]} ${data.bridgeFormInfo.amount} ${bridgeToken?.symbol || ''} ${approveSpending.content.body[1]}`}</Box>
    </SimpleTextBody>
  ), [data.bridgeFormInfo, bridgeToken]);

  const approveSpendingFooter = useMemo(() => (
    <FooterButton
      actionText={rejectedSpending
        ? approveSpending.footer.retryText
        : approveSpending.footer.buttonText}
      onActionClick={handleApproveSpendingClick}
    />
  ), [rejectedSpending, handleApproveSpendingClick]);

  /* ------------------- */
  // Approve bridge step //
  /* ------------------- */

  const handleApproveBridgeClick = useCallback(async () => {
    if (!checkout || !provider) {
      showErrorView();
      return;
    }

    if (actionDisabled) return;

    setActionDisabled(true);

    try {
      const txn = await checkout.sendTransaction({
        provider,
        transaction: data.transaction.unsignedTx,
      });

      setActionDisabled(false);

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: BridgeWidgetViews.IN_PROGRESS,
            data: {
              token: bridgeToken!,
              transactionResponse: txn.transactionResponse,
              bridgeForm: data.bridgeFormInfo as PrefilledBridgeForm,
            },
          },
        },
      });
    } catch (err: any) {
      setActionDisabled(false);
      if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
        setRejectedBridge(true);
        return;
      }
      handleExceptions(err, data.bridgeFormInfo as PrefilledBridgeForm);
    }
  }, [
    checkout,
    provider,
    showErrorView,
    viewDispatch,
    setRejectedBridge,
    data.transaction,
    data.bridgeFormInfo,
    actionDisabled,
    setActionDisabled,
  ]);

  const approveBridgeContent = (
    <SimpleTextBody heading={approveBridge.content.heading}>
      <Box>{approveBridge.content.body}</Box>
    </SimpleTextBody>
  );

  const approveBridgeFooter = useMemo(() => (
    <FooterButton
      actionText={rejectedBridge
        ? approveBridge.footer.retryText
        : approveBridge.footer.buttonText}
      onActionClick={handleApproveBridgeClick}
    />
  ), [rejectedBridge, handleApproveBridgeClick]);

  return (
    <>
      {approvalTxnLoading && (<LoadingView loadingText={approveSpending.loading.text} showFooterLogo />)}
      {!approvalTxnLoading && (
        <SimpleLayout
          header={(
            <HeaderNavigation
              transparent
              showBack
              onCloseButtonClick={sendBridgeWidgetCloseEvent}
              onBackButtonClick={goBackWithSwapData}
            />
          )}
          floatHeader
          heroContent={showBridgeTxnStep ? <ImmutableNetworkHero /> : <IMXCoinsHero />}
          footer={showBridgeTxnStep ? approveBridgeFooter : approveSpendingFooter}
        >
          {showBridgeTxnStep ? approveBridgeContent : approveSpendingContent}
        </SimpleLayout>
      )}
    </>
  );
}
