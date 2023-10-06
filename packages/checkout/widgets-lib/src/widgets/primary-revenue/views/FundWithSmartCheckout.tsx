import { Box } from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import {
  useContext,
  useMemo, useState,
} from 'react';
import {
  FundWithSmartCheckoutSubViews, PrimaryRevenueWidgetViews,
} from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { LoadingView } from '../../../views/loading/LoadingView';
import {
  FundingRouteExecute,
} from '../components/FundingRouteExecute/FundingRouteExecute';
import { FundingRouteSelect } from '../components/FundingRouteSelect/FundingRouteSelect';

type FundWithSmartCheckoutProps = {
  subView: FundWithSmartCheckoutSubViews;
};

export function FundWithSmartCheckout({ subView }: FundWithSmartCheckoutProps) {
  const { viewDispatch } = useContext(ViewContext);
  const [selectedFundingRoute, setSelectedFundingRoute] = useState<FundingRoute | undefined>(undefined);
  const [fundingRouteStepIndex, setFundingRouteStepIndex] = useState<number>(0);

  const onFundingRouteSelected = (fundingRoute: FundingRoute) => {
    setSelectedFundingRoute(fundingRoute);
  };

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
            type: PrimaryRevenueWidgetViews.FUND_WITH_SMART_CHECKOUT,
            data: {
              subView: FundWithSmartCheckoutSubViews.DONE,
            },
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
        <LoadingView loadingText="Loading" />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT && (
        <FundingRouteSelect
          onFundingRouteSelected={onFundingRouteSelected}
          fundingRoutes={[]}
        />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE && (
        <FundingRouteExecute
          onFundingRouteExecuted={onFundingRouteExecuted}
          fundingRouteStep={fundingRouteStep!}
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
