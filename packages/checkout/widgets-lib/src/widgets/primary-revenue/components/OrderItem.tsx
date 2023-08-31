import {
  //  Box, Body,
  MenuItem,
} from '@biom3/react';

export interface OrderItemProps {
  // FIXME: add type
  item: any;
  currency: string;
}

const currencyImageUrl = {
  eth: 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--eth.svg',
  usdc: 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--usdc.svg',
};

export function OrderItem(props: OrderItemProps) {
  const { item, currency } = props;
  const icon = currency.toLowerCase();

  return (
    <MenuItem emphasized size="small">
      <MenuItem.FramedImage imageUrl={item.image} />

      <MenuItem.Label>{item.name}</MenuItem.Label>
      <MenuItem.Caption>{item.description}</MenuItem.Caption>
      {item.price && (
        <MenuItem.PriceDisplay
          fiatAmount={item.price}
          price={`${currency} ${item.price}`}
          currencyImageUrl={currencyImageUrl[icon] || currencyImageUrl.eth}
        />
      )}
    </MenuItem>
  );

  // return (
  //   <MenuItem size="medium" emphasized>
  //     <MenuItem.FramedImage
  //       src={item.image}
  //     />
  //     <MenuItem.Label size="medium">{optionText.heading}</MenuItem.Label>
  //     <MenuItem.IntentIcon />
  //     <MenuItem.Caption>{optionText.caption}</MenuItem.Caption>
  //   </MenuItem>
  // );

  // return (
  //   <Box
  //     testId="order-list-item-container"
  //     sx={{
  //       width: '100%',
  //       display: 'flex',
  //       flexDirection: 'row',
  //       justifyContent: 'space-between',
  //       padding: '24px 16px 24px 16px',
  //       backgroundColor: 'base.color.translucent.emphasis.100',
  //       borderRadius: 'base.borderRadius.x6',
  //     }}
  //   >
  //     <Box
  //       sx={{
  //         width: '100%',
  //         display: 'flex',
  //         flexDirection: 'row',
  //         justifyContent: 'space-between',
  //         paddingX: 'base.spacing.x3',
  //         paddingY: 'base.spacing.x2',
  //       }}
  //     >
  //       <Body size="medium">{item.name}</Body>
  //       <Box
  //         sx={{
  //           display: 'flex',
  //           direction: 'row',
  //           columnGap: 'base.spacing.x1',
  //           alignItems: 'center',
  //         }}
  //       >
  //         <Body size="medium" weight="bold">
  //           {`${item.price} ${currency}`}
  //         </Body>
  //       </Box>
  //     </Box>
  //   </Box>
  // );
}
