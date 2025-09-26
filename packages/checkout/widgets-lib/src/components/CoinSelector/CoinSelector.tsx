import {
  Body,
  Drawer,
  Box,
  MenuItem,
  TextInput,
} from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { CoinSelectorOption, CoinSelectorOptionProps } from './CoinSelectorOption';
import { selectOptionsContainerStyles, selectOptionsLoadingIconStyles } from './CoinSelectorStyles';

type CoinSelectorProps = {
  onCloseDrawer?: () => void;
  heading: string;
  options: CoinSelectorOptionProps[];
  defaultTokenImage: string;
  optionsLoading?: boolean;
  children?: any;
  visible?: boolean;
  transparentOverlay: boolean;
};

const filterOptions = (filterBy: string, options: CoinSelectorOptionProps[]) => {
  const filterByLower = filterBy.toLowerCase();
  return options.filter((option) => option.name.toLowerCase().includes(filterByLower)
      || option.symbol.toLowerCase().includes(filterByLower)
      || option.id.toLowerCase().endsWith(filterByLower));
};

export function CoinSelector({
  heading, options, defaultTokenImage, optionsLoading, children, onCloseDrawer, visible, transparentOverlay,
}: CoinSelectorProps) {
  const { t } = useTranslation();

  const [searchValue, setSearchValue] = useState<string>('');

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const filteredOptions = useMemo(() => {
    if (!searchValue) {
      return options;
    }
    return filterOptions(searchValue, options);
  }, [options, searchValue]);

  const handleCloseDrawer = () => {
    setSearchValue('');
    onCloseDrawer?.();
  };

  return (
    <Drawer
      headerBarTitle={heading}
      size="full"
      onCloseDrawer={handleCloseDrawer}
      visible={visible}
      bgOverlaySx={transparentOverlay ? { backgroundColor: 'transparent' } : undefined}
    >
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
          {/* Add a search box when !optionsLoading */}
          {!optionsLoading ? (
            <>
              <TextInput
                sx={{ marginBottom: 'base.spacing.x4', minWidth: '100%' }}
                testId="search-text"
                onChange={(event) => handleOnChange(event)}
                sizeVariant="large"
                value={searchValue}
                inputMode="search"
                placeholder="name/symbol/contract address"
                onClearValue={() => setSearchValue('')}
                hideClearValueButton={false}
                autoFocus
              >
                <TextInput.Icon icon="Search" />
              </TextInput>
              {filteredOptions.map(({
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
                  defaultTokenImage={defaultTokenImage}
                />
              ))}
            </>
          ) : null}
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
