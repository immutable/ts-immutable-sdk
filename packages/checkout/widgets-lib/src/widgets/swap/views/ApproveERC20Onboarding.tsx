import { Box } from '@biom3/react';
import {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { CheckoutErrorType, TokenInfo } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
import { FooterButton } from '../../../components/Footer/FooterButton';
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
import { SpendingCapHero } from '../../../components/Hero/SpendingCapHero';
import { WalletApproveHero } from '../../../components/Hero/WalletApproveHero';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { isPassportProvider } from '../../../lib/provider';

export interface ApproveERC20Props {
  data: ApproveERC20SwapData;
}
export function ApproveERC20Onboarding({ data }: ApproveERC20Props) {
  const { t } = useTranslation();
  const { swapState: { allowedTokens } } = useContext(SwapContext);
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const { viewDispatch } = useContext(ViewContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const isPassport = isPassportProvider(provider);
  const noApprovalTransaction = data.approveTransaction === undefined;

  // Local state
  const [actionDisabled, setActionDisabled] = useState(false);
  const [approvalTxnLoading, setApprovalTxnLoading] = useState(false);
  const [showSwapTxnStep, setShowSwapTxnStep] = useState(noApprovalTransaction);
  const [loading, setLoading] = useState(false);
  // reject transaction flags
  const [rejectedSpending, setRejectedSpending] = useState(false);
  const [rejectedSwap, setRejectedSwap] = useState(false);

  const { page, track } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.SWAP,
      screen: 'ApproveERC20',
      extras: {
        swapFormInfo: data.swapFormInfo,
      },
    });
  }, []);

  // Get symbol from swap info for approve amount text
  const fromToken = useMemo(
    () => allowedTokens.find(
      (token: TokenInfo) => token.address === data.swapFormInfo.fromTokenAddress,
    ),
    [allowedTokens, data.swapFormInfo.fromTokenAddress],
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

    // eslint-disable-next-line no-console
    console.error('Approve ERC20 failed', err);
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

  const prepareTransaction = (transaction, isGasFree = false) => ({
    ...transaction,
    gasPrice: (isGasFree ? BigInt(0) : undefined),
  });

  /* --------------------- */
  // Approve spending step //
  /* --------------------- */

  const handleApproveSpendingClick = useCallback(async () => {
    if (loading) return;
    track({
      userJourney: UserJourney.SWAP,
      screen: 'ApproveERC20',
      control: 'ApproveSpending',
      controlType: 'Button',
      extras: {
        autoProceed: data.autoProceed,
      },
    });
    setLoading(true);

    if (!checkout || !provider) {
      showErrorView();
      return;
    }
    if (actionDisabled) return;

    setActionDisabled(true);
    try {
      const txnResult = await checkout.sendTransaction({
        provider,
        transaction: prepareTransaction(data.approveTransaction, isPassport),
      });

      setApprovalTxnLoading(true);
      const approvalReceipt = await txnResult.transactionResponse.wait();

      if (approvalReceipt?.status !== 1) {
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
    data.approveTransaction,
    data.swapFormInfo,
    actionDisabled,
    setActionDisabled,
    setApprovalTxnLoading,
  ]);

  const approveSpendingContent = useMemo(
    () => (
      <SimpleTextBody
        heading={t(`views.APPROVE_ERC20.approveSpending.content.${isPassport ? 'passport' : 'metamask'}.heading`)}
      >
        {isPassport && (<Box>{t('views.APPROVE_ERC20.approveSpending.content.passport.body')}</Box>)}
        {!isPassport
      // eslint-disable-next-line max-len
      && (
        <Box>
          {t(
            'views.APPROVE_ERC20.approveSpending.content.metamask.body',
            { amount: `${data.swapFormInfo.fromAmount} ${fromToken?.symbol || ''}` },
          )}
        </Box>
      )}
      </SimpleTextBody>
    ),
    [data.swapFormInfo, fromToken, isPassport],
  );

  const approveSpendingFooter = useMemo(() => (
    <FooterButton
      loading={loading}
      actionText={t(rejectedSpending
        ? 'views.APPROVE_ERC20.approveSpending.footer.retryText'
        : 'views.APPROVE_ERC20.approveSpending.footer.buttonText')}
      onActionClick={handleApproveSpendingClick}
    />
  ), [rejectedSpending, handleApproveSpendingClick, loading]);

  /* ----------------- */
  // Approve swap step //
  /* ----------------- */

  const handleApproveSwapClick = useCallback(async () => {
    if (loading) return;
    track({
      userJourney: UserJourney.SWAP,
      screen: 'ApproveERC20',
      control: 'ApproveSwap',
      controlType: 'Button',
      extras: {
        autoProceed: data.autoProceed,
      },
    });
    setLoading(true);

    if (!checkout || !provider) {
      showErrorView();
      return;
    }

    if (actionDisabled) return;

    setActionDisabled(true);

    try {
      const txn = await checkout.sendTransaction({
        provider,
        transaction: prepareTransaction(data.transaction, isPassport),
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
    data.transaction,
    data.swapFormInfo,
    actionDisabled,
    setActionDisabled,
  ]);

  const approveSwapContent = (
    <SimpleTextBody heading={t('views.APPROVE_ERC20.approveSwap.content.heading')}>
      <Box>{t('views.APPROVE_ERC20.approveSwap.content.body')}</Box>
    </SimpleTextBody>
  );

  const approveSwapFooter = useMemo(() => (
    <FooterButton
      loading={loading}
      actionText={t(rejectedSwap
        ? 'views.APPROVE_ERC20.approveSwap.footer.retryText'
        : 'views.APPROVE_ERC20.approveSwap.footer.buttonText')}
      onActionClick={handleApproveSwapClick}
    />
  ), [rejectedSwap, handleApproveSwapClick, loading]);

  return (
    <>
      {approvalTxnLoading && (
        <LoadingView loadingText={t('views.APPROVE_ERC20.approveSpending.loading.text')} />
      )}
      {!approvalTxnLoading && (
        <SimpleLayout
          header={(
            <HeaderNavigation
              transparent
              showBack
              onCloseButtonClick={() => sendSwapWidgetCloseEvent(eventTarget)}
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
