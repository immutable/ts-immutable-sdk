import { useCallback, useContext, useEffect } from 'react';
import { Box, Heading } from '@biom3/react';

import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { text as textConfig } from '../../../resources/text/textConfig';
import { FundWithSmartCheckoutSubViews, SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';

import {
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../../context/view-context/ViewContext';

import { sendSaleWidgetCloseEvent } from '../SaleWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { PaymentOptions } from '../components/PaymentOptions';

import { useSaleContext } from '../context/SaleContextProvider';
import { PaymentTypes } from '../types';

export function PaymentMethods() {
  const text = { methods: textConfig.views[SaleWidgetViews.PAYMENT_METHODS] };
  const { viewDispatch } = useContext(ViewContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { paymentMethod, setPaymentMethod, sign } = useSaleContext();

  const handleOptionClick = (type: PaymentTypes) => setPaymentMethod(type);

  const handleGoToPaymentView = useCallback((type: PaymentTypes, signed = false) => {
    if (type === PaymentTypes.CRYPTO) {
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

    if (type === PaymentTypes.FIAT && !signed) {
      sign(type, (response) => handleGoToPaymentView(type, !!response));

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
      handleGoToPaymentView(paymentMethod);
    }
  }, [paymentMethod]);

  return (
    <SimpleLayout
      testId="payment-methods"
      header={(
        <HeaderNavigation
          onCloseButtonClick={() => sendSaleWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box
        id="payment-methods-content"
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
