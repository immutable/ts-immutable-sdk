import { Box } from '@biom3/react';
import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
import { Transaction } from 'lib/clients';
import { getChainNameById } from 'lib/chains';
import { getL1ChainId } from 'lib';
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
import { FooterLogo } from '../../../components/Footer/FooterLogo';

export interface ClaimWithdrawalProps {
  transaction: Transaction
}
export function ClaimWithdrawal({ transaction }: ClaimWithdrawalProps) {
  const { t } = useTranslation();
  const { bridgeState: { checkout, tokenBridge, web3Provider } } = useContext(BridgeContext);
  const { viewDispatch } = useContext(ViewContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { page } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.BRIDGE,
      screen: 'ApproveTransaction',
    });
  }, []);

  // Local state
  const [actionDisabled, setActionDisabled] = useState(false);
  const [txProcessing, setTxProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasWithdrawError, setHasWithdrawError] = useState(false);

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

  const handleWithdrawalClaimClick = async () => {
    if (!tokenBridge || !web3Provider) return;

    setTxProcessing(true);

    console.log('clicked continue to withdraw claim');
    console.log('for transaction', transaction);

    // get withdrawal transaction from the token bridge by receipient address and index
    let unsignedWithdrawalTxn;
    try {
      console.log('fetching flow rate withdraw txn');
      const flowRateWithdrawTxnResponse = await tokenBridge?.getFlowRateWithdrawTx({
        recipient: transaction.details.to_address,
        index: 0,
      });

      unsignedWithdrawalTxn = flowRateWithdrawTxnResponse.unsignedTx;
      console.log('unsignedWithdrawalTxn', unsignedWithdrawalTxn);
    } catch (err) {
      // console.error(
      //   `Failed to get withdrawal transaction for recipient: ${transaction.details.to_address} and index: 0`,
      // );
      setHasWithdrawError(true);
      setTxProcessing(false);
      return;
    }

    setTxProcessing(false);

    // send transaction to wallet for signing
    try {
      const response = checkout.sendTransaction({
        provider: web3Provider,
        transaction: unsignedWithdrawalTxn,
      });
      console.log('response', response);
    } catch (error) {
      // console.error(error);
      setHasWithdrawError(true);
    }
  };

  return (
    <>
      {loading && (<LoadingView loadingText={t('views.APPROVE_TRANSACTION.loadingView.text')} showFooterLogo />)}
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
                actionText={t(`views.CLAIM_WITHDRAWAL.${hasWithdrawError ? 'footer.retryText' : 'footer.buttonText'}`)}
                onActionClick={handleWithdrawalClaimClick}
                variant="primary"
              />
              <FooterLogo />
            </Box>
          )}
        >
          <SimpleTextBody
            heading={
              `${t('views.CLAIM_WITHDRAWAL.content.heading')} ${getChainNameById(getL1ChainId(checkout.config))}`
            }
          >
            <Box>{t('views.CLAIM_WITHDRAWAL.content.body')}</Box>
            <Box>{`${t('views.CLAIM_WITHDRAWAL.content.body2')} 0x1234...5678`}</Box>
          </SimpleTextBody>
        </SimpleLayout>
      )}
    </>
  );
}
