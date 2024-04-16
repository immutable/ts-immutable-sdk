import { Drawer } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { SaleWidgetCurrency } from 'widgets/sale/types';
import { FundingRouteMenuItem } from '../FundingRouteMenuItem/FundingRouteMenuItem';

type FundingRouteDrawerProps = {
  visible: boolean;
  onCloseDrawer: (selectedFundingRouteIndex: number) => void;
  currencies: SaleWidgetCurrency[];
  selectedIndex: number;
  conversions: Map<string, number>;
};

export function FundingRouteDrawer({
  conversions,
  visible,
  onCloseDrawer,
  currencies,
  selectedIndex,
}: FundingRouteDrawerProps) {
  const { t } = useTranslation();
  const onClickMenuItem = (index: number) => {
    onCloseDrawer(index);
  };

  return (
    <Drawer
      size="full"
      onCloseDrawer={() => onCloseDrawer(selectedIndex)}
      visible={visible}
      showHeaderBar
      headerBarTitle={t(
        'views.FUND_WITH_SMART_CHECKOUT.fundingRouteDrawer.header',
      )}
    >
      <Drawer.Content>
        {currencies.map((currency: SaleWidgetCurrency, idx: number) => (
          <FundingRouteMenuItem
            onClick={() => onClickMenuItem(idx)}
            currency={currency}
            selected={selectedIndex === idx}
            key={`${currency.name}-${currency.symbol}`}
            size="medium"
            conversions={conversions}
          />
        ))}
      </Drawer.Content>
    </Drawer>
  );
}
