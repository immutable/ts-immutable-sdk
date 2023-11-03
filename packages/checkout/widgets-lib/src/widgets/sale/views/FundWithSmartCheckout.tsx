import { Box } from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import {
  useContext,
  useEffect,
  useMemo, useRef, useState,
} from 'react';
import {
  FundWithSmartCheckoutSubViews,
  SaleWidgetViews,
} from '../../../context/view-context/SaleViewContextTypes';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { text } from '../../../resources/text/textConfig';
import { LoadingView } from '../../../views/loading/LoadingView';
import { FundingRouteExecute } from '../components/FundingRouteExecute/FundingRouteExecute';
import { FundingRouteSelect } from '../components/FundingRouteSelect/FundingRouteSelect';
import { useSaleContext } from '../context/SaleContextProvider';
import { useSaleEvent } from '../hooks/useSaleEvents';
import { CryptoFiatActions, CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';

type FundWithSmartCheckoutProps = {
  subView: FundWithSmartCheckoutSubViews;
};

export function FundWithSmartCheckout({ subView }: FundWithSmartCheckoutProps) {
  const { sendPageView } = useSaleEvent();
  const { viewDispatch } = useContext(ViewContext);
  const [selectedFundingRoute, setSelectedFundingRoute] = useState<
  FundingRoute | undefined
  >(undefined);
  const [fundingRouteStepIndex, setFundingRouteStepIndex] = useState<number>(0);
  const textConfig = text.views[SaleWidgetViews.FUND_WITH_SMART_CHECKOUT];

  const { querySmartCheckout, fundingRoutes } = useSaleContext();
  const { cryptoFiatDispatch } = useContext(CryptoFiatContext);

  // todo get real values?
  const allowedTokens = [{
    symbol: 'IMX',
  }, {
    symbol: 'ETH',
  }, {
    symbol: 'zkONE',
  }, {
    symbol: 'zkTKN',
  }];

  const smartCheckoutLoading = useRef(false);

  const onFundingRouteSelected = (fundingRoute: FundingRoute) => {
    setSelectedFundingRoute(fundingRoute);
  };

  useEffect(() => {
    if (subView === FundWithSmartCheckoutSubViews.INIT && !smartCheckoutLoading.current) {
      smartCheckoutLoading.current = true;
      try {
        querySmartCheckout();
      } finally {
        smartCheckoutLoading.current = false;
      }
    }
  }, [subView]);

  useEffect(() => {
    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols: allowedTokens.map((allowedToken) => allowedToken.symbol),
      },
    });
  }, [cryptoFiatDispatch]);

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
      setFundingRouteStepIndex(0);
      setSelectedFundingRoute(undefined);
      // ! Recurse with SC to trigger another query and confirm they have the required balance
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.FUND_WITH_SMART_CHECKOUT,
            subView: FundWithSmartCheckoutSubViews.INIT,
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
        <LoadingView loadingText={textConfig.loading.checkingBalances} />
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
    </Box>

  );
}
