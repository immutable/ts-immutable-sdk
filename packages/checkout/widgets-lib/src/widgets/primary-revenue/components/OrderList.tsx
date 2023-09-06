import { Box } from '@biom3/react';

import { useEffect } from 'react';
import { OrderItem } from './OrderItem';
import { MergedItemsDetails } from '../hooks/useMergedItemsInfo';

export interface OrderListProps {
  items: MergedItemsDetails[] | null;
}

export function OrderList(props: OrderListProps) {
  const { items } = props;
  useEffect(() => {
    console.log('@@@@@@@@@@@@@@ items', items);
  }, [items]);

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
        ? items.map((item: MergedItemsDetails) => (
          <OrderItem
            key={item.tokenId}
            item={item}
          />
        ))
        : null}
    </Box>
  );
}
