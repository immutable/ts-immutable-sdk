import {
  BottomSheet, Box,
} from '@biom3/react';
import { selectOptionsContainerStyles } from './styles';
import { CoinSelectorOption, CoinSelectorOptionProps } from './CoinSelectorOption';

type CoinSelectorProps = {
  onCloseBottomSheet?: () => void;
  heading: string;
  options: CoinSelectorOptionProps[];
  children?: any;
  visible?: boolean;
  testId?: string;
};

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
