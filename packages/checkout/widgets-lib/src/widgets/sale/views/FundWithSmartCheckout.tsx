import { Box } from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
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
import { FundingRouteSelect } from '../components/FundingRouteSelect/FundingRouteSelect';
import { useSaleContext } from '../context/SaleContextProvider';
import { useSaleEvent } from '../hooks/useSaleEvents';
import {
  CryptoFiatActions,
  CryptoFiatContext,
} from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { smartCheckoutTokensList } from '../functions/smartCheckoutUtils';
import { SignPaymentTypes } from '../types';

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
    querySmartCheckout,
    fundingRoutes,
    smartCheckoutResult,
    collectionName,
    fromTokenAddress,
    sign,
  } = useSaleContext();
  const { cryptoFiatDispatch } = useContext(CryptoFiatContext);

  const onFundingRouteSelected = (fundingRoute: FundingRoute) => {
    setSelectedFundingRoute(fundingRoute);
  };

  useEffect(() => {
    if (subView !== FundWithSmartCheckoutSubViews.INIT || !fromTokenAddress) return;
    querySmartCheckout();
  }, [subView, fromTokenAddress]);

  useEffect(() => {
    if (!smartCheckoutResult) {
      return;
    }

    if (smartCheckoutResult.sufficient) {
      sign(SignPaymentTypes.CRYPTO);
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.PAY_WITH_COINS,
          },
        },
      });
    }
  }, [smartCheckoutResult]);

  useEffect(() => {
    if (!cryptoFiatDispatch || !smartCheckoutResult) return;

    const tokenSymbols = smartCheckoutTokensList(smartCheckoutResult);

    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols,
      },
    });
  }, [cryptoFiatDispatch, smartCheckoutResult]);

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
        <LoadingView
          loadingText={t(
            'views.FUND_WITH_SMART_CHECKOUT.loading.checkingBalances',
          )}
        />
      )}
      {subView === FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT && (
        <FundingRouteSelect
          fundingRoutes={fundingRoutes}
          collectionName={collectionName}
          onFundingRouteSelected={onFundingRouteSelected}
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
