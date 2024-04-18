import { Heading, MenuItem } from '@biom3/react';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import {
  calculateCryptoToFiat,
  getDefaultTokenImage,
  tokenValueFormat,
} from 'lib/utils';
import { useTranslation } from 'react-i18next';
import { useSaleContext } from '../context/SaleContextProvider';
import { CoinBalance } from '../types';

type CoinDrawerItemProps = {
  currency: CoinBalance;
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
    currency.formattedBalance,
    currency.token.symbol,
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
        imageUrl={currency.token.icon}
        alt={currency.token.name}
        defaultImageUrl={getDefaultTokenImage(environment, WidgetTheme.DARK)}
        circularFrame
      />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        fiatAmount={t('views.ORDER_SUMMARY.currency.fiat', {
          amount: fiatAmount,
        })}
        price={tokenValueFormat(currency.formattedBalance)}
      />
      <MenuItem.Label sx={{ display: 'flex', wordBreak: 'default' }}>
        {currency.token.symbol}
      </MenuItem.Label>
    </MenuItem>
  );
}
