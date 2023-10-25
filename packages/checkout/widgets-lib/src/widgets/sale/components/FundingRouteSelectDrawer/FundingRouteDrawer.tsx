import {
  Drawer,
} from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import { FundingRouteMenuItem } from '../FundingRouteMenuItem/FundingRouteMenuItem';

type FundingRouteDrawerProps = {
  visible: boolean;
  onCloseDrawer: (selectedFundingRouteIndex: number) => void;
  fundingRoutes: FundingRoute[];
  activeFundingRouteIndex: number;
};

export function FundingRouteDrawer({
  visible, onCloseDrawer, fundingRoutes, activeFundingRouteIndex,
}:
FundingRouteDrawerProps) {
  const onClickMenuItem = (selectedFundingRouteIndex: number) => {
    onCloseDrawer(selectedFundingRouteIndex);
  };

  return (
    <Drawer
      size="full"
      onCloseDrawer={() => onCloseDrawer(activeFundingRouteIndex)}
      visible={visible}
      showHeaderBar
      headerBarTitle="Available balance"
    >
      <Drawer.Content>
        {fundingRoutes.map((fundingRoute: FundingRoute, i: number) => (
          <FundingRouteMenuItem
            onClick={() => onClickMenuItem(i)}
            fundingRoute={fundingRoute}
            selected={activeFundingRouteIndex === i}
            key={fundingRoute.steps[0].fundingItem.type + fundingRoute.steps[0].fundingItem.token}
          />
        ))}
      </Drawer.Content>
    </Drawer>
  );
}
