/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */

import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { Body, Box, Button } from '@biom3/react';

import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text as textConfig } from '../../../resources/text/textConfig';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { OrderList } from '../components/OrderList';
import { ViewContext } from '../../../context/view-context/ViewContext';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';
import { useSharedContext } from '../context/SharedContextProvider';
import { PaymentTypes } from '../types';

type PayWithCoinsProps = {
  config: StrongCheckoutWidgetsConfig
};

export function PayWithCoins(props: PayWithCoinsProps) {
  const text = textConfig.views[PrimaryRevenueWidgetViews.PAY_WITH_COINS];
  const [loading, setLoading] = useState(false);
  const { viewState } = useContext(ViewContext);
  const {
    sign, execute, signResponse, fromCurrency,
  } = useSharedContext();

  const handlePayment = useCallback(async () => {
    setLoading(true);
    try {
      const transactionHashes = await execute();
      // sendPrimaryRevenueSuccessEvent(transactionHashes);
    } catch (error) {
      // sendPrimaryRevenueFailedEvent((error as Error).message);
    }

    setLoading(false);
  }, [execute]);

  useEffect(() => {
    sign(PaymentTypes.CRYPTO);
  }, [sign]);

  return (
    <SimpleLayout
      testId="review-order-view"
      header={(
        <HeaderNavigation
          title={text.header.heading}
          onCloseButtonClick={() => {}}
        />
      )}
      footer={<FooterLogo />}
      footerBackgroundColor="base.color.translucent.emphasis.200"
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            paddingX: 'base.spacing.x2',
            rowGap: 'base.spacing.x9',
          }}
        >
          <OrderList items={signResponse?.order.products} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            paddingY: 'base.spacing.x6',
            paddingX: 'base.spacing.x4',
            backgroundColor: 'base.color.translucent.emphasis.200',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            disabled={loading}
            testId="pay-now-button"
            variant="primary"
            onClick={handlePayment}
            size="large"
          >
            {loading ? (
              <Button.Icon
                icon="Loading"
                sx={{ width: 'base.icon.size.400' }}
              />
            ) : (
              text.button.buyNow
            )}
          </Button>
          <Body>
            {viewState.view.data && viewState.view.data.order.total_amount
              ? `${viewState.view.data.order.total_amount} ${fromCurrency}`
              : ''}
          </Body>
        </Box>
      </Box>
    </SimpleLayout>
  );
}
