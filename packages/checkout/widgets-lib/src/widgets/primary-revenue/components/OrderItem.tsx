import {
  //  Box, Body,
  MenuItem,
} from '@biom3/react';
import { MergedItemsDetails } from '../hooks/useMergedItemsInfo';

export interface OrderItemProps {
  // FIXME: add type
  item: MergedItemsDetails;
}

const currencyImageUrl = {
  eth: 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--eth.svg',
  usdc: 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--usdc.svg',
};

export function OrderItem(props: OrderItemProps) {
  const { item } = props;

  return (
    <MenuItem emphasized size="small">
      <MenuItem.FramedImage imageUrl={item.image} />
      <MenuItem.Label>{item.name}</MenuItem.Label>
      <MenuItem.Caption>{item.description}</MenuItem.Caption>
      {item.amount && (
        <MenuItem.PriceDisplay
          fiatAmount={item.amount.toString()}
          price={`${item.currency} ${item.amount}`}
          currencyImageUrl={
            currencyImageUrl[item.currency.toLowerCase()]
            || currencyImageUrl.eth
          }
        />
      )}
    </MenuItem>
  );
}
