import { MenuItem, AllIconKeys } from '@biom3/react';
import { text } from '../../resources/text/textConfig';

export interface CoinSelectorOptionProps {
  testId?: string;
  id: string;
  name: string;
  icon?: AllIconKeys | string;
  symbol: string;
  onClick?: () => void
  balance?: {
    formattedFiatAmount: string;
    formattedAmount: string;
  }
}

export function CoinSelectorOption({
  onClick, icon, name, symbol, balance, testId, id,
}: CoinSelectorOptionProps) {
  const { drawers: { coinSelector } } = text;
  return (
    <MenuItem testId={`${testId}-coin-selector__option-${id}`} emphasized size="small" onClick={onClick}>
      {!icon && <MenuItem.Icon icon="Coins" variant="bold" />}
      {icon && (
        <MenuItem.FramedImage
          imageUrl={icon}
          circularFrame
        />
      )}

      <MenuItem.Label>{name}</MenuItem.Label>
      <MenuItem.Caption>{symbol}</MenuItem.Caption>
      {
        balance && (
          <MenuItem.PriceDisplay
            fiatAmount={`${coinSelector.option.fiatPricePrefix}${balance.formattedFiatAmount}`}
            price={balance.formattedAmount}
          />
        )
      }
    </MenuItem>
  );
}
