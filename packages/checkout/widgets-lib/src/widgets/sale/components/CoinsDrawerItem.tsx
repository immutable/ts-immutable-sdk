import { Heading, MenuItem } from '@biom3/react';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import {
  calculateCryptoToFiat,
  getDefaultTokenImage,
  tokenValueFormat,
} from 'lib/utils';
import { useTranslation } from 'react-i18next';
import { useSaleContext } from '../context/SaleContextProvider';
import { SettlementCurrency } from '../views/balances.mock';

type CoinDrawerItemProps = {
  currency: SettlementCurrency;
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
  const { environment } = useSaleContext();

  const fiatAmount = calculateCryptoToFiat(
    currency.userBalance.formattedBalance,
    currency.symbol,
    conversions,
  );

  return (
    <MenuItem
      sx={{ marginBottom: 'base.spacing.x1' }}
      emphasized
      size="medium"
      onClick={onClick}
      selected={selected}
    >
      <MenuItem.FramedImage
        imageUrl={currency.icon}
        alt={currency.name}
        defaultImageUrl={getDefaultTokenImage(environment, WidgetTheme.DARK)}
        circularFrame
      />
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
