import { Box, Caption, Drawer } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { CoinsDrawerItem } from './CoinsDrawerItem';
import { SettlementCurrency } from '../views/balances.mock';

type CoinsDrawerProps = {
  conversions: Map<string, number>;
  currencies: SettlementCurrency[];
  onSelect: (index: number) => void;
  onClose: () => void;
  selectedIndex: number;
  visible: boolean;
};

export function CoinsDrawer({
  conversions,
  currencies,
  onClose,
  onSelect,
  selectedIndex,
  visible,
}: CoinsDrawerProps) {
  const { t } = useTranslation();

  const handleOnclick = (index: number) => () => {
    onSelect(index);
    onClose();
  };

  return (
    <Drawer
      size="full"
      visible={visible}
      showHeaderBar
      onCloseDrawer={onClose}
      headerBarTitle={t('views.ORDER_SUMMARY.coinsDrawer.header')}
    >
      <Drawer.Content>
        <Box sx={{ padding: 'base.spacing.x2' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Caption size="small">
              {t('views.ORDER_SUMMARY.coinsDrawer.caption1')}
            </Caption>
            <Caption size="small">
              {t('views.ORDER_SUMMARY.coinsDrawer.caption2')}
            </Caption>
          </Box>

          {currencies.map((currency: SettlementCurrency, idx: number) => (
            <CoinsDrawerItem
              key={`${currency.name}-${currency.symbol}`}
              onClick={handleOnclick(idx)}
              currency={currency}
              selected={selectedIndex === idx}
              conversions={conversions}
            />
          ))}
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
