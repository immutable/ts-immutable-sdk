/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Box } from '@biom3/react';
import { useContext, useEffect } from 'react';
import {
  FundWithSmartCheckoutSubViews,
  PrimaryRevenueWidgetViews,
} from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { FundingRouteExecute } from '../components/FundingRouteExecute/FundingRouteExecute';
import { FundingRouteSelect } from '../components/FundingRouteSelect/FundingRouteSelect';
import { useSharedContext } from '../context/SharedContextProvider';
import { LoadingView } from '../../../views/loading/LoadingView';

/**
 * LOADING - get SignResponse and SmartCheckoutResponse
 */

type FundWithSmartCheckoutProps = {
  subView: FundWithSmartCheckoutSubViews;
};

export function FundWithSmartCheckout({ subView }: FundWithSmartCheckoutProps) {
  const { viewDispatch } = useContext(ViewContext);

  const { signResponse } = useSharedContext();
  const smartCheckoutResponse = undefined; // todo add to shared context

  useEffect(() => {
    if (!signResponse) {
      return;
    }
    if (subView === FundWithSmartCheckoutSubViews.INIT) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: PrimaryRevenueWidgetViews.SMART_CHECKOUT,
            data: {
              subView: FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT,
            },
          },
        },
      });
    }
  }, [signResponse]);

  return (
    <Box>
      <p>
        hello world from FundWithSmartCheckout
      </p>
      { subView === FundWithSmartCheckoutSubViews.INIT && (
        <LoadingView loadingText="todo loading text" />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT && (
        <FundingRouteSelect />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE && (
        <FundingRouteExecute />
      )}
    </Box>
  );
}
