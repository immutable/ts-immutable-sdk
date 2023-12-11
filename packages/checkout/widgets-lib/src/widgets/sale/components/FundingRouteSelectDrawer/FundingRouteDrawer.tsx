import {
  Drawer,
} from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import { FundingRouteMenuItem } from '../FundingRouteMenuItem/FundingRouteMenuItem';
import { text } from '../../../../resources/text/textConfig';
import { SaleWidgetViews } from '../../../../context/view-context/SaleViewContextTypes';

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
  const textConfig = text.views[SaleWidgetViews.FUND_WITH_SMART_CHECKOUT];
  const onClickMenuItem = (selectedFundingRouteIndex: number) => {
    onCloseDrawer(selectedFundingRouteIndex);
  };

  return (
    <Drawer
      size="full"
      onCloseDrawer={() => onCloseDrawer(activeFundingRouteIndex)}
      visible={visible}
      showHeaderBar
      headerBarTitle={textConfig.fundingRouteDrawer.header}
    >
      <Drawer.Content>
        {fundingRoutes.map((fundingRoute: FundingRoute, i: number) => (
          <FundingRouteMenuItem
            onClick={() => onClickMenuItem(i)}
            fundingRoute={fundingRoute}
            selected={activeFundingRouteIndex === i}
            key={fundingRoute.steps[0].fundingItem.type + fundingRoute.steps[0].fundingItem.token}
            size="medium"
          />
        ))}
      </Drawer.Content>
    </Drawer>
  );
}
