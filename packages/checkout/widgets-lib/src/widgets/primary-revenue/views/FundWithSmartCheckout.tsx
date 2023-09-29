/* eslint-disable no-console */
import { Box } from '@biom3/react';
import {
  FundWithSmartCheckoutSubViews,
} from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { LoadingView } from '../../../views/loading/LoadingView';
import { FundingRouteExecute } from '../components/FundingRouteExecute/FundingRouteExecute';
import { FundingRouteSelect } from '../components/FundingRouteSelect/FundingRouteSelect';

type FundWithSmartCheckoutProps = {
  subView: FundWithSmartCheckoutSubViews;
};

export function FundWithSmartCheckout({ subView }: FundWithSmartCheckoutProps) {
  const onFundingRouteSelected = (fundingRoute: any) => {
    console.log('@@@ onFundingRouteSelected', fundingRoute);
  };

  return (
    <Box>
      <p>
        hello world from FundWithSmartCheckout
      </p>
      { subView === FundWithSmartCheckoutSubViews.INIT && (
        <LoadingView loadingText="todo loading text" />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT && (
        <FundingRouteSelect
          onFundingRouteSelected={onFundingRouteSelected}
          fundingRoutes={[]}
        />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE && (
        <FundingRouteExecute />
      )}
    </Box>
  );
}
