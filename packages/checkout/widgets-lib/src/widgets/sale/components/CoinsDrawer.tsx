import { Drawer, Heading, MenuItem } from '@biom3/react';
import { calculateCryptoToFiat, tokenValueFormat } from 'lib/utils';
import { useTranslation } from 'react-i18next';
import { SaleWidgetCurrency } from 'widgets/sale/types';
import { CoinsDrawerItem } from './CoinsDrawerItem';

type CoinsDrawerProps = {
  conversions: Map<string, number>;
  currencies: SaleWidgetCurrency[];
  onClose: (index: number) => void;
  selectedIndex: number;
  visible: boolean;
};

export function CoinsDrawer({
  conversions,
  currencies,
  onClose,
  selectedIndex,
  visible,
}: CoinsDrawerProps) {
  console.log('🚀 ~ visible:', visible);
  const { t } = useTranslation();

  return (
    <Drawer
      size="threeQuarter"
      visible={visible}
      showHeaderBar
      headerBarTitle={t('views.ORDER_SUMMARY.coinsDrawer.header')}
    >
      <Drawer.Content>
        {currencies.map((currency: SaleWidgetCurrency, idx: number) => (
          <CoinsDrawerItem
            key={`${currency.name}-${currency.symbol}`}
            onClick={() => onClose(idx)}
            currency={currency}
            selected={selectedIndex === idx}
            conversions={conversions}
          />
        ))}
      </Drawer.Content>
    </Drawer>
  );
}

