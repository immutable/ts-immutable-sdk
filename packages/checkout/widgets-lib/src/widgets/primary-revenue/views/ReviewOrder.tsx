/* eslint-disable @typescript-eslint/naming-convention */
import { useContext, useState } from 'react';
import { Body, Box, Button } from '@biom3/react';
import { PrimaryRevenueSuccess } from '@imtbl/checkout-widgets';

import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text } from '../../../resources/text/textConfig';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { OrderList } from '../components/OrderList';
import {
  sendPrimaryRevenueFailedEvent,
  sendPrimaryRevenueSuccessEvent,
  sendPrimaryRevenueWidgetCloseEvent,
} from '../PrimaryRevenuWidgetEvents';
import { ViewContext } from '../../../context/view-context/ViewContext';
import { Item, useMergeItemsInfo } from '../hooks/useMergeItemsInfo';

export interface ReviewOrderProps {
  execute: () => Promise<PrimaryRevenueSuccess>;
  currency: string;
  items: Item[];
}

export function ReviewOrder(props: ReviewOrderProps) {
  const { currency, execute, items } = props;
  const { header } = text.views[PrimaryRevenueWidgetViews.REVIEW_ORDER];
  const [loading, setLoading] = useState(false);

  const { viewState } = useContext(ViewContext);
  const mergedItemsList = useMergeItemsInfo(items, viewState.view.data);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const transactionHashes = await execute();
      sendPrimaryRevenueSuccessEvent(transactionHashes);
    } catch (error) {
      sendPrimaryRevenueFailedEvent((error as Error).message);
    }

    setLoading(false);
  };

  return (
    <SimpleLayout
      testId="review-order-view"
      header={(
        <HeaderNavigation
          title={header.heading}
          onCloseButtonClick={() => sendPrimaryRevenueWidgetCloseEvent()}
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
          <OrderList items={mergedItemsList} />
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
              'Buy Now'
            )}
          </Button>
          <Body>
            {viewState.view.data && viewState.view.data.order.total_amount
              ? `${viewState.view.data.order.total_amount} ${currency}`
              : ''}
          </Body>
        </Box>
      </Box>
    </SimpleLayout>
  );
}
