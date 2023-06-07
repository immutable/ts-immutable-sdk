import {
  BottomSheet, Box,
} from '@biom3/react';
import { CoinSelectorOption, CoinSelectorOptionProps } from './CoinSelectorOption';
import { selectOptionsContainerStyles } from './CoinSelectorStyles';

type CoinSelectorProps = {
  onCloseBottomSheet?: () => void;
  heading: string;
  options: CoinSelectorOptionProps[];
  children?: any;
  visible?: boolean;
};

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
          {options.map(({
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
