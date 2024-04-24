import { Box, Heading } from '@biom3/react';
import { useContext, useEffect, useState } from 'react';

import { SalePaymentTypes } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import {
  FundWithSmartCheckoutSubViews,
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
import { CreditCardWarningDrawer } from '../components/CreditCardWarningDrawer';

export function PaymentMethods() {
  const [showCreditCardWarning, setShowCreditCardWarning] = useState(false);

  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);
  const {
    sign,
    goToErrorView,
    paymentMethod,
    setPaymentMethod,
    disabledPaymentTypes,
    invalidParameters,
    multicurrency,
  } = useSaleContext();
  const { sendPageView, sendCloseEvent, sendSelectedPaymentMethod } = useSaleEvent();

  const handleOptionClick = (type: SalePaymentTypes) => {
    if (type === SalePaymentTypes.CREDIT) {
      setShowCreditCardWarning(true);
    } else {
      setPaymentMethod(type);
    }
  };

  useEffect(() => {
    if (paymentMethod) {
      sendSelectedPaymentMethod(paymentMethod, SaleWidgetViews.PAYMENT_METHODS);
    }

    if (
      paymentMethod
      && [SalePaymentTypes.DEBIT, SalePaymentTypes.CREDIT].includes(paymentMethod)
    ) {
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
      if (multicurrency) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: SaleWidgetViews.ORDER_SUMMARY,
              subView: OrderSummarySubViews.INIT,
            },
          },
        });
        return;
      }

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.FUND_WITH_SMART_CHECKOUT,
            subView: FundWithSmartCheckoutSubViews.INIT,
          },
        },
      });
    }
  }, [paymentMethod]);

  useEffect(() => sendPageView(SaleWidgetViews.PAYMENT_METHODS), []);
  useEffect(() => {
    if (!invalidParameters) return;
    goToErrorView(SaleErrorTypes.INVALID_PARAMETERS);
  }, [invalidParameters]);

  return (
    <SimpleLayout
      testId="payment-methods"
      header={(
        <HeaderNavigation
          onCloseButtonClick={() => sendCloseEvent(SaleWidgetViews.PAYMENT_METHODS)}
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
            disabledOptions={disabledPaymentTypes}
            onClick={handleOptionClick}
          />
        </Box>
      </Box>
      <CreditCardWarningDrawer
        visible={showCreditCardWarning}
        setShowCreditCardWarning={setShowCreditCardWarning}
        setPaymentMethod={setPaymentMethod}
      />
    </SimpleLayout>
  );
}
