import {
  Body,
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
  SaleWidgetViews,
} from '../../../../context/view-context/SaleViewContextTypes';
import { ViewActions, ViewContext } from '../../../../context/view-context/ViewContext';
import { FundingRouteMenuItem } from '../FundingRouteMenuItem/FundingRouteMenuItem';
import { FundingRouteDrawer } from '../FundingRouteSelectDrawer/FundingRouteDrawer';
import { PurchaseMenuItem } from '../PurchaseMenuItem/PurchaseMenuItem';
import { text } from '../../../../resources/text/textConfig';
import { sendSaleWidgetCloseEvent } from '../../SaleWidgetEvents';
import { EventTargetContext } from '../../../../context/event-target-context/EventTargetContext';
import { useSaleContext } from '../../context/SaleContextProvider';

type FundingRouteSelectProps = {
  fundingRoutes: FundingRoute[];
  onFundingRouteSelected: (fundingRoute: FundingRoute) => void;
};

export function FundingRouteSelect({ fundingRoutes, onFundingRouteSelected }: FundingRouteSelectProps) {
  const textConfig = text.views[SaleWidgetViews.FUND_WITH_SMART_CHECKOUT];
  const [smartCheckoutDrawerVisible, setSmartCheckoutDrawerVisible] = useState(false);
  const [activeFundingRouteIndex, setActiveFundingRouteIndex] = useState(0);
  const { viewDispatch } = useContext(ViewContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { goBackToPaymentMethods } = useSaleContext();

  const onClickContinue = () => {
    onFundingRouteSelected(fundingRoutes[activeFundingRouteIndex]);
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SaleWidgetViews.FUND_WITH_SMART_CHECKOUT,
          subView: FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE,
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
      header={<HeaderNavigation onCloseButtonClick={() => sendSaleWidgetCloseEvent(eventTarget)} />}
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
          {textConfig.fundingRouteSelect.heading}
        </Heading>

        {fundingRoutes.length === 0
          ? [
            <Body key="noRoutesAvailableText" size="small">
              {textConfig.fundingRouteSelect.noRoutesAvailable}
            </Body>,
            <Button key="payWithCardButton" variant="tertiary">
              {textConfig.fundingRouteSelect.payWithCard}
            </Button>,
          ]
          : [
            <FundingRouteMenuItem
              data-testid="funding-route-select-selected-route"
              onClick={fundingRoutes.length > 1 ? onSmartCheckoutDropdownClick : () => {}}
              fundingRoute={fundingRoutes[activeFundingRouteIndex]}
              selected
              toggleVisible={fundingRoutes.length > 1}
              key="selectedFundingRouteMenuItem"
            />,
            <PurchaseMenuItem key="purchaseMenuItem" fundingRoute={fundingRoutes[activeFundingRouteIndex]} />,
            <Button key="continueButton" sx={{ mt: 'auto' }} variant="primary" onClick={onClickContinue}>
              {textConfig.fundingRouteSelect.continue}
            </Button>,
            <Button key="payWithCardButton" variant="tertiary" onClick={() => goBackToPaymentMethods()}>
              {textConfig.fundingRouteSelect.payWithCardInstead}
            </Button>,
          ] }

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
