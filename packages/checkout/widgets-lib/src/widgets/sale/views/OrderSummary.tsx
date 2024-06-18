import { Box, Heading } from '@biom3/react';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from 'context/view-context/ViewContext';
import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { getRemoteImage } from 'lib/utils';
import { useHandover } from 'lib/hooks/useHandover';
import { HandoverTarget } from 'context/handover-context/HandoverContext';
import {
  OrderSummarySubViews,
  SaleWidgetViews,
} from '../../../context/view-context/SaleViewContextTypes';
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
import { LoadingHandover } from './LoadingHandover';

type OrderSummaryProps = {
  subView: OrderSummarySubViews;
};

export function OrderSummary({ subView }: OrderSummaryProps) {
  const { t } = useTranslation();
  const { sendProceedToPay } = useSaleEvent();
  const {
    fromTokenAddress,
    collectionName,
    goToErrorView,
    goBackToPaymentMethods,
    sign,
    selectedCurrency,
    setPaymentMethod,
    environment,
  } = useSaleContext();

  const { viewDispatch, viewState } = useContext(ViewContext);
  const { cryptoFiatDispatch, cryptoFiatState } = useContext(CryptoFiatContext);
  const { addHandover, closeHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

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
    addHandover({
      animationUrl: getRemoteImage(environment, '/handover.riv'),
      animationName: 'Start',
      children: (
        <Heading sx={{ px: 'base.spacing.x6' }}>
          {t('views.PAYMENT_METHODS.handover.initial')}
        </Heading>
      ),
    });

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

    closeHandover();
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
      setPaymentMethod(undefined);
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
      goToErrorView(SaleErrorTypes.SERVICE_BREAKDOWN, error);
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

  return (
    <Box>
      {subView === OrderSummarySubViews.INIT && (
        <LoadingHandover
          text={t('views.ORDER_SUMMARY.loading.balances')}
          environment={environment}
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
