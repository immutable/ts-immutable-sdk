import { Box, Heading } from '@biom3/react';
import { useCallback, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { parseUnits } from 'ethers';
import { SalePaymentTypes } from '@imtbl/checkout-sdk';

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
import {
  TransactionMethod,
  getRiveAnimationName,
  transactionRiveAnimations,
} from '../hooks/useHandoverSteps';
import { HandoverTarget } from '../../../context/handover-context/HandoverContext';
import { ViewContext, ViewActions, SharedViews } from '../../../context/view-context/ViewContext';
import { useHandover } from '../../../lib/hooks/useHandover';
import { errorToString, getRemoteRive } from '../../../lib/utils';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { getPricingBySymbol } from '../utils/pricing';
import { fetchRiskAssessmentV2, isSingleAddressSanctioned } from '../../../lib/riskAssessment';

type OrderSummaryProps = {
  subView: OrderSummarySubViews;
};

export function OrderSummary({ subView }: OrderSummaryProps) {
  const { t } = useTranslation();
  const { sendFailedEvent, sendProceedToPay, sendInsufficientFunds } = useSaleEvent();
  const {
    fromTokenAddress,
    collectionName,
    goToErrorView,
    goBackToPaymentMethods,
    sign,
    selectedCurrency,
    setPaymentMethod,
    environment,
    paymentMethod,
    orderQuote,
    items,
  } = useSaleContext();

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

  const { viewDispatch, viewState } = useContext(ViewContext);
  const { cryptoFiatDispatch, cryptoFiatState } = useContext(CryptoFiatContext);
  const { addHandover, closeHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  const onPayWithCard = (paymentType: SalePaymentTypes) => goBackToPaymentMethods(paymentType);

  const signAndProceed = (tokenAddress?: string) => {
    addHandover({
      animationUrl: getRemoteRive(
        environment,
        getRiveAnimationName(TransactionMethod.APPROVE),
      ),
      inputValue:
        transactionRiveAnimations[TransactionMethod.APPROVE].inputValues.start,
      children: (
        <Heading sx={{ px: 'base.spacing.x6' }}>
          {t('views.PAYMENT_METHODS.handover.initial')}
        </Heading>
      ),
    });
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

  const onProceedToBuy = useCallback(async (fundingBalance: FundingBalance) => {
    if (!checkout || !provider) return;

    const { type, fundingItem } = fundingBalance;

    // Calculate total amount from all order items for risk assessment
    // Based on how item prices are calculated in OrderItems.tsx
    const totalAmount = items.reduce((total, item) => {
      const pricing = getPricingBySymbol(
        fundingItem.token.symbol,
        orderQuote?.products[item.productId]?.pricing,
        cryptoFiatState.conversions,
      );
      const itemAmount = pricing?.amount || 0;
      return total + itemAmount;
    }, 0);

    // Perform sanctions check once we have valid asset and amount data
    const address = await (await provider?.getSigner())?.getAddress();

    if (!address) {
      return;
    }

    if (!fundingItem.token.address) {
      throw new Error('Invalid data: fundingItem.token.address is missing');
    }

    const riskAssessmentData = [{
      address,
      tokenAddr: fundingItem.token.address,
      amount: parseUnits(totalAmount.toString(), fundingItem.token.decimals),
    }];

    const riskAssessment = await fetchRiskAssessmentV2(riskAssessmentData, checkout.config);

    if (riskAssessment && isSingleAddressSanctioned(riskAssessment, address)) {
      const error = new Error('Sanctioned address');
      sendFailedEvent(error.message, {}, [], undefined, { riskAssessment, paymentMethod });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.SERVICE_UNAVAILABLE_ERROR_VIEW,
            error,
          },
        },
      });

      return;
    }

    sendProceedToPay(
      SaleWidgetViews.ORDER_SUMMARY,
      fundingBalance,
      cryptoFiatState.conversions,
    );
    // checkoutPrimarySaleProceedToPay

    if (type === FundingBalanceType.SUFFICIENT) {
      signAndProceed(fundingItem.token.address);
      return;
    }

    closeHandover();
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
  }, [paymentMethod, sendFailedEvent, viewDispatch, checkout, provider]);

  const {
    fundingBalances,
    loadingBalances,
    fundingBalancesResult,
    transactionRequirement,
    gasFees,
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

      // Send analytics event to track insufficient funds
      sendInsufficientFunds(
        SaleWidgetViews.ORDER_SUMMARY,
        data,
      );

      closeHandover();
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.TOP_UP_VIEW,
            data,
          },
        },
      });
    } catch (error: unknown) {
      goToErrorView(SaleErrorTypes.SERVICE_BREAKDOWN, {
        error: errorToString(error),
      });
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
          animationUrl={getRemoteRive(environment, '/preparing_order.riv')}
          inputValue={0}
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
          gasFees={gasFees}
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
