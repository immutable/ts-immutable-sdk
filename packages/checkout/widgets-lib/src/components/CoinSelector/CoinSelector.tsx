import {
  BottomSheet, Box, MenuItem, AllIconKeys,
} from '@biom3/react';
import { selectOptionsContainerStyles } from './styles';

type CoinSelectorProps = {
  onCloseBottomSheet?: () => void;
  heading: string;
  options: CoinSelectorOption[];
  children: any;
  visible?: boolean;
};

type CoinSelectorOption = {
  onClick: () => void;
  icon: AllIconKeys;
  label: string;
  caption: string;
  balance?: {
    formattedFiatAmount: string;
    formattedAmount: string;
  }
}

type CoinSelectorOptionProps = CoinSelectorOption

export function CoinSelector({
  heading, options, children, onCloseBottomSheet, visible
}: CoinSelectorProps) {
  return (
    <BottomSheet headerBarTitle={heading} size="full" onCloseBottomSheet={onCloseBottomSheet} visible={visible}>
      <BottomSheet.Target>
        {children}
      </BottomSheet.Target>
      <BottomSheet.Content>
        <Box sx={selectOptionsContainerStyles}>
          {options.map(({onClick, icon, label, caption, balance}) => (
            <CoinSelectorOption
              onClick={onClick}
              icon={icon}
              label={label}
              caption={caption}
              balance={balance} />
          ))}
        </Box>
      </BottomSheet.Content>
    </BottomSheet>
  );
}

export function CoinSelectorOption({
  onClick, icon, label, caption, balance,
}: CoinSelectorOptionProps) {
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
