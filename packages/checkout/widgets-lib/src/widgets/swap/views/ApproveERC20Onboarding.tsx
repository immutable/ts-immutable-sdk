import { Box } from '@biom3/react';
import {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { CheckoutErrorType, TokenInfo } from '@imtbl/checkout-sdk';
import { TransactionRequest } from '@ethersproject/providers';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { text } from '../../../resources/text/textConfig';
import {
  ApproveERC20SwapData,
  PrefilledSwapForm,
  SwapWidgetViews,
} from '../../../context/view-context/SwapViewContextTypes';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { SwapContext } from '../context/SwapContext';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { LoadingView } from '../../../views/loading/LoadingView';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { isPassportProvider } from '../../../lib/providerUtils';
import { SpendingCapHero } from '../../../components/Hero/SpendingCapHero';
import { WalletApproveHero } from '../../../components/Hero/WalletApproveHero';

export interface ApproveERC20Props {
  data: ApproveERC20SwapData;
}
export function ApproveERC20Onboarding({ data }: ApproveERC20Props) {
  const { swapState: { allowedTokens } } = useContext(SwapContext);
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const { viewDispatch } = useContext(ViewContext);
  const { approveSpending, approveSwap } = text.views[SwapWidgetViews.APPROVE_ERC20];

  const isPassport = isPassportProvider(provider);

  // Local state
  const [actionDisabled, setActionDisabled] = useState(false);
  const [approvalTxnLoading, setApprovalTxnLoading] = useState(false);
  const [showSwapTxnStep, setShowSwapTxnStep] = useState(false);
  const [loading, setLoading] = useState(false);
  // reject transaction flags
  const [rejectedSpending, setRejectedSpending] = useState(false);
  const [rejectedSwap, setRejectedSwap] = useState(false);

  // prepared transactions
  const [preparedApprovalTx, setPreparedApprovalTx] = useState<TransactionRequest>();
  const [preparedSwapTx, setPreparedSwapTx] = useState<TransactionRequest>();

  // Get symbol from swap info for approve amount text
  const fromToken = useMemo(
    () => allowedTokens.find(
      (token: TokenInfo) => token.address === data.swapFormInfo.fromContractAddress,
    ),
    [allowedTokens, data.swapFormInfo.fromContractAddress],
  );

  useEffect(() => {
    (async () => {
      if (!provider) return;
      try {
        setLoading(true);
        if (!showSwapTxnStep) {
          // prepare the approval tx here
          const updateTxRequest = await provider.getSigner().populateTransaction(data.approveTransaction);
          setPreparedApprovalTx(updateTxRequest);
        } else {
          // prepare the swap tx here
          const updateTxRequest = await provider.getSigner().populateTransaction(data.transaction);
          setPreparedSwapTx(updateTxRequest);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [provider, data, showSwapTxnStep, setPreparedApprovalTx, setPreparedSwapTx]);

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
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SwapWidgetViews.SWAP,
          data: data.swapFormInfo as PrefilledSwapForm,
        },
      },
    });
  }, [viewDispatch]);

  const handleExceptions = (err, swapFormData:PrefilledSwapForm) => {
    if (err.type === CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SwapWidgetViews.PRICE_SURGE,
            data: swapFormData,
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
            data: swapFormData,
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
    if (loading) return;
    setLoading(true);

    if (!checkout || !provider) {
      showErrorView();
      return;
    }
    if (actionDisabled) return;
    if (!preparedApprovalTx) {
      return;
    }

    setActionDisabled(true);
    try {
      const txnResult = await checkout.sendTransaction({
        provider,
        transaction: preparedApprovalTx,
      });

      setApprovalTxnLoading(true);
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

      setApprovalTxnLoading(false);
      setActionDisabled(false);
      setShowSwapTxnStep(true);
    } catch (err: any) {
      setApprovalTxnLoading(false);
      setActionDisabled(false);
      if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
        setRejectedSpending(true);
        return;
      }
      handleExceptions(err, data.swapFormInfo as PrefilledSwapForm);
    } finally {
      setLoading(false);
    }
  }, [
    checkout,
    provider,
    showErrorView,
    viewDispatch,
    setRejectedSwap,
    preparedApprovalTx,
    data.swapFormInfo,
    actionDisabled,
    setActionDisabled,
    setApprovalTxnLoading,
  ]);

  const approveSpendingContent = useMemo(() => {
    const { metamask, passport } = approveSpending.content;
    return (
      <SimpleTextBody heading={isPassport ? passport.heading : metamask.heading}>
        {isPassport && (<Box>{passport.body}</Box>)}
        {!isPassport
        // eslint-disable-next-line max-len
        && (<Box>{`${metamask.body[0]} ${data.swapFormInfo.fromAmount} ${fromToken?.symbol || ''} ${metamask.body[1]}`}</Box>)}
      </SimpleTextBody>
    );
  }, [data.swapFormInfo, fromToken, isPassport]);

  const approveSpendingFooter = useMemo(() => (
    <FooterButton
      loading={loading}
      actionText={rejectedSpending
        ? approveSpending.footer.retryText
        : approveSpending.footer.buttonText}
      onActionClick={handleApproveSpendingClick}
    />
  ), [rejectedSpending, handleApproveSpendingClick, loading]);

  /* ----------------- */
  // Approve swap step //
  /* ----------------- */

  const handleApproveSwapClick = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    if (!checkout || !provider) {
      showErrorView();
      return;
    }

    if (actionDisabled) return;

    setActionDisabled(true);

    if (!preparedSwapTx) {
      return;
    }

    try {
      const txn = await checkout.sendTransaction({
        provider,
        transaction: preparedSwapTx,
      });

      setActionDisabled(false);

      // user approves swap
      // go to the Swap In Progress View
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
      setActionDisabled(false);
      if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
        setRejectedSwap(true);
        return;
      }
      handleExceptions(err, data.swapFormInfo as PrefilledSwapForm);
    } finally {
      setLoading(false);
    }
  }, [
    checkout,
    provider,
    showErrorView,
    viewDispatch,
    setRejectedSwap,
    preparedSwapTx,
    data.swapFormInfo,
    actionDisabled,
    setActionDisabled,
  ]);

  const approveSwapContent = (
    <SimpleTextBody heading={approveSwap.content.heading}>
      <Box>{approveSwap.content.body}</Box>
    </SimpleTextBody>
  );

  const approveSwapFooter = useMemo(() => (
    <FooterButton
      loading={loading}
      actionText={rejectedSwap
        ? approveSwap.footer.retryText
        : approveSwap.footer.buttonText}
      onActionClick={handleApproveSwapClick}
    />
  ), [rejectedSwap, handleApproveSwapClick, loading]);

  return (
    <>
      {approvalTxnLoading && (<LoadingView loadingText={approveSpending.loading.text} showFooterLogo />)}
      {!approvalTxnLoading && (
        <SimpleLayout
          header={(
            <HeaderNavigation
              transparent
              showBack
              onCloseButtonClick={sendSwapWidgetCloseEvent}
              onBackButtonClick={goBackWithSwapData}
            />
)}
          floatHeader
          heroContent={showSwapTxnStep ? <WalletApproveHero /> : <SpendingCapHero />}
          footer={showSwapTxnStep ? approveSwapFooter : approveSpendingFooter}
        >
          {showSwapTxnStep ? approveSwapContent : approveSpendingContent}
        </SimpleLayout>
      )}
    </>
  );
}
