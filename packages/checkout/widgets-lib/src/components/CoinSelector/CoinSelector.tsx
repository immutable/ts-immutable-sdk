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
  name: string;
  symbol: string;
  balance?: {
    formattedFiatAmount: string;
    formattedAmount: string;
  }
};

type CoinSelectorOptionProps = CoinSelectorOption;

export function CoinSelector({
  heading, options, children, onCloseBottomSheet, visible,
}: CoinSelectorProps) {
  return (
    <BottomSheet headerBarTitle={heading} size="full" onCloseBottomSheet={onCloseBottomSheet} visible={visible}>
      <BottomSheet.Target>
        {children}
      </BottomSheet.Target>
      <BottomSheet.Content>
        <Box sx={selectOptionsContainerStyles}>
          {options.map(({ onClick, icon, name, symbol, balance }) => (
            <CoinSelectorOption
              key={symbol}
              onClick={onClick}
              icon={icon}
              name={name}
              symbol={symbol}
              balance={balance} />
          ))}
        </Box>
      </BottomSheet.Content>
    </BottomSheet>
  );
}

export function CoinSelectorOption({
  onClick, icon, name, symbol, balance,
}: CoinSelectorOptionProps) {
  return (
    <MenuItem emphasized size="small" onClick={onClick}>
      <MenuItem.Icon icon={icon} />
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
