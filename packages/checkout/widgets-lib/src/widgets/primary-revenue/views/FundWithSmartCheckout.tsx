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

/**
 * LOADING - get SignResponse and SmartCheckoutResponse
 */

type FundWithSmartCheckoutProps = {
  subView: FundWithSmartCheckoutSubViews;
};

export function FundWithSmartCheckout({ subView }: FundWithSmartCheckoutProps) {
  const { viewDispatch } = useContext(ViewContext);

  useEffect(() => {
    if (subView === FundWithSmartCheckoutSubViews.INIT) {
      setTimeout(() => {
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
      }, 1000);
    }
  }, [subView]);

  return (
    <Box>
      <p>
        hello world from FundWithSmartCheckout
      </p>
      { subView === FundWithSmartCheckoutSubViews.INIT && (
      <p>
        {subView}
      </p>
      )}
      { subView === FundWithSmartCheckoutSubViews.LOADING && (
      <p>
        {subView}
      </p>
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
