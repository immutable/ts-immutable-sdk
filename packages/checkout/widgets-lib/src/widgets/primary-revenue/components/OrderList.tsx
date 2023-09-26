import { Box } from '@biom3/react';
import { OrderItem } from './OrderItem';

import { SignedOrderProduct } from '../types';

export interface OrderListProps {
  items: SignedOrderProduct[] | undefined;
}

export function OrderList(props: OrderListProps) {
  const { items } = props;

  return (
    <Box
      testId="order-list"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      {items
        ? items.map((item) => (
          <OrderItem key={`${item.name}${item.tokenId[0]}`} item={item} />
        ))
        : null}
    </Box>
  );
}
