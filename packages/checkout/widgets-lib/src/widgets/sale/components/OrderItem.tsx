import { Heading, MenuItem } from '@biom3/react';
import { SaleItem } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { calculateCryptoToFiat, tokenValueFormat } from 'lib/utils';
import { ReactElement } from 'react';
import { FundingBalance } from '../types';

export interface OrderItemProps<
  RC extends ReactElement | undefined = undefined,
> {
  item: SaleItem;
  balance: FundingBalance;
  conversions: Map<string, number>;
  rc?: RC;
}

export function OrderItem<RC extends ReactElement | undefined = undefined>({
  item,
  balance,
  conversions,
  rc = <span />,
}: OrderItemProps<RC>) {
  const { t } = useTranslation();

  const { token, fundsRequired } = balance.fundingItem;

  const amount = fundsRequired.formattedAmount;
  const fiatAmount = calculateCryptoToFiat(amount, token.symbol, conversions);

  return (
    <MenuItem
      rc={rc}
      emphasized
      size="medium"
      key={item.name}
      sx={{
        pointerEvents: 'none',
      }}
    >
      <MenuItem.FramedImage imageUrl={item.image} />
      <MenuItem.Label>{item.name}</MenuItem.Label>
      <MenuItem.Caption>
        {item.qty > 1
          ? t('views.ORDER_SUMMARY.orderItem.quantity', { qty: item.qty })
          : null}
      </MenuItem.Caption>
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
    </MenuItem>
  );
}
