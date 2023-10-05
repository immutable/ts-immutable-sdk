import {
  BottomSheet,
} from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import { FundingRouteMenuItem } from '../FundingRouteMenuItem/FundingRouteMenuItem';

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
  const onClickMenuItem = (selectedFundingRouteIndex: number) => {
    onCloseBottomSheet(selectedFundingRouteIndex);
  };

  return (
    <BottomSheet
      size="full"
      onCloseBottomSheet={() => onCloseBottomSheet(activeFundingRouteIndex)}
      visible={visible}
      showHeaderBar
      headerBarTitle="Available balance"
    >
      <BottomSheet.Content>
        {fundingRoutes.map((fundingRoute: any, i: number) => (
          <FundingRouteMenuItem
            onClick={() => onClickMenuItem(i)}
            fundingRoute={fundingRoute}
            selected={activeFundingRouteIndex === i}
            key={fundingRoute.priority}
          />
        ))}
      </BottomSheet.Content>
    </BottomSheet>
  );
}
