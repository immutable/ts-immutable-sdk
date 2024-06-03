import {
  Heading, MenuItem, MenuItemSize, SxProps,
} from '@biom3/react';
import { SaleItem } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { calculateCryptoToFiat, tokenValueFormat } from 'lib/utils';
import { ReactElement } from 'react';
import { TokenImage } from 'components/TokenImage/TokenImage';
import { OrderQuotePricing, FundingBalance } from '../types';

export interface OrderItemProps<
  RC extends ReactElement | undefined = undefined,
> {
  item: SaleItem;
  balance: FundingBalance;
  pricing: OrderQuotePricing | undefined;
  conversions: Map<string, number>;
  size?: MenuItemSize;
  rc?: RC;
  sx?: SxProps;
}

export function OrderItem<RC extends ReactElement | undefined = undefined>({
  item,
  balance,
  pricing,
  conversions,
  size,
  sx,
  rc = <span />,
}: OrderItemProps<RC>) {
  const { t } = useTranslation();

  const { token } = balance.fundingItem;
  const amount = pricing?.amount || 0;

  const fiatAmount = calculateCryptoToFiat(
    amount.toString(),
    token.symbol,
    conversions,
  );

  return (
    <MenuItem
      rc={rc}
      emphasized
      size={size || 'medium'}
      key={item.name}
      sx={{
        pointerEvents: 'none',
        mb: 'base.spacing.x1',
        ...sx,
      }}
    >
      <MenuItem.FramedImage
        use={<TokenImage src={item.image} name={item.name} defaultImage={item.image} />}
      />
      <MenuItem.Label>{item.name}</MenuItem.Label>
      <MenuItem.Caption>
        {t('views.ORDER_SUMMARY.orderItem.quantity', { qty: item.qty })}
      </MenuItem.Caption>
      {amount > 0 && (
        <MenuItem.PriceDisplay
          use={<Heading size="xSmall" />}
          price={t('views.ORDER_SUMMARY.currency.price', {
            symbol: token.symbol,
            amount: tokenValueFormat(amount),
          })}
          fiatAmount={t('views.ORDER_SUMMARY.currency.fiat', {
            amount: fiatAmount,
          })}
        />
      )}
    </MenuItem>
  );
}
