/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-unused-vars */

import { Box, Button } from '@biom3/react';

import { useEffect, useState } from 'react';
import { NFT } from '@imtbl/generated-clients/dist/multi-rollup';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text } from '../../../resources/text/textConfig';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { OrderList } from '../components/OrderList';

const mockOrderItems: NFT[] = [
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
  },
];

export function ReviewOrder() {
  const { header } = text.views[PrimaryRevenueWidgetViews.REVIEW_ORDER];
  const [orderItems, setOrderItems] = useState<NFT[]>([]);

  useEffect(() => {
    // TODO: fetch the order from the BE
    // mock order list
    const items = mockOrderItems;

    setOrderItems(items);

    // simulate loading time
    // setTimeout(() => {});
  });

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
            // disabled={loading}
            variant="primary"
            // onClick={sendTransaction}
            size="large"
          >
            {/* {loading ? (
            <Button.Icon icon="Loading" sx={swapButtonIconLoadingStyle} />
          ) : (
            buttonText
          )} */}
            Pay Now
          </Button>
        </Box>
      </Box>
    </SimpleLayout>
  );
}
