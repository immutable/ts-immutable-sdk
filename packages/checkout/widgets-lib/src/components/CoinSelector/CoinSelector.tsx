import {
  Body,
  Drawer,
  Box,
} from '@biom3/react';
import { CoinSelectorOption, CoinSelectorOptionProps } from './CoinSelectorOption';
import { selectOptionsContainerStyles } from './CoinSelectorStyles';
import { text } from '../../resources/text/textConfig';

type CoinSelectorProps = {
  onCloseDrawer?: () => void;
  heading: string;
  options: CoinSelectorOptionProps[];
  children?: any;
  visible?: boolean;
};

export function CoinSelector({
  heading, options, children, onCloseDrawer, visible,
}: CoinSelectorProps) {
  const { noCoins } = text.drawers.coinSelector;
  return (
    <Drawer headerBarTitle={heading} size="full" onCloseDrawer={onCloseDrawer} visible={visible}>
      <Drawer.Target>
        {children}
      </Drawer.Target>
      <Drawer.Content>
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
      </Drawer.Content>
    </Drawer>
  );
}
