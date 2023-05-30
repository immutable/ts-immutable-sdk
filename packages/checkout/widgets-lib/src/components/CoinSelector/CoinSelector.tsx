import {
  BottomSheet, Box, MenuItem, AllIconKeys,
} from '@biom3/react';
import { selectOptionsContainerStyles } from './styles';

type CoinSelectorProps = {
  onCloseBottomSheet?: () => void;
  heading: string;
  options: Option[];
  children?: any;
  visible?: boolean;
  testId?: string;
};

type Option = {
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

type CoinSelectorOptionProps = Option;

export function CoinSelectorOption({
  onClick, icon, name, symbol, balance, framedImageUrl, id, testId,
}: CoinSelectorOptionProps) {
  return (
    <MenuItem testId={`${testId}-coin-selector__option-${id}`} emphasized size="small" onClick={onClick}>
      {icon && <MenuItem.Icon icon={icon} />}
      {framedImageUrl && <MenuItem.FramedImage imageUrl={framedImageUrl} />}
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

export function CoinSelector({
  heading, options, children, onCloseBottomSheet, visible, testId,
}: CoinSelectorProps) {
  return (
    <BottomSheet headerBarTitle={heading} size="full" onCloseBottomSheet={onCloseBottomSheet} visible={visible}>
      <BottomSheet.Target>
        {children}
      </BottomSheet.Target>
      <BottomSheet.Content>
        <Box sx={selectOptionsContainerStyles}>
          {options.map(({
            onClick, icon, name, symbol, balance, id,
          }) => (
            <CoinSelectorOption
              testId={testId}
              id={id}
              key={symbol}
              onClick={onClick}
              icon={icon}
              name={name}
              symbol={symbol}
              balance={balance}
            />
          ))}
        </Box>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
