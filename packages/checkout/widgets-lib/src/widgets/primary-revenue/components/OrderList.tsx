import { Box } from '@biom3/react';

import { OrderItem } from './OrderItem';

export interface OrderListProps {
  currency: string;
  items: any[];
}

export function OrderList(props: OrderListProps) {
  const { items, currency } = props;
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
      {items.map((item) => (
        <OrderItem key={item.token_id} currency={currency} item={item} />
      ))}
    </Box>
  );
}
