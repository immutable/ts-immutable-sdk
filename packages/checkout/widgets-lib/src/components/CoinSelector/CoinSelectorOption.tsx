import { MenuItem, AllIconKeys } from '@biom3/react';

export type CoinSelectorOptionProps = {
  onClick: () => void;
  id: string;
  icon?: AllIconKeys;
  framedImageUrl?: string;
  name: string;
  symbol: string;
  testId?: string;
  balance?: {
    formattedFiatAmount: string;
    formattedAmount: string;
  }
};

export function CoinSelectorOption({
  onClick, icon, name, symbol, balance, framedImageUrl, id, testId,
}: CoinSelectorOptionProps) {
  return (
    <MenuItem testId={`${testId}-coin-selector__option-${id}`} emphasized size="small" onClick={onClick}>
      {
        framedImageUrl || icon
          ? (framedImageUrl && <MenuItem.FramedImage imageUrl={framedImageUrl} />)
          : (icon && <MenuItem.Icon icon={icon} />)
      }
      <MenuItem.Label>{name}</MenuItem.Label>
      <MenuItem.Caption>{symbol}</MenuItem.Caption>
      {
        balance && (
          <MenuItem.PriceDisplay
            fiatAmount={balance.formattedFiatAmount}
            price={balance.formattedAmount}
          />
        )
      }
    </MenuItem>
  );
}
