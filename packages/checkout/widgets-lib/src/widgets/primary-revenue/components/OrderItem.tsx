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
        backgroundColor: 'base.color.neutral.800',
        paddingTop: 'base.spacing.x4',
        paddingBottom: 'base.spacing.x1',
        paddingX: 'base.spacing.x1',
        borderRadius: 'base.borderRadius.x6',
      }}
    >
      <Box
        sx={{
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
