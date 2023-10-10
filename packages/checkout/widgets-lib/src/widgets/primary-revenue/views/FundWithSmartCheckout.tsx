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
  return (
    <Box>
      { subView === FundWithSmartCheckoutSubViews.INIT && (
        <LoadingView loadingText="Loading" />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT && (
        <FundingRouteSelect fundingRoutes={[]} />
      )}
      { subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE && (
        <FundingRouteExecute />
      )}
    </Box>
  );
}
