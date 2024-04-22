import { Heading, MenuItem } from '@biom3/react';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import {
  calculateCryptoToFiat,
  getDefaultTokenImage,
  tokenValueFormat,
} from 'lib/utils';
import { useTranslation } from 'react-i18next';
import { ReactElement } from 'react';
import { useSaleContext } from '../context/SaleContextProvider';
import { FundingBalance } from '../types';

export interface CoinDrawerItemProps<
  RC extends ReactElement | undefined = undefined,
> {
  balance: FundingBalance;
  conversions: Map<string, number>;
  onClick: () => void;
  selected: boolean;
  rc?: RC;
}

export function CoinsDrawerItem<
  RC extends ReactElement | undefined = undefined,
>({
  balance: currency,
  conversions,
  onClick,
  selected,
  rc = <span />,
}: CoinDrawerItemProps<RC>) {
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
      rc={rc}
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
