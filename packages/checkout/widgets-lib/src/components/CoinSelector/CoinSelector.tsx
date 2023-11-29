import {
  Body,
  BottomSheet, Box, MenuItem,
} from '@biom3/react';
import { CoinSelectorOption, CoinSelectorOptionProps } from './CoinSelectorOption';
import { selectOptionsContainerStyles, selectOptionsLoadingIconStyles } from './CoinSelectorStyles';
import { text } from '../../resources/text/textConfig';

type CoinSelectorProps = {
  onCloseBottomSheet?: () => void;
  heading: string;
  options: CoinSelectorOptionProps[];
  optionsLoading?: boolean;
  children?: any;
  visible?: boolean;
};

export function CoinSelector({
  heading, options, optionsLoading, children, onCloseBottomSheet, visible,
}: CoinSelectorProps) {
  const { noCoins } = text.drawers.coinSelector;
  return (
    <BottomSheet headerBarTitle={heading} size="full" onCloseBottomSheet={onCloseBottomSheet} visible={visible}>
      <BottomSheet.Target>
        {children}
      </BottomSheet.Target>
      <BottomSheet.Content>
        <Box sx={selectOptionsContainerStyles}>
          {optionsLoading && options.length === 0 && (
            <Box sx={selectOptionsLoadingIconStyles}>
              <MenuItem shimmer emphasized size="small" testId="balance-item-shimmer--1" />
              <MenuItem shimmer emphasized size="small" testId="balance-item-shimmer--2" />
              <MenuItem shimmer emphasized size="small" testId="balance-item-shimmer--3" />
            </Box>
          )}
          {!optionsLoading && options.length === 0 && (<Body sx={{ padding: 'base.spacing.x4' }}>{noCoins}</Body>)}
          {!optionsLoading && options.map(({
            onClick, icon, name, symbol, balance, id, testId,
          }) => (
            <CoinSelectorOption
              id={id}
              testId={testId}
              key={`${symbol}-${name}`}
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
