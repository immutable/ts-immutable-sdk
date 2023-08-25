/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-unused-vars */

import { Body, Box, Button } from '@biom3/react';

import { useEffect, useState } from 'react';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text } from '../../../resources/text/textConfig';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { OrderList } from '../components/OrderList';

const mockOrderItems: any[] = [
  {
    name: 'Gems Chest',
    contract_address: '0x18ea1d312a4037B8676c760AbfD7D1DBE65486a1',
    token_id: '0x123',
    image: 'https://via.placeholder.com/150',
    chain: {
      id: '5',
      name: 'goerli',
    },
    metadata_synced_at: '2021-09-01T00:00:00.000Z',
    indexed_at: '2023-09-01T00:00:00.000Z',
    external_link: 'https://via.placeholder.com/150',
    description: 'NFT 1',
    animation_url: 'https://via.placeholder.com/150',
    youtube_url: 'https://via.placeholder.com/150',
    mint_activity_id: '1',
    price: '0.0001',
    currency: 'ETH',
  },
  {
    name: 'Redstone Chest',
    contract_address: '0x18ea1d312a4037B8676c760AbfD7D1DBE65486a1',
    token_id: '0x123',
    image: 'https://via.placeholder.com/151',
    chain: {
      id: '5',
      name: 'goerli',
    },
    metadata_synced_at: '2021-09-01T00:00:00.000Z',
    indexed_at: '2023-09-01T00:00:00.000Z',
    external_link: 'https://via.placeholder.com/151',
    description: 'NFT 2',
    animation_url: 'https://via.placeholder.com/151',
    youtube_url: 'https://via.placeholder.com/151',
    mint_activity_id: '2',
    price: '0.0002',
    currency: 'ETH',
  },
];

export interface ReviewOrderProps {
  currency?: string;
}

export function ReviewOrder(props: ReviewOrderProps) {
  const { header } = text.views[PrimaryRevenueWidgetViews.REVIEW_ORDER];
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const { currency } = props;

  useEffect(() => {
    // TODO: fetch the order from the BE
    // mock order list
    const items = mockOrderItems;

    setOrderItems(items);

    // calculate total price
    const calculatedTotalPrice = items.reduce(
      (total, item) => parseFloat((total + parseFloat(item.price)).toFixed(5)),
      0,
    );
    setTotalPrice(calculatedTotalPrice);
  });

  const proceedToPayment = () => {
    // approve with passport
  };

  return (
    <SimpleLayout
      testId="review-order-view"
      header={
        <HeaderNavigation title={header.heading} onCloseButtonClick={() => {}} />
      }
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
          <OrderList list={orderItems} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            paddingY: 'base.spacing.x6',
            paddingX: 'base.spacing.x4',
            backgroundColor: 'base.color.translucent.emphasis.200',
          }}
        >
          <Button
            testId="pay-now-button"
            variant="primary"
            onClick={proceedToPayment}
            size="large"
          >
            Pay Now
          </Button>
          <Body>{`${totalPrice} ${currency ?? 'ETH'}`}</Body>
        </Box>
      </Box>
    </SimpleLayout>
  );
}
