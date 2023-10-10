import { MenuItem } from '@biom3/react';
import { SignedOrderProduct } from '../types';

export interface OrderItemProps {
  item: SignedOrderProduct;
}

const CURRENCY_IMAGE_URL = {
  eth: 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--eth.svg',
  usdc: 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--usdc.svg',
};

export function OrderItem(props: OrderItemProps) {
  const { item } = props;
  const currencyIcon = CURRENCY_IMAGE_URL[item.currency.toLowerCase()] || CURRENCY_IMAGE_URL.eth;

  return (
    <MenuItem emphasized size="small" sx={{ pointerEvents: 'none', userSelect: 'none' }}>
      <MenuItem.FramedImage imageUrl={item.image} />
      <MenuItem.Label>{item.name}</MenuItem.Label>
      <MenuItem.Caption>{item.description}</MenuItem.Caption>
      {item.amount && (
        <MenuItem.PriceDisplay
          fiatAmount={item.amount.toString()}
          price={`${item.currency} ${item.amount}`}
          currencyImageUrl={currencyIcon}
        />
      )}
    </MenuItem>
  );
}
