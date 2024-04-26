import { Heading, MenuItem } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { calculateCryptoToFiat, tokenValueFormat } from 'lib/utils';
import { SettlementCurrency } from '../views/balances.mock';

type SelectCoinDropdownProps = {
  currency: SettlementCurrency;
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
    currency.userBalance.formattedBalance,
    currency.symbol,
    conversions,
  );

  return (
    <MenuItem emphasized size="medium">
      {canOpen && (
        <MenuItem.StatefulButtCon icon="ChevronExpand" onClick={onClick} />
      )}
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
