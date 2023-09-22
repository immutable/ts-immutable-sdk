/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from 'react';
import { SmartCheckoutResult } from '@imtbl/checkout-sdk';
import { Box } from '@biom3/react';
import {
  FundWithSmartCheckoutData,
  FundWithSmartCheckoutSubViews,
} from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { SignResponse } from '../hooks/useSignOrder';
import { LoadingView } from '../../../views/loading/LoadingView';

type FundWithSmartCheckoutProps = {
  data: FundWithSmartCheckoutData;
};

export function FundWithSmartCheckout({ data }: FundWithSmartCheckoutProps) {
  // const { viewDispatch, viewState } = useContext(ViewContext);

  const [signResponse, setSignResponse] = useState<SignResponse | undefined>(undefined);
  const [smartCheckoutResult, setSmartCheckoutResult] = useState<SmartCheckoutResult | undefined>(undefined);
  const [view, setView] = useState<FundWithSmartCheckoutSubViews | undefined>(undefined);

  useEffect(() => {
    console.log('@@@@ FundWithSmartCheckout data:', data);

    if (!data) {
      return;
    }

    setView(data.type);
    setView(FundWithSmartCheckoutSubViews.INIT);

    switch (data.type) {
      case FundWithSmartCheckoutSubViews.INIT:
        console.log('@@@@ FundWithSmartCheckout INIT');
        setSignResponse(data.signResponse);
        setSmartCheckoutResult(data.smartCheckoutResult || undefined);
        break;
      case FundWithSmartCheckoutSubViews.SELECT:
        console.log('@@@@ FundWithSmartCheckout SELECT');
        break;
      case FundWithSmartCheckoutSubViews.FUNDING_ROUTE:
        console.log('@@@@ FundWithSmartCheckout FUNDING_ROUTE');
        break;
      default:
        console.log('@@@@ FundWithSmartCheckout default');
        break;
    }
  }, [data]);

  // TODO consider using a Context to track state for this component?
  return (
    <Box>
      { view === undefined && (
        <LoadingView loadingText="loading text" />
      ) }
      { view === FundWithSmartCheckoutSubViews.INIT && (
        <LoadingView loadingText={`loading - ${view}`} />
      ) }

    </Box>
  );
}
