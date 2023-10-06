import {
  Body,
  BottomSheet, Box,
} from '@biom3/react';
import { CoinSelectorOption, CoinSelectorOptionProps } from './CoinSelectorOption';
import { selectOptionsContainerStyles } from './CoinSelectorStyles';
import { text } from '../../resources/text/textConfig';

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
  const { noCoins } = text.drawers.coinSelector;
  return (
    <BottomSheet headerBarTitle={heading} size="full" onCloseBottomSheet={onCloseBottomSheet} visible={visible}>
      <BottomSheet.Target>
        {children}
      </BottomSheet.Target>
      <BottomSheet.Content>
        <Box sx={selectOptionsContainerStyles}>
          {options.length === 0 && (<Body sx={{ padding: 'base.spacing.x4' }}>{noCoins}</Body>)}
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
