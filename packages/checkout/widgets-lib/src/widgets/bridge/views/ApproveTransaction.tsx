import { Box } from '@biom3/react';
import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { CheckoutErrorType } from '@imtbl/checkout-sdk';
import { ApproveBridgeResponse, BridgeTxResponse } from '@imtbl/bridge-sdk';
import { useTranslation } from 'react-i18next';
import { parseUnits } from 'ethers';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { LoadingView } from '../../../views/loading/LoadingView';
import { BridgeContext } from '../context/BridgeContext';
import { WalletApproveHero } from '../../../components/Hero/WalletApproveHero';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { NATIVE } from '../../../lib';
import { getErc20Contract } from '../functions/TransferErc20';

export interface BridgeTransaction {
  approveTransaction: ApproveBridgeResponse;
  transaction: BridgeTxResponse;
}

/**
 * @param bridgeTransaction if provided the transaction is a bridge, if not it's a transfer
 */
export interface ApproveTransactionProps {
  bridgeTransaction: BridgeTransaction | undefined;
}

export function ApproveTransaction({ bridgeTransaction }: ApproveTransactionProps) {
  const { t } = useTranslation();
  const { bridgeState } = useContext(BridgeContext);
  const {
    checkout,
    from,
    to,
    token,
    amount,
  } = bridgeState;
  const { viewDispatch } = useContext(ViewContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { page } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.BRIDGE,
      screen: 'ApproveTransaction',
      extras: {
        moveType: bridgeTransaction ? 'bridge' : 'transfer',
      },
    });
  }, []);

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
            type: BridgeWidgetViews.BRIDGE_FAILURE,
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
            type: BridgeWidgetViews.BRIDGE_FAILURE,
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

  const handleApproveTransferClick = useCallback(async () => {
    if (!checkout || !from?.web3Provider) {
      showErrorView();
      return;
    }

    if (actionDisabled) return;
    setActionDisabled(true);
    setTxProcessing(true);
    const tokenToTransfer = token?.address?.toLowerCase() ?? NATIVE.toUpperCase();
    let txHash: string;
    try {
      if (tokenToTransfer === NATIVE.toLowerCase()) {
        const request = {
          to: to?.walletAddress,
          value: parseUnits(amount, token?.decimals),
        };
        const result = await checkout.sendTransaction({
          provider: from.web3Provider,
          transaction: request,
        });
        txHash = result.transactionResponse.hash;
      } else {
        const erc20 = getErc20Contract(tokenToTransfer, await from.web3Provider.getSigner());
        const parsedAmount = parseUnits(amount, token?.decimals);
        const response = await checkout.providerCall(
          from.web3Provider,
          async () => await erc20.transfer(to?.walletAddress, parsedAmount),
        );
        txHash = response.hash;
      }
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: BridgeWidgetViews.IN_PROGRESS,
            transactionHash: txHash,
            isTransfer: true,
          },
        },
      });
    } catch (e: any) {
      setTxProcessing(false);
      if (e.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
        setRejectedBridge(true);
      } else {
        handleExceptions(e);
      }
    } finally {
      setActionDisabled(false);
    }
  }, [
    checkout,
    from,
    showErrorView,
    viewDispatch,
    actionDisabled,
  ]);

  const handleApproveBridgeClick = useCallback(async () => {
    let bridgeRejected = false;
    // Force unwrap as bridgeTransaction being defined is a requirement for this callback to be invoked
    const { approveTransaction, transaction } = bridgeTransaction!;
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
        if (approvalReceipt?.status !== 1) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: BridgeWidgetViews.BRIDGE_FAILURE,
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
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: BridgeWidgetViews.IN_PROGRESS,
            transactionHash: sendResult.transactionResponse.hash,
            isTransfer: false,
          },
        },
      });

      const receipt = await sendResult.transactionResponse.wait();
      if (receipt?.status === 0) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: BridgeWidgetViews.BRIDGE_FAILURE,
              reason: 'Approval transaction failed to settle on chain',
            },
          },
        });
      }
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
    bridgeTransaction,
    actionDisabled,
  ]);

  return (
    <>
      {loading && (<LoadingView loadingText={t('views.APPROVE_TRANSACTION.loadingView.text')} />)}
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
                actionText={t(`views.APPROVE_TRANSACTION.${rejectedBridge ? 'footer.retryText' : 'footer.buttonText'}`)}
                onActionClick={bridgeTransaction ? handleApproveBridgeClick : handleApproveTransferClick}
              />
              <FooterLogo />
            </Box>
          )}
        >
          <SimpleTextBody heading={t('views.APPROVE_TRANSACTION.content.heading')}>
            <Box>{t('views.APPROVE_TRANSACTION.content.body')}</Box>
          </SimpleTextBody>
        </SimpleLayout>
      )}
    </>
  );
}
