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
  const price = item.amount.reduce((v, p) => v + p, 0).toString();

  return (
    <MenuItem emphasized size="small" sx={{ pointerEvents: 'none', userSelect: 'none' }}>
      <MenuItem.FramedImage imageUrl={item.image} />
      <MenuItem.Label>{`${item.name}${item.qty > 1 ? ` x${item.qty}` : ''}`}</MenuItem.Label>
      <MenuItem.Caption>{item.description}</MenuItem.Caption>
      {item.amount && (
        <MenuItem.PriceDisplay
          fiatAmount={`USD $${price}`}
          price={`${item.currency} ${price}`}
          currencyImageUrl={currencyIcon}
        />
      )}
    </MenuItem>
  );
}
