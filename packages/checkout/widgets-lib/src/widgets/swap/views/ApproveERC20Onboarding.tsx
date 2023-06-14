import { Box } from '@biom3/react';
import {
  useCallback, useContext, useMemo, useState,
} from 'react';
import { CheckoutErrorType, TokenInfo } from '@imtbl/checkout-sdk';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { text } from '../../../resources/text/textConfig';
import {
  ApproveERC20Swap,
  PrefilledSwapForm,
  SwapWidgetViews,
} from '../../../context/view-context/SwapViewContextTypes';
import { IMXCoinsHero } from '../../../components/Hero/IMXCoinsHero';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { ImmutableNetworkHero } from '../../../components/Hero/ImmutableNetworkHero';
import { SwapContext } from '../context/SwapContext';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';

export interface ApproveERC20Props {
  data: ApproveERC20Swap;
}
export function ApproveERC20Onboarding({ data }: ApproveERC20Props) {
  // console.log(data);
  const { swapState: { checkout, provider, allowedTokens } } = useContext(SwapContext);
  const { viewDispatch } = useContext(ViewContext);
  const { approveSpending, approveSwap } = text.views[SwapWidgetViews.APPROVE_ERC20];

  // can only show approve spending else show approve swap
  const [showApproveSpendingStep, setShowApproveSpendingStep] = useState(true);

  // if user rejects transactions
  const [rejectedSpending, setRejectedSpending] = useState(false);
  const [rejectedSwap, setRejectedSwap] = useState(false);

  // Get symbol from swap info for approve amount text
  const fromToken = allowedTokens.find((token: TokenInfo) => token.address === data.swapFormInfo.fromContractAddress);
  const approveSpendHint = `${data.swapFormInfo.fromAmount} ${fromToken?.symbol}`;

  // Approve spending step
  const approveSpendContent = (
    <SimpleTextBody heading={approveSpending.content.heading}>
      <Box>{`${approveSpending.content.body[0]} ${approveSpendHint} ${approveSpending.content.body[1]}`}</Box>
    </SimpleTextBody>
  );

  const approveSpendingFooterText = useMemo(() => (rejectedSpending
    ? approveSpending.footer.retryText
    : approveSpending.footer.buttonText), [rejectedSpending]);

  const handleApproveSpendingClick = useCallback(async () => {
    if (!checkout || !provider) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.ERROR_VIEW,
            error: new Error('No checkout object or no provider object found'),
          },
        },
      });
      return;
    }

    try {
      const txnResult = await checkout.sendTransaction({
        provider,
        transaction: data.approveTransaction,
      });
      const approvalReceipt = await txnResult.transactionResponse.wait();

      if (approvalReceipt.status !== 1) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SwapWidgetViews.FAIL,
              data: data.swapFormInfo as unknown as PrefilledSwapForm,
            },
          },
        });
        return;
      }

      setShowApproveSpendingStep(false);
    } catch (err: any) {
      if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
        setRejectedSpending(true);
      }
    }
  }, [checkout, provider, viewDispatch, setRejectedSwap, data.approveTransaction, data.swapFormInfo]);

  // Approve swap step
  const approveSwapContent = (
    <SimpleTextBody heading={approveSwap.content.heading}>
      <Box>{approveSwap.content.body}</Box>
    </SimpleTextBody>
  );

  const approveSwapFooterText = useMemo(() => (rejectedSwap
    ? approveSwap.footer.retryText
    : approveSwap.footer.buttonText), [rejectedSwap]);

  const handleApproveSwapClick = useCallback(async () => {
    if (!checkout || !provider) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.ERROR_VIEW,
            error: new Error('No checkout object or no provider object found'),
          },
        },
      });
      return;
    }

    try {
      const txn = await checkout.sendTransaction({
        provider,
        transaction: data.transaction,
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SwapWidgetViews.IN_PROGRESS,
            data: {
              transactionResponse: txn.transactionResponse,
              swapForm: data.swapFormInfo as PrefilledSwapForm,
            },
          },
        },
      });
    } catch (err: any) {
      if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
        setRejectedSwap(true);
        return;
      }

      if (err.type === CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SwapWidgetViews.PRICE_SURGE,
              data: data.swapFormInfo as PrefilledSwapForm,
            },
          },
        });
        return;
      }
      if (err.type === CheckoutErrorType.TRANSACTION_FAILED || err.type === CheckoutErrorType.INSUFFICIENT_FUNDS) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SwapWidgetViews.FAIL,
              reason: 'Transaction failed',
              data: data.swapFormInfo as PrefilledSwapForm,
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
  }, [checkout, provider, viewDispatch, setRejectedSwap, data.transaction, data.swapFormInfo]);

  const approveSpendingFooter = useMemo(() => (
    <FooterButton
      actionText={approveSpendingFooterText}
      onActionClick={handleApproveSpendingClick}
    />
  ), [approveSpendingFooterText, handleApproveSpendingClick]);

  const approveSwapFooter = useMemo(() => (
    <FooterButton
      actionText={approveSwapFooterText}
      onActionClick={handleApproveSwapClick}
    />
  ), [approveSwapFooterText, handleApproveSwapClick]);

  return (
    <SimpleLayout
      header={<HeaderNavigation transparent showBack onCloseButtonClick={sendSwapWidgetCloseEvent} />}
      floatHeader
      heroContent={showApproveSpendingStep ? <IMXCoinsHero /> : <ImmutableNetworkHero />}
      footer={showApproveSpendingStep ? approveSpendingFooter : approveSwapFooter}
    >
      {showApproveSpendingStep ? approveSpendContent : approveSwapContent}
    </SimpleLayout>
  );
}
