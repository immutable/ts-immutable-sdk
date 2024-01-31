import {
  Body, Box, Button, Heading,
} from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FooterLogo } from '../../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../components/SimpleLayout/SimpleLayout';
import {
  FundWithSmartCheckoutSubViews,
  SaleWidgetViews,
} from '../../../../context/view-context/SaleViewContextTypes';
import {
  ViewActions,
  ViewContext,
} from '../../../../context/view-context/ViewContext';
import { FundingRouteMenuItem } from '../FundingRouteMenuItem/FundingRouteMenuItem';
import { FundingRouteDrawer } from '../FundingRouteSelectDrawer/FundingRouteDrawer';
import { PurchaseMenuItem } from '../PurchaseMenuItem/PurchaseMenuItem';
import { sendSaleWidgetCloseEvent } from '../../SaleWidgetEvents';
import { EventTargetContext } from '../../../../context/event-target-context/EventTargetContext';
import { useSaleContext } from '../../context/SaleContextProvider';

type FundingRouteSelectProps = {
  collectionName: string;
  fundingRoutes: FundingRoute[];
  onFundingRouteSelected: (fundingRoute: FundingRoute) => void;
};

export function FundingRouteSelect({
  fundingRoutes,
  collectionName,
  onFundingRouteSelected,
}: FundingRouteSelectProps) {
  const { t } = useTranslation();
  const [smartCheckoutDrawerVisible, setSmartCheckoutDrawerVisible] = useState(false);
  const [activeFundingRouteIndex, setActiveFundingRouteIndex] = useState(0);
  const { viewDispatch } = useContext(ViewContext);
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
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

  const closeDrawer = (selectedFundingRouteIndex: number) => {
    setActiveFundingRouteIndex(selectedFundingRouteIndex);
    setSmartCheckoutDrawerVisible(false);
  };

  const onSmartCheckoutDropdownClick = () => {
    setSmartCheckoutDrawerVisible(true);
  };

  return (
    <SimpleLayout
      testId="funding-route-select"
      header={(
        <HeaderNavigation
          onCloseButtonClick={() => sendSaleWidgetCloseEvent(eventTarget)}
        />
      )}
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
          {t('views.FUND_WITH_SMART_CHECKOUT.fundingRouteSelect.heading')}
        </Heading>

        {fundingRoutes.length === 0
          ? [
            <Body key="noRoutesAvailableText" size="small">
              {t(
                'views.FUND_WITH_SMART_CHECKOUT.fundingRouteSelect.noRoutesAvailable',
              )}
            </Body>,
            <Button key="payWithCardButton" variant="tertiary">
              {t(
                'views.FUND_WITH_SMART_CHECKOUT.fundingRouteSelect.payWithCard',
              )}
            </Button>,
          ]
          : [
            <FundingRouteMenuItem
              data-testid="funding-route-select-selected-route"
              onClick={
                  fundingRoutes.length > 1
                    ? onSmartCheckoutDropdownClick
                    : () => {}
                }
              fundingRoute={fundingRoutes[activeFundingRouteIndex]}
              selected
              toggleVisible={fundingRoutes.length > 1}
              key="selectedFundingRouteMenuItem"
            />,
            <PurchaseMenuItem
              key="purchaseMenuItem"
              fundingRoute={fundingRoutes[activeFundingRouteIndex]}
              collectionName={collectionName}
            />,
            <Button
              key="continueButton"
              sx={{ mt: 'auto' }}
              variant="primary"
              onClick={onClickContinue}
            >
              {t(
                'views.FUND_WITH_SMART_CHECKOUT.fundingRouteSelect.continue',
              )}
            </Button>,
            <Button
              key="payWithCardButton"
              variant="tertiary"
              onClick={() => goBackToPaymentMethods()}
            >
              {t(
                'views.FUND_WITH_SMART_CHECKOUT.fundingRouteSelect.payWithCardInstead',
              )}
            </Button>,
          ]}
      </Box>
      <FundingRouteDrawer
        visible={smartCheckoutDrawerVisible}
        onCloseDrawer={closeDrawer}
        fundingRoutes={fundingRoutes}
        activeFundingRouteIndex={activeFundingRouteIndex}
      />
    </SimpleLayout>
  );
}
