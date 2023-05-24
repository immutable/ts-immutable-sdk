import {
  MenuItem, AllIconKeys,
} from '@biom3/react';

export interface ISelectDrawerOption {
  onClick: () => void;
  icon: AllIconKeys;
  label: string;
  caption: string;
  balance?: {
    formattedFiatAmount: string;
    formattedAmount: string;
  }
}

export function SelectDrawerOption({
  onClick, icon, label, caption, balance,
}: ISelectDrawerOption) {
  return (
    <MenuItem emphasized size="small" onClick={onClick}>
      <MenuItem.Icon icon={icon} />
      <MenuItem.Label>{label}</MenuItem.Label>
      <MenuItem.Caption>{caption}</MenuItem.Caption>
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
