import { useEffect, useState } from 'react';
import { Box } from '@biom3/react';

import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { WithCard } from '../components/WithCard';
import { useSaleContext } from '../context/SaleContextProvider';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';
import { useSaleEvent } from '../hooks/useSaleEvents';
import { SaleErrorTypes } from '../types';

export function PayWithCard() {
  const { sendPageView } = useSaleEvent();
  const [initialised, setInitialised] = useState(false);
  const { goBackToPaymentMethods, goToErrorView, goToSuccessView } = useSaleContext();
  const { sendOrderCreated } = useSaleEvent();

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
    const { nftDataBase64, quantity } = nftAssetInfo || {} as any;
    goToSuccessView({
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
    });
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
    const { nftDataBase64, quantity } = nftAssetInfo || {} as any;
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
      footer={<FooterLogo hideLogo={initialised} />}
    >
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
    </SimpleLayout>
  );
}
