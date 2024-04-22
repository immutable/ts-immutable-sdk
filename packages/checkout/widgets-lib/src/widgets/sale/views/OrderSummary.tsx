import { Box } from '@biom3/react';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewActions, ViewContext } from 'context/view-context/ViewContext';
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
import { allCurrencies } from './balances.mock';

type OrderSummaryProps = {
  subView: OrderSummarySubViews;
};

export function OrderSummary({ subView }: OrderSummaryProps) {
  const { t } = useTranslation();
  const {
    smartCheckoutResult,
    querySmartCheckout,
    fromTokenAddress,
    collectionName,
  } = useSaleContext();

  const { viewDispatch } = useContext(ViewContext);
  const { cryptoFiatDispatch, cryptoFiatState } = useContext(CryptoFiatContext);

  useEffect(() => {
    if (subView !== OrderSummarySubViews.INIT || !fromTokenAddress) return;
    querySmartCheckout();
  }, [subView, fromTokenAddress]);

  useEffect(() => {
    if (!smartCheckoutResult) return;

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SaleWidgetViews.ORDER_SUMMARY,
          subView: OrderSummarySubViews.REVIEW_ORDER,
        },
      },
    });
  }, [smartCheckoutResult]);

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

  return (
    <Box>
      {subView === OrderSummarySubViews.INIT && (
        <LoadingView
          loadingText={t(
            'views.FUND_WITH_SMART_CHECKOUT.loading.checkingBalances',
          )}
        />
      )}
      {subView === OrderSummarySubViews.REVIEW_ORDER && (
        <OrderReview
          currencies={allCurrencies}
          conversions={cryptoFiatState.conversions}
          collectionName={collectionName}
        />
      )}
    </Box>
  );
}
