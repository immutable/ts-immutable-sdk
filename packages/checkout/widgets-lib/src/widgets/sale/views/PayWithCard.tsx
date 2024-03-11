import { useEffect, useState } from 'react';
import { Box, LoadingOverlay } from '@biom3/react';

import { useTranslation } from 'react-i18next';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { WithCard } from '../components/WithCard';
import { useSaleContext } from '../context/SaleContextProvider';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleEvent } from '../hooks/useSaleEvents';
import { SaleErrorTypes } from '../types';

export function PayWithCard() {
  const { sendPageView } = useSaleEvent();
  const [initialised, setInitialised] = useState(false);
  const {
    goBackToPaymentMethods, goToErrorView, signResponse: signData, signTokenIds,
  } = useSaleContext();
  const { sendOrderCreated, sendCloseEvent, sendSuccessEvent } = useSaleEvent();
  const { t } = useTranslation();

  const onInit = () => setInitialised(true);

  const onOrderFailed = () => {
    goToErrorView(SaleErrorTypes.TRANSAK_FAILED);
  };

  const onOrderProcessing = (data: Record<string, unknown> = {}) => {
    const {
      id: orderId,
      status: orderStatus,
      cryptoAmount,
      cryptoCurrency,
      fiatAmount,
      fiatAmountInUsd,
      amountPaid,
      totalFeeInFiat,
      paymentOptionId: paymentOption,
      userId,
      userKycType,
      walletAddress,
      nftAssetInfo,
    } = data;
    const { nftDataBase64, quantity } = nftAssetInfo || ({} as any);
    const details = {
      orderId,
      orderStatus,
      cryptoAmount,
      cryptoCurrency,
      fiatAmount,
      fiatAmountInUsd,
      amountPaid,
      totalFeeInFiat,
      paymentOption,
      userId,
      userKycType,
      walletAddress,
      nftDataBase64,
      quantity,
      signData,
    };

    sendSuccessEvent(SaleWidgetViews.SALE_SUCCESS, [], signTokenIds, details);
    sendCloseEvent(SaleWidgetViews.SALE_SUCCESS);
  };

  const onOrderCreated = (data: Record<string, unknown> = {}) => {
    const {
      id: orderId,
      status: orderStatus,
      cryptoAmount,
      cryptoCurrency,
      fiatAmount,
      fiatAmountInUsd,
      amountPaid,
      totalFeeInFiat,
      paymentOptionId: paymentOption,
      userId,
      userKycType,
      walletAddress,
      nftAssetInfo,
    } = data;
    const { nftDataBase64, quantity } = nftAssetInfo || ({} as any);
    sendOrderCreated(SaleWidgetViews.PAY_WITH_CARD, {
      orderId,
      orderStatus,
      cryptoAmount,
      cryptoCurrency,
      fiatAmount,
      fiatAmountInUsd,
      amountPaid,
      totalFeeInFiat,
      paymentOption,
      userId,
      userKycType,
      walletAddress,
      nftDataBase64,
      quantity,
      signData,
    });
  };

  useEffect(() => sendPageView(SaleWidgetViews.PAY_WITH_CARD), []);

  return (
    <SimpleLayout
      header={
        initialised && (
          <HeaderNavigation
            onCloseButtonClick={() => goBackToPaymentMethods()}
          />
        )
      }
    >
      <>
        <LoadingOverlay visible={!initialised}>
          <LoadingOverlay.Content>
            <LoadingOverlay.Content.LoopingText
              text={[t('views.PAY_WITH_CARD.loading')]}
            />
          </LoadingOverlay.Content>
        </LoadingOverlay>
        <Box
          style={{
            display: 'block',
            position: 'relative',
            maxWidth: '420px',
            height: '565px',
            borderRadius: '1%',
            overflow: 'hidden',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <WithCard
            onInit={onInit}
            onOrderFailed={onOrderFailed}
            onOrderCompleted={onOrderProcessing}
            onOrderCreated={onOrderCreated}
            onOrderProcessing={onOrderProcessing}
          />
        </Box>
      </>
    </SimpleLayout>
  );
}
