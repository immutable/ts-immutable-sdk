import { Drawer } from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { BalanceItem } from '../BalanceItem/BalanceItem';

type BalanceDrawerProps = {
  visible: boolean;
  onCloseDrawer: (selectedFundingRouteIndex: number) => void;
  fundingRoutes: FundingRoute[];
  activeFundingRouteIndex: number;
};

export function BalanceDrawer({
  visible,
  onCloseDrawer,
  fundingRoutes,
  activeFundingRouteIndex,
}: BalanceDrawerProps) {
  const { t } = useTranslation();
  const onClickMenuItem = (selectedFundingRouteIndex: number) => {
    onCloseDrawer(selectedFundingRouteIndex);
  };

  return (
    <Drawer
      size="threeQuarter"
      onCloseDrawer={() => onCloseDrawer(activeFundingRouteIndex)}
      visible={visible}
      showHeaderBar
      headerBarTitle={t(
        'views.FUND_WITH_SMART_CHECKOUT.fundingRouteDrawer.header',
      )}
    >
      <Drawer.Content>
        {fundingRoutes.map((fundingRoute: FundingRoute, i: number) => (
          <BalanceItem
            onClick={() => onClickMenuItem(i)}
            fundingRoute={fundingRoute}
            selected={activeFundingRouteIndex === i}
            key={
              fundingRoute.steps[0].fundingItem.type
              + fundingRoute.steps[0].fundingItem.token
            }
          />
        ))}
      </Drawer.Content>
    </Drawer>
  );
}
