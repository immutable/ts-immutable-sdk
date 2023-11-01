import {
  BottomSheet,
} from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import { FundingRouteMenuItem } from '../FundingRouteMenuItem/FundingRouteMenuItem';
import { text } from '../../../../resources/text/textConfig';
import { SaleWidgetViews } from '../../../../context/view-context/SaleViewContextTypes';

type FundingRouteDrawerProps = {
  visible: boolean;
  onCloseBottomSheet: (selectedFundingRouteIndex: number) => void;
  fundingRoutes: FundingRoute[];
  activeFundingRouteIndex: number;
};

export function FundingRouteDrawer({
  visible, onCloseBottomSheet, fundingRoutes, activeFundingRouteIndex,
}:
FundingRouteDrawerProps) {
  const textConfig = text.views[SaleWidgetViews.FUND_WITH_SMART_CHECKOUT];
  const onClickMenuItem = (selectedFundingRouteIndex: number) => {
    onCloseBottomSheet(selectedFundingRouteIndex);
  };

  return (
    <BottomSheet
      size="full"
      onCloseBottomSheet={() => onCloseBottomSheet(activeFundingRouteIndex)}
      visible={visible}
      showHeaderBar
      headerBarTitle={textConfig.fundingRouteDrawer.header}
    >
      <BottomSheet.Content>
        {fundingRoutes.map((fundingRoute: FundingRoute, i: number) => (
          <FundingRouteMenuItem
            onClick={() => onClickMenuItem(i)}
            fundingRoute={fundingRoute}
            selected={activeFundingRouteIndex === i}
            key={fundingRoute.steps[0].fundingItem.type + fundingRoute.steps[0].fundingItem.token}
            size="medium"
          />
        ))}
      </BottomSheet.Content>
    </BottomSheet>
  );
}
