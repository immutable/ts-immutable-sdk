import { Drawer } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { SaleWidgetCurrency } from 'widgets/sale/types';
import { CoinsDrawerItem } from './CoinsDrawerItem';

type CoinsDrawerProps = {
  conversions: Map<string, number>;
  currencies: SaleWidgetCurrency[];
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
      size="threeQuarter"
      visible={visible}
      showHeaderBar
      onCloseDrawer={onClose}
      headerBarTitle={t('views.ORDER_SUMMARY.coinsDrawer.header')}
    >
      <Drawer.Content>
        {currencies.map((currency: SaleWidgetCurrency, idx: number) => (
          <CoinsDrawerItem
            key={`${currency.name}-${currency.symbol}`}
            onClick={handleOnclick(idx)}
            currency={currency}
            selected={selectedIndex === idx}
            conversions={conversions}
          />
        ))}
      </Drawer.Content>
    </Drawer>
  );
}
