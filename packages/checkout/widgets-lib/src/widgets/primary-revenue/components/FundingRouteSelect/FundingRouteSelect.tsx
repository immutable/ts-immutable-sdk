import {
  Box,
  Button, Heading,
} from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import { useContext, useState } from 'react';
import { FooterLogo } from '../../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../components/SimpleLayout/SimpleLayout';
import {
  FundWithSmartCheckoutSubViews,
  PrimaryRevenueWidgetViews,
} from '../../../../context/view-context/PrimaryRevenueViewContextTypes';
import { ViewActions, ViewContext } from '../../../../context/view-context/ViewContext';
import { FundingRouteMenuItem } from '../FundingRouteMenuItem/FundingRouteMenuItem';
import { FundingRouteDrawer } from '../FundingRouteSelectDrawer/FundingRouteDrawer';
import { PurchaseMenuItem } from '../PurchaseMenuItem/PurchaseMenuItem';

type FundingRouteSelectProps = {
  fundingRoutes: FundingRoute[];
  onFundingRouteSelected: (fundingRoute: any) => void;
};

export function FundingRouteSelect({ fundingRoutes, onFundingRouteSelected }: FundingRouteSelectProps) {
  const [smartCheckoutDrawerVisible, setSmartCheckoutDrawerVisible] = useState(false);
  const [activeFundingRouteIndex, setActiveFundingRouteIndex] = useState(0);
  const { viewDispatch } = useContext(ViewContext);

  const onClickContinue = () => {
    onFundingRouteSelected(fundingRoutes[activeFundingRouteIndex]);
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: PrimaryRevenueWidgetViews.FUND_WITH_SMART_CHECKOUT,
          data: {
            subView: FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE,
          },
        },
      },
    });
  };

  const closeBottomSheet = (selectedFundingRouteIndex: number) => {
    setActiveFundingRouteIndex(selectedFundingRouteIndex);
    setSmartCheckoutDrawerVisible(false);
  };

  const onSmartCheckoutDropdownClick = () => {
    setSmartCheckoutDrawerVisible(true);
  };

  return (
    <SimpleLayout
      testId="funding-route-select"
      header={<HeaderNavigation onCloseButtonClick={() => {}} />}
      footer={<FooterLogo />}
    >

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: 'base.spacing.x2',
          paddingY: 'base.spacing.x8',
          rowGap: 'base.spacing.x4',
          height: '100%',
        }}
      >
        <Heading size="small">
          Pay with your
        </Heading>

        {fundingRoutes.length === 0
          ? (
            <Heading size="small">
              No funding routes available
            </Heading>
          )
          : (
            <FundingRouteMenuItem
              data-testid="funding-route-select-selected-route"
              onClick={fundingRoutes.length > 1 ? onSmartCheckoutDropdownClick : () => {}}
              fundingRoute={fundingRoutes[activeFundingRouteIndex]}
              selected
              toggleVisible={fundingRoutes.length > 1}
            />
          ) }

        <PurchaseMenuItem />

        <Button sx={{ mt: 'auto' }} variant="primary" onClick={onClickContinue}>
          {/* {options.continue.text} */}
          continue
        </Button>
        <Button variant="tertiary">
          {/* {options.payWithCard.text} */}
          pay with card
        </Button>
      </Box>
      <FundingRouteDrawer
        visible={smartCheckoutDrawerVisible}
        onCloseBottomSheet={closeBottomSheet}
        fundingRoutes={fundingRoutes}
        activeFundingRouteIndex={activeFundingRouteIndex}
      />
    </SimpleLayout>
  );
}
