/* eslint-disable no-console */
import { Box } from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import {
  useContext,
  useEffect,
  useMemo, useState,
} from 'react';
import {
  FundWithSmartCheckoutSubViews, SaleWidgetViews,
} from '../../../context/view-context/SaleViewContextTypes';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { LoadingView } from '../../../views/loading/LoadingView';
import { FundingRouteExecute } from '../components/FundingRouteExecute/FundingRouteExecute';
import { FundingRouteSelect } from '../components/FundingRouteSelect/FundingRouteSelect';
import { useSaleContext } from '../context/SaleContextProvider';

type FundWithSmartCheckoutProps = {
  subView: FundWithSmartCheckoutSubViews;
};

export function FundWithSmartCheckout({ subView }: FundWithSmartCheckoutProps) {
  const { viewDispatch } = useContext(ViewContext);
  const [selectedFundingRoute, setSelectedFundingRoute] = useState<FundingRoute | undefined>(undefined);
  const [fundingRouteStepIndex, setFundingRouteStepIndex] = useState<number>(0);

  const { querySmartCheckout, fundingRoutes } = useSaleContext();

  let smartCheckoutLoading = false;

  const onFundingRouteSelected = (fundingRoute: FundingRoute) => {
    setSelectedFundingRoute(fundingRoute);
  };

  useEffect(() => {
    // ! maybe consider using a promise.resolve(undefined).
    if (subView === FundWithSmartCheckoutSubViews.INIT && querySmartCheckout && !smartCheckoutLoading) {
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

  return (
    <Box>
      { subView === FundWithSmartCheckoutSubViews.INIT && (
        <LoadingView loadingText="TODO COPY -> waiting for Smart Checkout..." />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT && (
        <FundingRouteSelect
          onFundingRouteSelected={onFundingRouteSelected}
          fundingRoutes={fundingRoutes}
        />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE && (
        <FundingRouteExecute
          onFundingRouteExecuted={onFundingRouteExecuted}
          fundingRouteStep={fundingRouteStep}
        />
      )}
      { subView === FundWithSmartCheckoutSubViews.DONE && (
      <p>
        FundWithSmartCheckout done!
      </p>
      )}
    </Box>
  );
}
