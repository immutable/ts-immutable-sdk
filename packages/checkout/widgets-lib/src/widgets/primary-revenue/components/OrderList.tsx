import { Box } from '@biom3/react';

import { OrderItem } from './OrderItem';

export interface OrderListProps {
  list: any[];
}

export function OrderList(props: OrderListProps) {
  const { list } = props;

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
      {list.map((item) => (
        <OrderItem item={item} key={item.token_id} />
      ))}
    </Box>
  );
}
