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
}
