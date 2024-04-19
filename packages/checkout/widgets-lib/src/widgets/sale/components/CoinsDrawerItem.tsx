import { Heading, MenuItem } from '@biom3/react';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import {
  calculateCryptoToFiat,
  getDefaultTokenImage,
  tokenValueFormat,
} from 'lib/utils';
import { useTranslation } from 'react-i18next';
import { useSaleContext } from '../context/SaleContextProvider';
import { FundingBalance } from '../types';

type CoinDrawerItemProps = {
  currency: FundingBalance;
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

  const { token, userBalance } = currency.fundingItem;

  const fiatAmount = calculateCryptoToFiat(
    userBalance.formattedBalance,
    token.symbol,
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
        imageUrl={token.icon}
        alt={token.name}
        defaultImageUrl={getDefaultTokenImage(environment, WidgetTheme.DARK)}
        circularFrame
      />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        fiatAmount={t('views.ORDER_SUMMARY.currency.fiat', {
          amount: fiatAmount,
        })}
        price={tokenValueFormat(userBalance.formattedBalance)}
      />
      <MenuItem.Label sx={{ display: 'flex', wordBreak: 'default' }}>
        {token.symbol}
      </MenuItem.Label>
      <MenuItem.Caption>{currency.type}</MenuItem.Caption>
    </MenuItem>
  );
}
