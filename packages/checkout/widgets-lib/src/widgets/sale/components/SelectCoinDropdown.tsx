import { Heading, MenuItem, ShimmerCircle } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { calculateCryptoToFiat, tokenValueFormat } from 'lib/utils';
import { FundingBalance } from '../types';

type SelectCoinDropdownProps = {
  balance: FundingBalance;
  conversions: Map<string, number>;
  canOpen: boolean;
  onClick: () => void;
  loading?: boolean;
};

export function SelectCoinDropdown({
  balance: currency,
  conversions,
  canOpen,
  onClick,
  loading,
}: SelectCoinDropdownProps) {
  const { t } = useTranslation();

  const { token, userBalance } = currency.fundingItem;

  const fiatAmount = calculateCryptoToFiat(
    userBalance.formattedBalance,
    token.symbol,
    conversions,
  );

  return (
    <MenuItem emphasized size="medium">
      {canOpen && (
        <MenuItem.StatefulButtCon icon="ChevronExpand" onClick={onClick} />
      )}
      {!canOpen && loading && <ShimmerCircle radius="base.icon.size.400" />}
      <MenuItem.FramedImage imageUrl={token.icon} alt={token.name} />
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
