import { Heading, MenuItem } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { calculateCryptoToFiat, tokenValueFormat } from 'lib/utils';
import { CoinBalance } from '../types';

type SelectCoinDropdownProps = {
  currency: CoinBalance;
  conversions: Map<string, number>;
  canOpen: boolean;
  onClick: () => void;
};

export function SelectCoinDropdown({
  currency,
  conversions,
  canOpen,
  onClick,
}: SelectCoinDropdownProps) {
  const { t } = useTranslation();
  const fiatAmount = calculateCryptoToFiat(
    currency.formattedBalance,
    currency.token.symbol,
    conversions,
  );

  return (
    <MenuItem emphasized size="medium">
      {canOpen && (
        <MenuItem.StatefulButtCon icon="ChevronExpand" onClick={onClick} />
      )}
      <MenuItem.FramedImage imageUrl={currency.token.icon} alt={currency.token.name} />
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
