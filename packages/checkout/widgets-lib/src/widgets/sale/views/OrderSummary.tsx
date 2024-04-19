import { Box } from '@biom3/react';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SharedViews, ViewActions, ViewContext } from 'context/view-context/ViewContext';
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
import { useTokenBalances } from '../hooks/useTokenBalances';
import { getTopUpViewData } from '../functions/getTopUpViewData';
import { SaleErrorTypes } from '../types';

type OrderSummaryProps = {
  subView: OrderSummarySubViews;
};

export function OrderSummary({ subView }: OrderSummaryProps) {
  const { t } = useTranslation();
  const { fromTokenAddress, collectionName, goToErrorView } = useSaleContext();

  const { viewDispatch } = useContext(ViewContext);
  const { cryptoFiatDispatch, cryptoFiatState } = useContext(CryptoFiatContext);

  const {
    balances, loadingBalances, queryBalances, balancesResult,
  } = useTokenBalances();

  useEffect(() => {
    if (loadingBalances || !balancesResult.length) return;
    if (balances.length > 0) return;

    try {
      const smartCheckoutResult = balancesResult.find((result) => result.currency.base)?.smartCheckoutResult!;
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.TOP_UP_VIEW,
            data: getTopUpViewData(smartCheckoutResult.transactionRequirements),
          },
        },
      });
    } catch (error: any) {
      goToErrorView(SaleErrorTypes.SMART_CHECKOUT_EXECUTE_ERROR, error);
    }
  }, [balances, loadingBalances, balancesResult]);

  useEffect(() => {
    if (subView !== OrderSummarySubViews.INIT || !fromTokenAddress) return;
    queryBalances();
  }, [subView, fromTokenAddress]);

  useEffect(() => {
    if (balances.length === 0) return;

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SaleWidgetViews.ORDER_SUMMARY,
          subView: OrderSummarySubViews.REVIEW_ORDER,
        },
      },
    });
  }, [balances]);

  useEffect(() => {
    // refresh conversion rates
    if (!cryptoFiatDispatch || balances.length === 0) {
      return;
    }

    const tokenSymbols = balances.map(({ fundingItem }) => fundingItem.token.symbol);

    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols,
      },
    });
  }, [cryptoFiatDispatch, balances]);

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
          currencies={balances}
          conversions={cryptoFiatState.conversions}
          collectionName={collectionName}
        />
      )}
    </Box>
  );
}
