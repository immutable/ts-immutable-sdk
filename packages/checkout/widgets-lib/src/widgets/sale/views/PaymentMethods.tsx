import { useCallback, useContext, useEffect } from 'react';
import { Box, Heading } from '@biom3/react';

import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text as textConfig } from '../../../resources/text/textConfig';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';

import {
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../../context/view-context/ViewContext';

import { PaymentOptions } from '../components/PaymentOptions';

import { useSaleContext } from '../context/SaleContextProvider';
import { PaymentTypes } from '../types';
import { useSaleEvent } from '../hooks/useSaleEvents';

export function PaymentMethods() {
  const text = { methods: textConfig.views[SaleWidgetViews.PAYMENT_METHODS] };
  const { viewDispatch } = useContext(ViewContext);
  const { paymentMethod, setPaymentMethod, sign } = useSaleContext();
  const { sendPageView, sendCloseEvent, sendSelectedPaymentMethod } = useSaleEvent();

  const handleOptionClick = (type: PaymentTypes) => setPaymentMethod(type);

  const handleGoToPaymentView = useCallback((type: PaymentTypes, signed = false) => {
    if (type === PaymentTypes.CRYPTO && !signed) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.PAY_WITH_COINS,
          },
        },
      });
    }

    if (type === PaymentTypes.FIAT && !signed) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.LOADING_VIEW,
            data: { loadingText: text.methods.loading.ready },
          },
        },
      });
    }

    if (type === PaymentTypes.FIAT && signed) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SaleWidgetViews.PAY_WITH_CARD,
          },
        },
      });
    }
  }, []);

  useEffect(() => {
    if (paymentMethod) {
      sendSelectedPaymentMethod(paymentMethod, SaleWidgetViews.PAYMENT_METHODS);
      sign(paymentMethod, (response) => handleGoToPaymentView(paymentMethod, !!response));
      handleGoToPaymentView(paymentMethod);
    }
  }, [paymentMethod]);

  useEffect(() => sendPageView(SaleWidgetViews.PAYMENT_METHODS), []);

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
          {text.methods.header.heading}
        </Heading>
        <Box sx={{ paddingX: 'base.spacing.x2' }}>
          <PaymentOptions onClick={handleOptionClick} />
        </Box>
      </Box>
    </SimpleLayout>
  );
}
