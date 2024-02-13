import {
  Body,
  Drawer,
  Box,
  MenuItem,
} from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { CoinSelectorOption, CoinSelectorOptionProps } from './CoinSelectorOption';
import { selectOptionsContainerStyles, selectOptionsLoadingIconStyles } from './CoinSelectorStyles';

type CoinSelectorProps = {
  onCloseDrawer?: () => void;
  heading: string;
  options: CoinSelectorOptionProps[];
  optionsLoading?: boolean;
  children?: any;
  visible?: boolean;
};

export function CoinSelector({
  heading, options, optionsLoading, children, onCloseDrawer, visible,
}: CoinSelectorProps) {
  const { t } = useTranslation();
  return (
    <Drawer headerBarTitle={heading} size="full" onCloseDrawer={onCloseDrawer} visible={visible}>
      <Drawer.Target>
        {children}
      </Drawer.Target>
      <Drawer.Content>
        <Box sx={selectOptionsContainerStyles}>
          {optionsLoading && options.length === 0 && (
            <Box sx={selectOptionsLoadingIconStyles}>
              <MenuItem shimmer emphasized testId="balance-item-shimmer--1" />
              <MenuItem shimmer emphasized testId="balance-item-shimmer--2" />
              <MenuItem shimmer emphasized testId="balance-item-shimmer--3" />
            </Box>
          )}
          {!optionsLoading && options.length === 0 && (
            <Body sx={{ padding: 'base.spacing.x4' }}>
              {t('drawers.coinSelector.noCoins')}
            </Body>
          )}
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
      </Drawer.Content>
    </Drawer>
  );
}
