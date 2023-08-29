import { Box, Body } from '@biom3/react';

export interface OrderItemProps {
  item: any;
}

export function OrderItem(props: OrderItemProps) {
  const { item } = props;

  return (
    <Box
      testId="order-list-item-container"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '24px 16px 24px 16px',
        backgroundColor: 'base.color.translucent.emphasis.100',
        borderRadius: 'base.borderRadius.x6',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingX: 'base.spacing.x3',
          paddingY: 'base.spacing.x2',
        }}
      >
        <Body size="medium">{item.name}</Body>
        <Box
          sx={{
            display: 'flex',
            direction: 'row',
            columnGap: 'base.spacing.x1',
            alignItems: 'center',
          }}
        >
          <Body size="medium" weight="bold">
            {`${item.price} ${item.currency}`}
          </Body>
        </Box>
      </Box>
    </Box>
  );
}
