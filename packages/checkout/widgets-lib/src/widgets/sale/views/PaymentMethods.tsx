import { Box, Heading } from '@biom3/react';
import { useContext, useEffect } from 'react';

import { isAddressSanctioned, SalePaymentTypes } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import {
  OrderSummarySubViews,
  SaleWidgetViews,
} from '../../../context/view-context/SaleViewContextTypes';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';

import { PaymentOptions } from '../components/PaymentOptions';
import { useSaleContext } from '../context/SaleContextProvider';
import { useSaleEvent } from '../hooks/useSaleEvents';
import { SaleErrorTypes, SignPaymentTypes } from '../types';

export function PaymentMethods() {
  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);
  const {
    sign,
    goToErrorView,
    paymentMethod,
    setPaymentMethod,
    invalidParameters,
    disabledPaymentTypes,
    hideExcludedPaymentTypes,
    riskAssessment,
  } = useSaleContext();
  const {
    sendFailedEvent, sendPageView, sendCloseEvent, sendSelectedPaymentMethod,
  } = useSaleEvent();

  const handleOptionClick = (type: SalePaymentTypes) => {
    setPaymentMethod(type);
  };

  useEffect(() => {
    if (paymentMethod) {
      sendSelectedPaymentMethod(paymentMethod, SaleWidgetViews.PAYMENT_METHODS); // checkoutPrimarySalePaymentMethods_SelectMenuItem
    }

    if (
      paymentMethod
      && [SalePaymentTypes.DEBIT, SalePaymentTypes.CREDIT].includes(paymentMethod)
    ) {
      if (riskAssessment && isAddressSanctioned(riskAssessment)) {
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

        setPaymentMethod(undefined);

        return;
      }

      sign(SignPaymentTypes.FIAT, undefined, () => {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SaleWidgetViews.PAY_WITH_CARD,
            },
          },
        });
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.LOADING_VIEW,
            data: { loadingText: t('views.PAYMENT_METHODS.loading.ready1') },
          },
        },
      });
    }

    if (paymentMethod && paymentMethod === SalePaymentTypes.CRYPTO) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.ORDER_SUMMARY,
            subView: OrderSummarySubViews.INIT,
          },
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => sendPageView(SaleWidgetViews.PAYMENT_METHODS), []); // checkoutPrimarySalePaymentMethodsViewed
  useEffect(() => {
    if (!invalidParameters) return;
    goToErrorView(SaleErrorTypes.INVALID_PARAMETERS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invalidParameters]);

  return (
    <SimpleLayout
      testId="payment-methods"
      header={(
        <HeaderNavigation
          onCloseButtonClick={() => sendCloseEvent(SaleWidgetViews.PAYMENT_METHODS)} // checkoutPrimarySalePaymentMethods_CloseButtonPressed
        />
      )}
      footer={<FooterLogo />}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: 'base.spacing.x2',
          paddingY: 'base.spacing.x8',
          rowGap: 'base.spacing.x4',
        }}
      >
        <Heading
          size="small"
          sx={{
            paddingX: 'base.spacing.x4',
          }}
        >
          {t('views.PAYMENT_METHODS.header.heading')}
        </Heading>
        <Box sx={{ paddingX: 'base.spacing.x2' }}>
          <PaymentOptions
            hideDisabledOptions={hideExcludedPaymentTypes}
            disabledOptions={disabledPaymentTypes}
            onClick={handleOptionClick}
          />
        </Box>
      </Box>
    </SimpleLayout>
  );
}
