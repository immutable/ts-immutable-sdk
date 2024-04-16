import { Box } from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import {
  useContext,
  useEffect,
  useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  FundWithSmartCheckoutSubViews,
  SaleWidgetViews,
} from '../../../context/view-context/SaleViewContextTypes';
import { ViewContext } from '../../../context/view-context/ViewContext';
import { LoadingView } from '../../../views/loading/LoadingView';
import { useSaleContext } from '../context/SaleContextProvider';
import { useSaleEvent } from '../hooks/useSaleEvents';
import { CryptoFiatActions, CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { FundingRouteSelect } from '../components/FundingRouteSelect/FundingRouteSelect';
import { SaleWidgetCurrency } from '../types';
// import { smartCheckoutTokensList } from '../functions/smartCheckoutUtils';

type FundWithSmartCheckoutProps = {
  subView: FundWithSmartCheckoutSubViews;
};

export function FundWithSmartCheckout({ subView }: FundWithSmartCheckoutProps) {
  const { t } = useTranslation();
  const { sendPageView } = useSaleEvent();
  const { viewDispatch } = useContext(ViewContext);
  const [selectedFundingRoute, setSelectedFundingRoute] = useState<
  FundingRoute | undefined
  >(undefined);
  const [fundingRouteStepIndex, setFundingRouteStepIndex] = useState<number>(0);
  const {
    querySmartCheckout, fundingRoutes, smartCheckoutResult, collectionName, fromTokenAddress, allCurrencies,
  } = useSaleContext();
  const { cryptoFiatDispatch, cryptoFiatState } = useContext(CryptoFiatContext);

  const onFundingRouteSelected = (currency: SaleWidgetCurrency) => {
    // setSelectedFundingRoute(fundingRoute);
  };

  useEffect(() => {
    // FIXME: if fromTokenAddress times out throw error
    if (subView !== FundWithSmartCheckoutSubViews.INIT || !fromTokenAddress) return;

    // TODO: iterate thru all tokens and check if they have enough balance for each
    querySmartCheckout();
  }, [subView, fromTokenAddress]);

  useEffect(() => {
    // refresh conversion rates
    if (!cryptoFiatDispatch || allCurrencies.length === 0) {
      return;
    }

    const tokenSymbols = allCurrencies.map((currency) => currency.symbol);

    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols,
      },
    });
  }, [cryptoFiatDispatch, allCurrencies]);


  // const fundingRouteStep = useMemo(() => {
  //   if (!selectedFundingRoute) {
  //     return undefined;
  //   }
  //   return selectedFundingRoute.steps[fundingRouteStepIndex];
  // }, [selectedFundingRoute, fundingRouteStepIndex]);

  const onFundingRouteExecuted = () => {
    // if (!selectedFundingRoute) {
    //   return;
    // }
    // if (fundingRouteStepIndex === selectedFundingRoute.steps.length - 1) {
    //   setFundingRouteStepIndex(0);
    //   setSelectedFundingRoute(undefined);
    //   // ! Recurse with SC to trigger another query and confirm they have the required balance
    //   viewDispatch({
    //     payload: {
    //       type: ViewActions.UPDATE_VIEW,
    //       view: {
    //         type: SaleWidgetViews.FUND_WITH_SMART_CHECKOUT,
    //         subView: FundWithSmartCheckoutSubViews.INIT,
    //       },
    //     },
    //   });
    // } else {
    //   setFundingRouteStepIndex(fundingRouteStepIndex + 1);
    // }
  };

  // useEffect(
  //   () => {
  //     // trigger analytics
  //     sendPageView(SaleWidgetViews.FUND_WITH_SMART_CHECKOUT, {
  //       subView,
  //       ...(!!fundingRouteStep && { fundingStep: fundingRouteStep.type }),
  //     });
  //   },
  //   [],
  // );

  return (
    <Box>
      {subView === FundWithSmartCheckoutSubViews.INIT && (
        <LoadingView loadingText={t('views.FUND_WITH_SMART_CHECKOUT.loading.checkingBalances')} />
      )}
      {subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT && (
        <FundingRouteSelect
          currencies={allCurrencies}
          collectionName={collectionName}
          onSelect={onFundingRouteSelected}
        />
      )}
      {/* {subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE && (
        <FundingRouteExecute
          onFundingRouteExecuted={onFundingRouteExecuted}
          fundingRouteStep={fundingRouteStep}
        />
      )} */}
    </Box>
  );
}
