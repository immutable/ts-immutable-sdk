import { Box } from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import {
  FundWithSmartCheckoutSubViews,
  SaleWidgetViews,
} from '../../../context/view-context/SaleViewContextTypes';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { LoadingView } from '../../../views/loading/LoadingView';
import { FundingRouteExecute } from '../components/FundingRouteExecute/FundingRouteExecute';
import { useSaleEvent } from '../hooks/useSaleEvents';
import { FundingRouteSelect } from '../components/FundingRouteSelect/FundingRouteSelect';
import { useSaleContext } from '../context/SaleContextProvider';
import { text as textConfig } from '../../../resources/text/textConfig';

type FundWithSmartCheckoutProps = {
  subView: FundWithSmartCheckoutSubViews;
};

export function FundWithSmartCheckout({ subView }: FundWithSmartCheckoutProps) {
  const { viewDispatch } = useContext(ViewContext);
  const [selectedFundingRoute, setSelectedFundingRoute] = useState<
  FundingRoute | undefined
  >(undefined);
  const [fundingRouteStepIndex, setFundingRouteStepIndex] = useState<number>(0);
  const { sendPageView } = useSaleEvent();
  const text = textConfig.views[SaleWidgetViews.FUND_WITH_SMART_CHECKOUT];

  const { querySmartCheckout, fundingRoutes } = useSaleContext();

  let smartCheckoutLoading = false;

  const onFundingRouteSelected = (fundingRoute: FundingRoute) => {
    setSelectedFundingRoute(fundingRoute);
  };

  useEffect(() => {
    if (
      subView === FundWithSmartCheckoutSubViews.INIT
      && !smartCheckoutLoading
    ) {
      smartCheckoutLoading = true;
      querySmartCheckout().finally(() => {
        smartCheckoutLoading = false;
      });
    }
  }, []);

  const fundingRouteStep = useMemo(() => {
    if (!selectedFundingRoute) {
      return undefined;
    }
    return selectedFundingRoute.steps[fundingRouteStepIndex];
  }, [selectedFundingRoute, fundingRouteStepIndex]);

  const onFundingRouteExecuted = () => {
    if (!selectedFundingRoute) {
      return;
    }
    if (fundingRouteStepIndex === selectedFundingRoute.steps.length - 1) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            subView: FundWithSmartCheckoutSubViews.DONE,
            type: SaleWidgetViews.FUND_WITH_SMART_CHECKOUT,
          },
        },
      });
    } else {
      setFundingRouteStepIndex(fundingRouteStepIndex + 1);
    }
  };

  useEffect(
    () => sendPageView(SaleWidgetViews.FUND_WITH_SMART_CHECKOUT, {
      subView,
      ...(!!fundingRouteStep && { fundingStep: fundingRouteStep.type }),
    }),
    [],
  );

  return (
    <Box>
      {subView === FundWithSmartCheckoutSubViews.INIT && (
        <LoadingView loadingText={text.loading.checkingBalances} />
      )}
      {subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT && (
        <FundingRouteSelect
          onFundingRouteSelected={onFundingRouteSelected}
          fundingRoutes={fundingRoutes}
        />
      )}
      {subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE && (
        <FundingRouteExecute
          onFundingRouteExecuted={onFundingRouteExecuted}
          fundingRouteStep={fundingRouteStep}
        />
      )}
      {subView === FundWithSmartCheckoutSubViews.DONE && (
        <p>FundWithSmartCheckout done!</p>
      )}
    </Box>
  );
}
