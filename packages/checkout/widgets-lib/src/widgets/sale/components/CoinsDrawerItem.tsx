import { Heading, MenuItem } from '@biom3/react';
import { calculateCryptoToFiat, tokenValueFormat } from 'lib/utils';
import { useTranslation } from 'react-i18next';
import { SaleWidgetCurrency } from 'widgets/sale/types';

type CoinDrawerItemProps = {
  currency: SaleWidgetCurrency;
  conversions: Map<string, number>;
  onClick: () => void;
  selected: boolean;
};

export function CoinsDrawerItem({
  currency,
  conversions,
  onClick,
  selected,
}: CoinDrawerItemProps) {
  const { t } = useTranslation();
  const fiatAmount = calculateCryptoToFiat(
    currency.userBalance.formattedBalance,
    currency.symbol,
    conversions,
  );

  return (
    <MenuItem emphasized size="medium" onClick={onClick} selected={selected}>
      <MenuItem.FramedImage imageUrl={currency.icon} alt={currency.name} />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        fiatAmount={t('views.ORDER_SUMMARY.currency.fiat', {
          amount: fiatAmount,
        })}
        price={tokenValueFormat(currency.userBalance.formattedBalance)}
      />
      <MenuItem.Label sx={{ display: 'flex', wordBreak: 'default' }}>
        {currency.symbol}
      </MenuItem.Label>
    </MenuItem>
  );
}
