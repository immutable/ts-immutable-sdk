import { Box } from '@biom3/react';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from 'context/view-context/ViewContext';
import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import {
  OrderSummarySubViews,
  SaleWidgetViews,
} from '../../../context/view-context/SaleViewContextTypes';
import { LoadingView } from '../../../views/loading/LoadingView';
import { useSaleContext } from '../context/SaleContextProvider';
import {
  CryptoFiatActions,
  CryptoFiatContext,
} from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { OrderReview } from '../components/OrderReview';
import { useFundingBalances } from '../hooks/useFundingBalances';
import { getTopUpViewData } from '../functions/getTopUpViewData';
import {
  FundingBalance,
  FundingBalanceType,
  SaleErrorTypes,
  SignPaymentTypes,
} from '../types';
import { FundingRouteExecute } from '../components/FundingRouteExecute/FundingRouteExecute';
import { useSaleEvent } from '../hooks/useSaleEvents';
import { getPaymentTokenDetails } from '../utils/analytics';

type OrderSummaryProps = {
  subView: OrderSummarySubViews;
};

export function OrderSummary({ subView }: OrderSummaryProps) {
  const { t } = useTranslation();
  const { sendPageView, sendProceedToPay } = useSaleEvent();
  const {
    items,
    fromTokenAddress,
    collectionName,
    goToErrorView,
    goBackToPaymentMethods,
    sign,
    selectedCurrency,
  } = useSaleContext();

  const { viewDispatch, viewState } = useContext(ViewContext);
  const { cryptoFiatDispatch, cryptoFiatState } = useContext(CryptoFiatContext);

  const onPayWithCard = (paymentType: SalePaymentTypes) => goBackToPaymentMethods(paymentType);

  const signAndProceed = (tokenAddress?: string) => {
    sign(SignPaymentTypes.CRYPTO, tokenAddress);
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SaleWidgetViews.PAY_WITH_COINS,
        },
      },
    });
  };

  const onFundingRouteExecuted = () => {
    signAndProceed(selectedCurrency?.address);
  };

  const onProceedToBuy = (fundingBalance: FundingBalance) => {
    const { type, fundingItem } = fundingBalance;

    sendProceedToPay(
      SaleWidgetViews.ORDER_SUMMARY,
      fundingItem,
      cryptoFiatState.conversions,
    );
    // checkoutPrimarySaleProceedToPay

    if (type === FundingBalanceType.SUFFICIENT) {
      signAndProceed(fundingItem.token.address);
      return;
    }

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SaleWidgetViews.ORDER_SUMMARY,
          subView: OrderSummarySubViews.EXECUTE_FUNDING_ROUTE,
          data: {
            fundingBalance,
            onFundingRouteExecuted,
          },
        },
      },
    });
  };

  const {
    fundingBalances,
    loadingBalances,
    fundingBalancesResult,
    transactionRequirement,
    queryFundingBalances,
  } = useFundingBalances();

  // Initialise funding balances
  useEffect(() => {
    if (subView !== OrderSummarySubViews.INIT || !fromTokenAddress) return;
    queryFundingBalances();
  }, [subView, fromTokenAddress]);

  // If one or more balances found, go to Order Review
  useEffect(() => {
    if (fundingBalances.length === 0) return;

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SaleWidgetViews.ORDER_SUMMARY,
          subView: OrderSummarySubViews.REVIEW_ORDER,
        },
      },
    });
  }, [fundingBalances]);

  // If no balances, Go to Top Up View
  useEffect(() => {
    if (loadingBalances || !fundingBalancesResult.length) return;
    if (fundingBalances.length > 0) return;

    try {
      // suggest to top up base currency balance
      const smartCheckoutResult = fundingBalancesResult.find(
        (result) => result.currency.base,
      )?.smartCheckoutResult!;
      const data = getTopUpViewData(
        smartCheckoutResult.transactionRequirements,
      );
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.TOP_UP_VIEW,
            data,
          },
        },
      });
    } catch (error: any) {
      goToErrorView(SaleErrorTypes.FUNDING_ROUTE_EXECUTE_ERROR, error);
    }
  }, [fundingBalances, loadingBalances, fundingBalancesResult]);

  // Refresh conversion rates, once all balances are loaded
  useEffect(() => {
    if (
      !cryptoFiatDispatch
      || fundingBalances.length === 0
      || loadingBalances
    ) {
      return;
    }

    const tokenSymbols = fundingBalances.map(
      ({ fundingItem }) => fundingItem.token.symbol,
    );

    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols,
      },
    });
  }, [cryptoFiatDispatch, fundingBalances, loadingBalances]);

  // Trigger page loaded event
  useEffect(() => {
    if (loadingBalances || !items.length || !cryptoFiatState.conversions) {
      return;
    }

    const tokens = fundingBalances.map(
      ({ fundingItem }) => getPaymentTokenDetails(fundingItem, cryptoFiatState.conversions),
    );

    sendPageView(SaleWidgetViews.ORDER_SUMMARY, {
      subView: OrderSummarySubViews.REVIEW_ORDER,
      tokens,
      items,
      collectionName,
    });
    // checkoutPrimarySaleOrderSummaryViewed
  }, [items, collectionName, fundingBalances, loadingBalances, cryptoFiatState]);

  return (
    <Box>
      {subView === OrderSummarySubViews.INIT && (
        <LoadingView
          loadingText={t(
            'views.ORDER_SUMMARY.loading.balances',
          )}
        />
      )}
      {subView === OrderSummarySubViews.REVIEW_ORDER && (
        <OrderReview
          fundingBalances={fundingBalances}
          conversions={cryptoFiatState.conversions}
          collectionName={collectionName}
          loadingBalances={loadingBalances}
          onBackButtonClick={goBackToPaymentMethods}
          onProceedToBuy={onProceedToBuy}
          transactionRequirement={transactionRequirement}
          onPayWithCard={onPayWithCard}
        />
      )}
      {subView === OrderSummarySubViews.EXECUTE_FUNDING_ROUTE && (
        <FundingRouteExecute
          fundingRouteStep={viewState.view.data.fundingBalance}
          onFundingRouteExecuted={onFundingRouteExecuted}
        />
      )}
    </Box>
  );
}
